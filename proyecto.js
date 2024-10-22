const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');  // Para manejar rutas de archivos
const app = express();
const port = 3000;

// Middleware para manejar JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Para procesar formularios

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

/** Rutas para Autenticación **/

// Ruta para servir el formulario de login
app.get('/', (req, res) => {
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

/** Rutas para Usuarios **/

// Obtener todos los usuarios
app.get('/usuarios', (req, res) => {
    db.query('SELECT * FROM usuarios', (err, results) => {
        if (err) {
            console.error('Error al obtener usuarios:', err);
            return res.status(500).send('Error en el servidor');
        }
        res.json(results);
    });
});

// Crear un nuevo usuario
app.post('/usuarios', (req, res) => {
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
            res.json({ id: result.insertId, ...nuevoUsuario });
        });
    });
});

// Actualizar un usuario existente
app.put('/usuarios/:id', (req, res) => {
    const { nombre, email, rol } = req.body;

    if (!nombre || !email || !rol) {
        return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }

    db.query('UPDATE usuarios SET nombre = ?, email = ?, rol = ? WHERE id = ?', [nombre, email, rol, req.params.id], (err, result) => {
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

// Eliminar un usuario
app.delete('/usuarios/:id', (req, res) => {
    db.query('DELETE FROM usuarios WHERE id = ?', [req.params.id], (err, result) => {
        if (err) {
            console.error('Error al eliminar el usuario:', err);
            return res.status(500).send('Error en el servidor');
        }

        if (result.affectedRows === 0) {
            return res.status(404).send('Usuario no encontrado');
        }

        res.send(`Usuario con ID: ${req.params.id} ha sido eliminado`);
    });
});

/** Rutas para Productos **/

// Obtener todos los productos
app.get('/productos', (req, res) => {
    db.query('SELECT * FROM productos', (err, results) => {
        if (err) {
            console.error('Error al obtener productos:', err);
            return res.status(500).send('Error en el servidor');
        }
        res.json(results);
    });
});

// Crear un nuevo producto
app.post('/productos', (req, res) => {
    const nuevoProducto = req.body;

    if (!nuevoProducto.nombre || !nuevoProducto.precio || !nuevoProducto.descripcion) {
        return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }

    db.query('INSERT INTO productos SET ?', nuevoProducto, (err, result) => {
        if (err) {
            console.error('Error al insertar el producto:', err);
            return res.status(500).send('Error en el servidor');
        }
        res.json({ id: result.insertId, ...nuevoProducto });
    });
});

// Actualizar un producto existente
app.put('/productos/:id', (req, res) => {
    const nuevoDatos = req.body;

    db.query('UPDATE productos SET ? WHERE id = ?', [nuevoDatos, req.params.id], (err, result) => {
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

// Eliminar un producto
app.delete('/productos/:id', (req, res) => {
    db.query('DELETE FROM productos WHERE id = ?', [req.params.id], (err, result) => {
        if (err) {
            console.error('Error al eliminar el producto:', err);
            return res.status(500).send('Error en el servidor');
        }

        if (result.affectedRows === 0) {
            return res.status(404).send('Producto no encontrado');
        }

        res.send(`Producto con ID: ${req.params.id} ha sido eliminado`);
    });
});

/** Rutas para Pedidos **/

// Obtener todos los pedidos
app.get('/pedidos', (req, res) => {
    db.query('SELECT * FROM pedidos', (err, results) => {
        if (err) {
            console.error('Error al obtener pedidos:', err);
            return res.status(500).send('Error en el servidor');
        }
        res.json(results);
    });
});

// Crear un nuevo pedido
app.post('/pedidos', (req, res) => {
    const nuevoPedido = req.body;

    if (!nuevoPedido.usuario_id || !nuevoPedido.producto_id || !nuevoPedido.cantidad) {
        return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }

    db.query('INSERT INTO pedidos SET ?', nuevoPedido, (err, result) => {
        if (err) {
            console.error('Error al insertar el pedido:', err);
            return res.status(500).send('Error en el servidor');
        }
        res.json({ id: result.insertId, ...nuevoPedido });
    });
});

// Actualizar un pedido existente
app.put('/pedidos/:id', (req, res) => {
    const nuevoDatos = req.body;

    db.query('UPDATE pedidos SET ? WHERE id = ?', [nuevoDatos, req.params.id], (err, result) => {
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

// Cancelar un pedido
app.delete('/pedidos/:id', (req, res) => {
    db.query('DELETE FROM pedidos WHERE id = ?', [req.params.id], (err, result) => {
        if (err) {
            console.error('Error al cancelar el pedido:', err);
            return res.status(500).send('Error en el servidor');
        }

        if (result.affectedRows === 0) {
            return res.status(404).send('Pedido no encontrado');
        }

        res.send(`Pedido con ID: ${req.params.id} ha sido cancelado`);
    });
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
