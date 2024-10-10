const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

// Middleware para manejar JSON
app.use(express.json());

// Función para leer datos de JSON
const readData = () => {
    try {
        const data = fs.readFileSync('data.json');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error al leer el archivo data.json:', err);
        return {
            admins: [],
            productos: [],
            clientes: [],
            pedidos: [],
            inventario: {
                garrafones: 100,
                tapas: 200,
                agua: 500
            }
        };
    }
};

// Función para escribir datos en JSON
const writeData = (data) => {
    try {
        fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error al escribir en el archivo data.json:', err);
    }
};

// Leer datos iniciales
let { admins, productos, clientes, pedidos, inventario } = readData();

// Función para generar IDs únicos
const generateId = () => Math.floor(Math.random() * 10000);

/** Rutas para Autenticación **/

// Manejo de login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === '1234') {
        res.send('Login exitoso');
    } else {
        res.status(401).send('Credenciales incorrectas');
    }
});

/** Rutas para Administradores **/

// Obtener la lista de administradores
app.get('/admin', (req, res) => {
    res.json(admins);
});

// Obtener un administrador por su ID
app.get('/admin/:id', (req, res) => {
    const admin = admins.find(a => a.id === parseInt(req.params.id));
    if (admin) {
        res.json(admin);
    } else {
        res.status(404).send('Administrador no encontrado');
    }
});

// Crear un nuevo administrador
app.post('/admin', (req, res) => {
    const nuevoAdmin = { id: generateId(), ...req.body };
    admins.push(nuevoAdmin);
    writeData({ admins, productos, clientes, pedidos, inventario });
    res.json(nuevoAdmin);
});

// Actualizar un administrador existente
app.put('/admin/:id', (req, res) => {
    const admin = admins.find(a => a.id === parseInt(req.params.id));
    if (admin) {
        Object.assign(admin, req.body);
        writeData({ admins, productos, clientes, pedidos, inventario });
        res.json(admin);
    } else {
        res.status(404).send('Administrador no encontrado');
    }
});

// Eliminar un administrador
app.delete('/admin/:id', (req, res) => {
    admins = admins.filter(a => a.id !== parseInt(req.params.id));
    writeData({ admins, productos, clientes, pedidos, inventario });
    res.send(`Administrador con ID: ${req.params.id} ha sido eliminado`);
});

/** Rutas para Productos **/

// Obtener todos los productos
app.get('/productos', (req, res) => {
    res.json(productos);
});

// Obtener un producto por su ID
app.get('/productos/:id', (req, res) => {
    const producto = productos.find(p => p.id === parseInt(req.params.id));
    if (producto) {
        res.json(producto);
    } else {
        res.status(404).send('Producto no encontrado');
    }
});

// Crear un nuevo producto
app.post('/productos', (req, res) => {
    const nuevoProducto = { id: generateId(), ...req.body };
    productos.push(nuevoProducto);
    writeData({ admins, productos, clientes, pedidos, inventario });
    res.json(nuevoProducto);
});

// Actualizar un producto existente
app.put('/productos/:id', (req, res) => {
    const producto = productos.find(p => p.id === parseInt(req.params.id));
    if (producto) {
        Object.assign(producto, req.body);
        writeData({ admins, productos, clientes, pedidos, inventario });
        res.json(producto);
    } else {
        res.status(404).send('Producto no encontrado');
    }
});

// Eliminar un producto
app.delete('/productos/:id', (req, res) => {
    productos = productos.filter(p => p.id !== parseInt(req.params.id));
    writeData({ admins, productos, clientes, pedidos, inventario });
    res.send(`Producto con ID: ${req.params.id} ha sido eliminado`);
});

/** Rutas para Clientes **/

// Obtener todos los clientes
app.get('/clientes', (req, res) => {
    res.json(clientes);
});

// Obtener un cliente por su ID
app.get('/clientes/:id', (req, res) => {
    const cliente = clientes.find(c => c.id === parseInt(req.params.id));
    if (cliente) {
        res.json(cliente);
    } else {
        res.status(404).send('Cliente no encontrado');
    }
});

// Crear un nuevo cliente
app.post('/clientes', (req, res) => {
    const nuevoCliente = { id: generateId(), ...req.body };
    clientes.push(nuevoCliente);
    writeData({ admins, productos, clientes, pedidos, inventario });
    res.json(nuevoCliente);
});

// Actualizar un cliente existente
app.put('/clientes/:id', (req, res) => {
    const cliente = clientes.find(c => c.id === parseInt(req.params.id));
    if (cliente) {
        Object.assign(cliente, req.body);
        writeData({ admins, productos, clientes, pedidos, inventario });
        res.json(cliente);
    } else {
        res.status(404).send('Cliente no encontrado');
    }
});

// Eliminar un cliente
app.delete('/clientes/:id', (req, res) => {
    clientes = clientes.filter(c => c.id !== parseInt(req.params.id));
    writeData({ admins, productos, clientes, pedidos, inventario });
    res.send(`Cliente con ID: ${req.params.id} ha sido eliminado`);
});

/** Rutas para Pedidos **/

// Obtener todos los pedidos
app.get('/pedidos', (req, res) => {
    res.json(pedidos);
});

// Obtener un pedido por su ID
app.get('/pedidos/:id', (req, res) => {
    const pedido = pedidos.find(p => p.id === parseInt(req.params.id));
    if (pedido) {
        res.json(pedido);
    } else {
        res.status(404).send('Pedido no encontrado');
    }
});

// Crear un nuevo pedido
app.post('/pedidos', (req, res) => {
    const nuevoPedido = { id: generateId(), ...req.body };
    pedidos.push(nuevoPedido);
    writeData({ admins, productos, clientes, pedidos, inventario });
    res.json(nuevoPedido);
});

// Actualizar un pedido existente
app.put('/pedidos/:id', (req, res) => {
    const pedido = pedidos.find(p => p.id === parseInt(req.params.id));
    if (pedido) {
        Object.assign(pedido, req.body);
        writeData({ admins, productos, clientes, pedidos, inventario });
        res.json(pedido);
    } else {
        res.status(404).send('Pedido no encontrado');
    }
});

// Cancelar un pedido
app.delete('/pedidos/:id', (req, res) => {
    pedidos = pedidos.filter(p => p.id !== parseInt(req.params.id));
    writeData({ admins, productos, clientes, pedidos, inventario });
    res.send(`Pedido con ID: ${req.params.id} ha sido cancelado`);
});

/** Ruta para el inventario **/

// Obtener inventario
app.get('/inventario', (req, res) => {
    res.json(inventario);
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
