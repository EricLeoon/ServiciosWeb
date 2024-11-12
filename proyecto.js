const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const cors = require('cors');
const app = express();
const port = 3000;
const host = '0.0.0.0';

// Middleware para manejar JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración para servir archivos estáticos
app.use(express.static(path.join(__dirname)));

// Configura CORS para aceptar solo conexiones de tu red local
const corsOptions = {
    origin: /^http:\/\/10\.168\.3\.\d+$/,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Conexión a la base de datos MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'leon2929',
    database: 'purificadora_db'
});

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

// Nueva ruta para verificar el token
app.post('/verify-token', authenticateToken, (req, res) => {
    res.sendStatus(200); // Token válido
});


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

    // Comienza la consulta de eliminación en la base de datos
    db.query('DELETE FROM usuarios WHERE id = ?', [userId], (err, result) => {
        if (err) {
            // Si hay un error de SQL, se muestra aquí
            console.error('Error al eliminar el usuario:', err);
            return res.status(500).json({ message: 'Error en el servidor al eliminar el usuario' });
        }

        // Verifica si el usuario fue encontrado y eliminado
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Enviar respuesta exitosa al cliente
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
    const { nombre, precio, descripcion } = req.body;

    if (!nombre || !precio || !descripcion) {
        return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }

    const nuevoProducto = { nombre, precio, descripcion };
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
    const pedidoId = req.params.id;

    const sql = `
        SELECT p.id, p.cantidad, u.nombre AS cliente_nombre, prod.nombre AS producto_nombre
        FROM pedidos p
        JOIN usuarios u ON p.usuario_id = u.id
        JOIN productos prod ON p.producto_id = prod.id
        WHERE p.id = ?
    `;

    db.query(sql, [pedidoId], (err, results) => {
        if (err) {
            console.error('Error al obtener el pedido:', err);
            return res.status(500).json({ message: 'Error en el servidor' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        res.json(results[0]);
    });
});


// Crear un nuevo pedido (protegida)
app.post('/pedidos', authenticateToken, (req, res) => {
    const pedidos = req.body;

    if (!Array.isArray(pedidos) || pedidos.length === 0) {
        return res.status(400).json({ message: 'Se requiere una lista de pedidos.' });
    }

    const sql = 'INSERT INTO pedidos (usuario_id, producto_id, cantidad, fecha) VALUES ?';
    const values = pedidos.map(pedido => [pedido.usuario_id, pedido.producto_id, pedido.cantidad, new Date()]);

    db.query(sql, [values], (err, result) => {
        if (err) {
            console.error('Error al insertar pedidos:', err);
            return res.status(500).send('Error en el servidor');
        }
        res.json({ message: 'Pedidos creados con éxito', affectedRows: result.affectedRows });
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

// Actualizar un pedido existente (protegida)
app.put('/pedidos/:id', authenticateToken, (req, res) => {
    const pedidoId = req.params.id;
    const { usuario_id, producto_id, cantidad } = req.body;

    // Verifica si todos los campos requeridos están presentes
    if (!usuario_id || !producto_id || !cantidad) {
        return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }

    console.log('Datos recibidos para actualizar el pedido:', { usuario_id, producto_id, cantidad, pedidoId });

    db.query(
        'UPDATE pedidos SET usuario_id = ?, producto_id = ?, cantidad = ? WHERE id = ?', 
        [usuario_id, producto_id, cantidad, pedidoId], 
        (err, result) => {
            if (err) {
                console.error('Error al actualizar el pedido:', err);
                return res.status(500).json({ message: 'Error en el servidor al actualizar el pedido' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Pedido no encontrado' });
            }

            res.json({ message: 'Pedido actualizado correctamente' });
    });
});

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

        res.json({ message: `Pedido con ID ${pedidoId} eliminado exitosamente` });
    });
});


// Iniciar el servidor
app.listen(port, '10.168.3.97', () => {
    console.log(`Servidor escuchando en http://10.168.3.97:${port}`);
});

