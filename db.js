const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./reservations.db");

// Crear tablas si no existen
db.serialize(() => {
    // Tabla de reservas
    db.run(`
        CREATE TABLE IF NOT EXISTS reservations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            date TEXT NOT NULL
        )
    `);

    // Tabla de usuarios
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL CHECK (role IN ('user', 'admin'))
        )
    `);

    // Insertar usuarios de prueba si no hay ninguno
    db.get(`SELECT COUNT(*) as count FROM users`, (err, row) => {
        if (err) {
            console.error("Error al contar usuarios:", err.message);
            return;
        }
        if (row.count === 0) {
            const insert = db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)");
            insert.run("Admin Juan", "admin@example.com", "admin123", "admin");
            insert.run("Cliente usuario", "usuario@example.com", "usuario123", "user");
            insert.finalize();
            console.log("Usuarios de prueba insertados.");
        }
    });
});

module.exports = db;
