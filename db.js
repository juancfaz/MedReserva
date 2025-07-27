const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./reservations.db");

db.serialize(() => {
    // TABLA PACIENTES
    db.run(`
        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT,
            birthdate TEXT,
            gender TEXT CHECK(gender IN ('male', 'female', 'other'))
        )
    `);

    // TABLA MÉDICOS
    db.run(`
        CREATE TABLE IF NOT EXISTS doctors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            specialty TEXT NOT NULL,
            phone TEXT
        )
    `);

    // TABLA RESERVAS ACTUALIZADA
    db.run(`
        CREATE TABLE IF NOT EXISTS reservations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL,
            doctor_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            reason TEXT,
            status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'cancelled')),
            FOREIGN KEY(patient_id) REFERENCES patients(id),
            FOREIGN KEY(doctor_id) REFERENCES doctors(id)
        )
    `);

    // TABLA USUARIOS (admin, médico, paciente)
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL CHECK (role IN ('admin', 'doctor', 'patient'))
        )
    `);

    // Admin de prueba
    db.get(`SELECT COUNT(*) as count FROM users`, (err, row) => {
        if (err) {
            console.error("Error al contar usuarios:", err.message);
            return;
        }
        if (row.count === 0) {
            const insert = db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)");
            insert.run("Admin", "admin@clinic.com", "admin123", "admin");
            insert.finalize();
            console.log("Administrador de prueba insertado.");
        }
    });
});

module.exports = db;
