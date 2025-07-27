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

    // Datos de prueba
    db.get(`SELECT COUNT(*) as count FROM users`, (err, row) => {
        if (err) {
            console.error("Error al contar usuarios:", err.message);
            return;
        }
        if (row.count === 0) {
            const insert = db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)");
            insert.run("Admin", "admin@clinic.com", "admin123", "admin");
            insert.run("Dr. House", "doctor@clinic.com", "doctor123", "doctor");
            insert.run("Paciente Uno", "paciente@correo.com", "paciente123", "patient");
            insert.finalize();
            console.log("Usuarios de prueba insertados.");
        }
    });

    // Insertar doctor y paciente de prueba si no existen
    db.get(`SELECT COUNT(*) as count FROM doctors`, (err, row) => {
        if (row.count === 0) {
            db.run(`INSERT INTO doctors (name, email, specialty, phone) VALUES (?, ?, ?, ?)`,
                ["Dr. House", "doctor@clinic.com", "Medicina Interna", "+52123456789"]);
        }
    });

    db.get(`SELECT COUNT(*) as count FROM patients`, (err, row) => {
        if (row.count === 0) {
            db.run(`INSERT INTO patients (name, email, phone, birthdate, gender) VALUES (?, ?, ?, ?, ?)`,
                ["Paciente Uno", "paciente@correo.com", "+521111111111", "1990-01-01", "male"]);
        }
    });

    // Insertar reserva de prueba si no existe
    db.get(`SELECT COUNT(*) as count FROM reservations`, (err, row) => {
        if (row.count === 0) {
            db.run(`
                INSERT INTO reservations (patient_id, doctor_id, date, reason, status)
                VALUES (1, 1, datetime('now', '+1 day'), 'Consulta general', 'pending')
            `);
        }
    });
});

module.exports = db;
