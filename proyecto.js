const express = require('express');
const app = express();
const port = 3000;

// Middleware para manejar JSON
app.use(express.json());

/** Rutas para Autenticación **/

// Manejo de login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Aquí deberías implementar la lógica de autenticación real, posiblemente con una base de datos
    if (username === 'admin' && password === '1234') {
        res.send('Login exitoso');
    } else {
        res.status(401).send('Credenciales incorrectas');
    }
});

/** Rutas para Administradores **/

// Obtener la lista de administradores
app.get('/admin', (req, res) => {
    res.send('Lista de administradores');
});

// Obtener un administrador por su ID
app.get('/admin/:id', (req, res) => {
    const adminId = req.params.id;
    res.send(`Detalles del administrador con ID: ${adminId}`);
});

// Crear un nuevo administrador
app.post('/admin', (req, res) => {
    const nuevoAdmin = req.body;
    res.send(`Administrador creado: ${JSON.stringify(nuevoAdmin)}`);
});

// Actualizar un administrador existente
app.put('/admin/:id', (req, res) => {
    const adminId = req.params.id;
    const adminActualizado = req.body;
    res.send(`Administrador con ID: ${adminId} actualizado a: ${JSON.stringify(adminActualizado)}`);
});

// Eliminar un administrador
app.delete('/admin/:id', (req, res) => {
    const adminId = req.params.id;
    res.send(`Administrador con ID: ${adminId} ha sido eliminado`);
});

/** Rutas para Roles y Permisos **/

// Obtener lista de roles y permisos
app.get('/roles', (req, res) => {
    res.send('Lista de roles y permisos');
});

// Crear o actualizar un rol y sus permisos
app.post('/roles', (req, res) => {
    const { rol, permisos } = req.body;
    res.send(`Rol ${rol} con permisos ${JSON.stringify(permisos)} creado o actualizado`);
});

/** Rutas para Productos **/

// Obtener todos los productos
app.get('/productos', (req, res) => {
    res.send('Lista de productos de la purificadora');
});

// Obtener un producto por su ID
app.get('/productos/:id', (req, res) => {
    const productId = req.params.id;
    res.send(`Producto con ID: ${productId}`);
});

// Crear un nuevo producto
app.post('/productos', (req, res) => {
    const nuevoProducto = req.body;
    res.send(`Producto agregado: ${JSON.stringify(nuevoProducto)}`);
});

// Actualizar un producto existente
app.put('/productos/:id', (req, res) => {
    const productId = req.params.id;
    const productoActualizado = req.body;
    res.send(`Producto con ID: ${productId} actualizado a: ${JSON.stringify(productoActualizado)}`);
});

// Eliminar un producto
app.delete('/productos/:id', (req, res) => {
    const productId = req.params.id;
    res.send(`Producto con ID: ${productId} ha sido eliminado`);
});

/** Rutas para Clientes **/

// Obtener todos los clientes
app.get('/clientes', (req, res) => {
    res.send('Lista de clientes');
});

// Obtener un cliente por su ID
app.get('/clientes/:id', (req, res) => {
    const clienteId = req.params.id;
    res.send(`Cliente con ID: ${clienteId}`);
});

// Crear un nuevo cliente
app.post('/clientes', (req, res) => {
    const nuevoCliente = req.body;
    res.send(`Cliente agregado: ${JSON.stringify(nuevoCliente)}`);
});

// Actualizar un cliente existente
app.put('/clientes/:id', (req, res) => {
    const clienteId = req.params.id;
    const clienteActualizado = req.body;
    res.send(`Cliente con ID: ${clienteId} actualizado a: ${JSON.stringify(clienteActualizado)}`);
});

// Eliminar un cliente
app.delete('/clientes/:id', (req, res) => {
    const clienteId = req.params.id;
    res.send(`Cliente con ID: ${clienteId} ha sido eliminado`);
});

/** Rutas para Pedidos **/

// Obtener todos los pedidos
app.get('/pedidos', (req, res) => {
    res.send('Lista de pedidos');
});

// Obtener un pedido por su ID
app.get('/pedidos/:id', (req, res) => {
    const pedidoId = req.params.id;
    res.send(`Pedido con ID: ${pedidoId}`);
});

// Crear un nuevo pedido
app.post('/pedidos', (req, res) => {
    const nuevoPedido = req.body;
    res.send(`Pedido creado: ${JSON.stringify(nuevoPedido)}`);
});

// Actualizar un pedido existente
app.put('/pedidos/:id', (req, res) => {
    const pedidoId = req.params.id;
    const pedidoActualizado = req.body;
    res.send(`Pedido con ID: ${pedidoId} actualizado a: ${JSON.stringify(pedidoActualizado)}`);
});

// Cancelar un pedido
app.delete('/pedidos/:id', (req, res) => {
    const pedidoId = req.params.id;
    res.send(`Pedido con ID: ${pedidoId} ha sido cancelado`);
});

/** Rutas para Inventario **/

// Obtener inventario de garrafones
app.get('/inventario/garrafones', (req, res) => {
    res.send('Inventario de garrafones disponible');
});

// Obtener inventario de tapas
app.get('/inventario/tapas', (req, res) => {
    res.send('Inventario de tapas disponible');
});

// Obtener inventario de agua (litros)
app.get('/inventario/agua', (req, res) => {
    res.send('Inventario de agua en litros disponible');
});

// Actualizar inventario (garrafones, tapas o agua)
app.post('/inventario/actualizar', (req, res) => {
    const { tipo, cantidad } = req.body;
    res.send(`Inventario de ${tipo} actualizado en ${cantidad}`);
});

/** Rutas para Rellenado **/

// Registrar un rellenado de garrafón
app.post('/rellenado', (req, res) => {
    const { tamaño, litros, precio } = req.body;
    res.send(`Rellenado de garrafón tamaño ${tamaño} con ${litros} litros por ${precio} registrado`);
});

/** Rutas para Reportes de Ventas **/

// Obtener reporte de ventas del día
app.get('/ventas/dia', (req, res) => {
    res.send('Reporte de ventas del día');
});

// Obtener reporte de ventas de la semana
app.get('/ventas/semana', (req, res) => {
    res.send('Reporte de ventas de la semana');
});

// Obtener reporte de ventas del mes
app.get('/ventas/mes', (req, res) => {
    res.send('Reporte de ventas del mes');
});

/** Rutas para Manejo de Tamaños de Garrafones **/

// Obtener lista de tamaños de garrafones y precios
app.get('/garrafones/tamaños', (req, res) => {
    res.send('Lista de tamaños de garrafones y precios');
});

// Agregar o modificar un tamaño de garrafón
app.post('/garrafones/tamaños', (req, res) => {
    const { tamaño, precio } = req.body;
    res.send(`Tamaño de garrafón ${tamaño} con precio ${precio} agregado o actualizado`);
});

// Escuchar en el puerto especificado
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
