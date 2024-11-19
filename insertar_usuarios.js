const mysql = require('mysql2');
const bcrypt = require('bcrypt');

// Configuración de conexión a la base de datos
const db = mysql.createConnection({
    host: 'ls-cf130092dca4b812b494d18a821611d00996da16.cd8qggqcgt12.us-east-2.rds.amazonaws.com',
    user: 'dbmasteruser',
    password: 'leon7893',
    database: 'purificadora_db'
    });

// Conectar a la base de datos
db.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        process.exit(1);
    }
    console.log('Conectado a la base de datos MySQL.');
});

// Lista de usuarios a insertar
const usuarios = [
    { nombre: 'Eric Leon', email: 'eric.leon@purificadora.com', password: 'admin123', rol: 'admin' },
    { nombre: 'Loibeth Curie', email: 'loibeth.curiel@cliente.com', password: 'cliente123', rol: 'cliente' },
    { nombre: 'Rodrigo Juarez', email: 'rodrigo.juarez@cliente.com', password: 'cliente123', rol: 'cliente' },
    { nombre: 'Carlos Sánchez', email: 'carlos.sanchez@cliente.com', password: 'cliente123', rol: 'cliente' },
    { nombre: 'Ana Torres', email: 'ana.torres@cliente.com', password: 'cliente123', rol: 'cliente' }
];

// Función para insertar usuarios con contraseñas hasheadas
const insertarUsuarios = async () => {
    try {
        for (const usuario of usuarios) {
            // Hashear la contraseña
            const hashedPassword = await bcrypt.hash(usuario.password, 10);

            // Insertar en la base de datos
            db.query(
                'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
                [usuario.nombre, usuario.email, hashedPassword, usuario.rol],
                (err, result) => {
                    if (err) {
                        console.error(`Error al insertar el usuario ${usuario.email}:`, err);
                    } else {
                        console.log(`Usuario ${usuario.email} insertado exitosamente.`);
                    }
                }
            );
        }
    } catch (error) {
        console.error('Error al insertar usuarios:', error);
    } finally {
        // Cerrar la conexión a la base de datos
        db.end(() => {
            console.log('Conexión cerrada.');
        });
    }
};

// Llamar a la función
insertarUsuarios();
