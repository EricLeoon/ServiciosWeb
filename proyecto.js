const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const app = express();
const port = 3000;

// Middleware para manejar JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión a la base de datos MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'leon2929',
    database: 'purificadora_db'
});

// Conectar a la base de datos
db.connect(err => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos MySQL.');
});

// Función para generar tokens JWT
const generateToken = (user) => {
    return jwt.sign({ id: user.id, rol: user.rol }, 'tu_secreto_jwt', { expiresIn: '1h' });
};

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) return res.status(403).send('Acceso prohibido: Token no proporcionado');

    jwt.verify(token, 'tu_secreto_jwt', (err, user) => {
        if (err) return res.status(403).send('Acceso prohibido: Token inválido');
        req.user = user;
        next();
    });
};

/* Rutas para Autenticación */

// Ruta para servir el formulario de login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Manejo de login
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
    }

    db.query('SELECT * FROM usuarios WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error('Error en la consulta:', err);
            return res.status(500).send('Error en el servidor');
        }

        if (results.length === 0) {
            return res.status(401).send('Credenciales incorrectas');
        }

        const user = results[0];

        // Comparar la contraseña hasheada
        bcrypt.compare(password, user.password, (err, match) => {
            if (err) {
                console.error('Error al comparar contraseñas:', err);
                return res.status(500).send('Error en el servidor');
            }

            if (!match) {
                return res.status(401).send('Credenciales incorrectas');
            }

            const token = generateToken(user);
            res.json({ token });
        });
    });
});

/* Rutas para Usuarios */

// Obtener todos los usuarios (protegida)
app.get('/usuarios', authenticateToken, (req, res) => {
    db.query('SELECT id, nombre, email, rol FROM usuarios', (err, results) => {
        if (err) {
            console.error('Error al obtener usuarios:', err);
            return res.status(500).send('Error en el servidor');
        }
        res.json(results);
    });
});

// Obtener usuario por ID (protegida)
app.get('/usuarios/:id', authenticateToken, (req, res) => {
    const userId = req.params.id; // Tomar el ID del parámetro de la URL
    db.query('SELECT * FROM usuarios WHERE id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Error al obtener el usuario:', err);
            return res.status(500).send('Error en el servidor');
        }

        if (results.length === 0) {
            return res.status(404).send('Usuario no encontrado');
        }

        res.json(results[0]);
    });
});

// Crear un nuevo usuario (protegida)
app.post('/usuarios', authenticateToken, (req, res) => {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password || !rol) {
        return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }

    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            console.error('Error al hashear la contraseña:', err);
            return res.status(500).send('Error en el servidor');
        }

        const nuevoUsuario = { nombre, email, password: hash, rol };
        db.query('INSERT INTO usuarios SET ?', nuevoUsuario, (err, result) => {
            if (err) {
                console.error('Error al insertar el usuario:', err);
                return res.status(500).send('Error en el servidor');
            }
            res.json({ message: 'Usuario creado', id: result.insertId });
        });
    });
});

// Actualizar un usuario existente (protegida)
app.put('/usuarios/:id', authenticateToken, (req, res) => {
    const userId = req.params.id;
    const { nombre, email, rol } = req.body;

    if (!nombre || !email || !rol) {
        return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }

    db.query('UPDATE usuarios SET nombre = ?, email = ?, rol = ? WHERE id = ?', [nombre, email, rol, userId], (err, result) => {
        if (err) {
            console.error('Error al actualizar el usuario:', err);
            return res.status(500).send('Error en el servidor');
        }

        if (result.affectedRows === 0) {
            return res.status(404).send('Usuario no encontrado');
        }

        res.send('Usuario actualizado');
    });
});

