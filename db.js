const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./reservas.db");

// Crear tabla si no existe
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS reservas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            date TEXT NOT NULL
        )
    `);
});

module.exports = db;
