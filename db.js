const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./reservations.db");

db.serialize(() => {
    // ----------- Tabla USERS -----------
    // Tabla base para todos los usuarios con roles definidos: admin, doctor, patient
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL CHECK (role IN ('admin', 'doctor', 'patient'))
        )
    `);

    // ----------- Tabla PATIENTS -----------
    // Datos adicionales para usuarios con rol patient
    db.run(`
        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT,
            birthdate TEXT,
            gender TEXT CHECK(gender IN ('male', 'female', 'other')),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    // ----------- Tabla DOCTORS -----------
    // Datos adicionales para usuarios con rol doctor
    db.run(`
        CREATE TABLE IF NOT EXISTS doctors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            specialty TEXT NOT NULL,
            phone TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    // ----------- Tabla RESERVATIONS -----------
    // Registra las citas, relacionando pacientes y doctores
    db.run(`
        CREATE TABLE IF NOT EXISTS reservations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL,
            doctor_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            reason TEXT,
            status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'cancelled', 'attended')),
            FOREIGN KEY(patient_id) REFERENCES patients(id),
            FOREIGN KEY(doctor_id) REFERENCES doctors(id)
        )
    `);

    // ----------- Usuario Admin de prueba -----------
    // Inserta un usuario admin si la tabla users está vacía (solo una vez)
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