// Eliminar un usuario (protegida)
app.delete('/usuarios/:id', authenticateToken, (req, res) => {
    const userId = req.params.id;
    db.query('DELETE FROM usuarios WHERE id = ?', [userId], (err, result) => {
        if (err) {
            console.error('Error al eliminar el usuario:', err);
            return res.status(500).json({ message: 'Error en el servidor al eliminar el usuario' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({ message: 'Usuario con ID ' + userId + ' eliminado' });
    });
});

/* Rutas para Productos */

// Obtener todos los productos (protegida)
app.get('/productos', authenticateToken, (req, res) => {
    db.query('SELECT * FROM productos', (err, results) => {
        if (err) {
            console.error('Error al obtener productos:', err);
            return res.status(500).send('Error en el servidor');
        }
        res.json(results);
    });
});

// Obtener producto por ID (protegida)
app.get('/productos/:id', authenticateToken, (req, res) => {
    const productId = req.params.id; // Tomar el ID del parámetro de la URL
    db.query('SELECT * FROM productos WHERE id = ?', [productId], (err, results) => {
        if (err) {
            console.error('Error al obtener el producto:', err);
            return res.status(500).send('Error en el servidor');
        }

        if (results.length === 0) {
            return res.status(404).send('Producto no encontrado');
        }

        res.json(results[0]);
    });
});

// Crear un nuevo producto (protegida)
app.post('/productos', authenticateToken, (req, res) => {
    const nuevoProducto = req.body;

    if (!nuevoProducto.nombre || !nuevoProducto.precio || !nuevoProducto.descripcion) {
        return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }

    db.query('INSERT INTO productos SET ?', nuevoProducto, (err, result) => {
        if (err) {
            console.error('Error al insertar el producto:', err);
            return res.status(500).send('Error en el servidor');
        }
        res.json({ message: 'Producto creado', id: result.insertId });
    });
});

// Actualizar un producto existente (protegida)
app.put('/productos/:id', authenticateToken, (req, res) => {
    const productId = req.params.id;

    db.query('UPDATE productos SET ? WHERE id = ?', [req.body, productId], (err, result) => {
        if (err) {
            console.error('Error al actualizar el producto:', err);
            return res.status(500).send('Error en el servidor');
        }

        if (result.affectedRows === 0) {
            return res.status(404).send('Producto no encontrado');
        }

        res.send('Producto actualizado');
    });
});

// Eliminar un producto (protegida)
app.delete('/productos/:id', authenticateToken, (req, res) => {
    const productId = req.params.id;
    db.query('DELETE FROM productos WHERE id = ?', [productId], (err, result) => {
        if (err) {
            console.error('Error al eliminar el producto:', err);
            return res.status(500).json({ message: 'Error en el servidor al eliminar el producto' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.json({ message: 'Producto con ID ' + productId + ' eliminado' });
    });
});

/* Rutas para Pedidos */

// Obtener todos los pedidos (protegida)
app.get('/pedidos', authenticateToken, (req, res) => {
    db.query('SELECT * FROM pedidos', (err, results) => {
        if (err) {
            console.error('Error al obtener pedidos:', err);
            return res.status(500).send('Error en el servidor');
        }
        res.json(results);
    });
});

// Obtener pedido por ID (protegida)
app.get('/pedidos/:id', authenticateToken, (req, res) => {
    const pedidoId = req.params.id; // Tomar el ID del parámetro de la URL
    db.query('SELECT * FROM pedidos WHERE id = ?', [pedidoId], (err, results) => {
        if (err) {
            console.error('Error al obtener el pedido:', err);
            return res.status(500).send('Error en el servidor');
        }

        if (results.length === 0) {
            return res.status(404).send('Pedido no encontrado');
        }

        res.json(results[0]);
    });
});

// Crear un nuevo pedido (protegida)
app.post('/pedidos', authenticateToken, (req, res) => {
    const nuevoPedido = req.body;

    if (!nuevoPedido.usuario_id || !nuevoPedido.producto_id || !nuevoPedido.cantidad) {
        return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }

    db.query('INSERT INTO pedidos SET ?', nuevoPedido, (err, result) => {
        if (err) {
            console.error('Error al insertar el pedido:', err);
            return res.status(500).send('Error en el servidor');
        }
        res.json({ message: 'Pedido creado', id: result.insertId });
    });
});

// Actualizar un pedido existente (protegida)
app.put('/pedidos/:id', authenticateToken, (req, res) => {
    const pedidoId = req.params.id;

    db.query('UPDATE pedidos SET ? WHERE id = ?', [req.body, pedidoId], (err, result) => {
        if (err) {
            console.error('Error al actualizar el pedido:', err);
            return res.status(500).send('Error en el servidor');
        }

        if (result.affectedRows === 0) {
            return res.status(404).send('Pedido no encontrado');
        }

        res.send('Pedido actualizado');
    });
});

// Eliminar un pedido (protegida)
app.delete('/pedidos/:id', authenticateToken, (req, res) => {
    const pedidoId = req.params.id;
    db.query('DELETE FROM pedidos WHERE id = ?', [pedidoId], (err, result) => {
        if (err) {
            console.error('Error al eliminar el pedido:', err);
            return res.status(500).json({ message: 'Error en el servidor al eliminar el pedido' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        res.json({ message: 'Pedido con ID ' + pedidoId + ' eliminado' });
    });
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
