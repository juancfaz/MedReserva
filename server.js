const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("./db");

const app = express();
app.use(express.static("public"));
app.use(express.json());

const JWT_SECRET = "tu_clave_secreta_super_segura";

// Login
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
    }

    db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
        if (err) return res.status(500).json({ error: "Database error" });

        if (!user || user.password !== password) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ message: "Login successful", token });
    });
});

// Registro / Signup
app.post("/signup", (req, res) => {
    const { name, email, password, role, phone, birthdate, gender, specialty } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ error: "Missing required fields (name, email, password, role)" });
    }

    if (!["admin", "doctor", "patient"].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
    }

    // Verificar que email no esté usado
    db.get("SELECT id FROM users WHERE email = ?", [email], (err, row) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (row) return res.status(409).json({ error: "Email already registered" });

        // Insertar usuario
        const insertUser = `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`;
        db.run(insertUser, [name, email, password, role], function (err) {
            if (err) return res.status(500).json({ error: "Error creating user" });

            const userId = this.lastID;

            // Insertar info extra según rol
            if (role === "patient") {
                if (!birthdate || !gender) {
                    return res.status(400).json({ error: "Missing patient fields: birthdate, gender" });
                }

                const insertPatient = `INSERT INTO patients (name, email, phone, birthdate, gender) VALUES (?, ?, ?, ?, ?)`;
                db.run(insertPatient, [name, email, phone || null, birthdate, gender], (err) => {
                    if (err) return res.status(500).json({ error: "Error creating patient record" });
                    return res.json({ message: "Patient registered successfully" });
                });

            } else if (role === "doctor") {
                if (!specialty) {
                    return res.status(400).json({ error: "Missing doctor field: specialty" });
                }

                const insertDoctor = `INSERT INTO doctors (name, email, specialty, phone) VALUES (?, ?, ?, ?)`;
                db.run(insertDoctor, [name, email, specialty, phone || null], (err) => {
                    if (err) return res.status(500).json({ error: "Error creating doctor record" });
                    return res.json({ message: "Doctor registered successfully" });
                });

            } else {
                // admin, no info extra
                return res.json({ message: "Admin registered successfully" });
            }
        });
    });
});

// Obtener reservas según el rol del usuario
app.get("/api/my-reservations", authenticateToken, (req, res) => {
    const role = req.user.role;
    const email = req.user.email;

    if (role === "admin") {
        const sql = `
            SELECT r.id, p.name AS patient_name, d.name AS doctor_name, r.date, r.reason, r.status
            FROM reservations r
            JOIN patients p ON r.patient_id = p.id
            JOIN doctors d ON r.doctor_id = d.id
            ORDER BY r.date ASC
        `;
        db.all(sql, [], (err, rows) => {
            if (err) return res.status(500).json({ error: "Error fetching reservations" });
            res.json(rows);
        });

    } else if (role === "doctor") {
        const sql = `
            SELECT r.id, p.name AS patient_name, r.date, r.reason, r.status
            FROM reservations r
            JOIN patients p ON r.patient_id = p.id
            JOIN doctors d ON r.doctor_id = d.id
            WHERE d.email = ?
            ORDER BY r.date ASC
        `;
        db.all(sql, [email], (err, rows) => {
            if (err) return res.status(500).json({ error: "Error fetching reservations" });
            res.json(rows);
        });

    } else if (role === "patient") {
        const sql = `
            SELECT r.id, d.name AS doctor_name, r.date, r.reason, r.status
            FROM reservations r
            JOIN doctors d ON r.doctor_id = d.id
            JOIN patients p ON r.patient_id = p.id
            WHERE p.email = ?
            ORDER BY r.date ASC
        `;
        db.all(sql, [email], (err, rows) => {
            if (err) return res.status(500).json({ error: "Error fetching reservations" });
            res.json(rows);
        });

    } else {
        res.status(403).json({ error: "Invalid role" });
    }
});


// Middleware para autenticar token
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized, token missing" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid token" });
        req.user = user;
        next();
    });
}

// Obtener datos del usuario autenticado
app.get("/api/me", authenticateToken, (req, res) => {
    res.json(req.user);
});

// 🔄 Obtener todas las reservas (con JOIN)
app.get("/api/reservations", authenticateToken, (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden: Admins only" });
    }

    const sql = `
        SELECT r.id, p.name AS patient_name, p.email AS patient_email,
               d.name AS doctor_name, d.specialty,
               r.date, r.reason, r.status
        FROM reservations r
        JOIN patients p ON r.patient_id = p.id
        JOIN doctors d ON r.doctor_id = d.id
        ORDER BY r.date ASC
    `;

    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: "Error fetching reservations" });
        res.json(rows);
    });
});

// 🆕 Crear nueva reserva
app.post("/reserve", authenticateToken, (req, res) => {
    if (req.user.role !== "patient") {
        return res.status(403).json({ error: "Solo los pacientes pueden hacer reservas" });
    }

    const { doctorId, date, reason } = req.body;
    const patientEmail = req.user.email;

    if (!doctorId || !date) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    db.get("SELECT id FROM patients WHERE email = ?", [patientEmail], (err, patient) => {
        if (err || !patient) {
            return res.status(404).json({ error: "Paciente no encontrado" });
        }

        const stmt = db.prepare(`
            INSERT INTO reservations (patient_id, doctor_id, date, reason, status)
            VALUES (?, ?, ?, ?, 'pending')
        `);

        stmt.run(patient.id, doctorId, date, reason || "", function (err) {
            if (err) return res.status(500).json({ error: "Error al guardar la reserva" });
            res.json({ message: "Reserva exitosa", id: this.lastID });
        });
    });
});

// ✏️ Actualizar reserva
app.put("/api/reservations/:id", authenticateToken, (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden: Admins only" });
    }

    const id = req.params.id;
    const { patientId, doctorId, date, reason, status } = req.body;

    if (!patientId || !doctorId || !date || !status) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const sql = `
        UPDATE reservations
        SET patient_id = ?, doctor_id = ?, date = ?, reason = ?, status = ?
        WHERE id = ?
    `;

    db.run(sql, [patientId, doctorId, date, reason || "", status, id], function (err) {
        if (err) return res.status(500).json({ error: "Failed to update reservation" });
        if (this.changes === 0) return res.status(404).json({ error: "Reservation not found" });

        res.json({ message: "Reservation updated successfully." });
    });
});

// ❌ Eliminar reserva
app.delete("/api/reservations/:id", authenticateToken, (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden: Admins only" });
    }

    const id = req.params.id;

    db.run("DELETE FROM reservations WHERE id = ?", id, function (err) {
        if (err) return res.status(500).json({ error: "Failed to delete reservation" });
        if (this.changes === 0) return res.status(404).json({ error: "Reservation not found" });

        res.json({ success: true });
    });
});

app.get("/api/patients", authenticateToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admins only" });
  }

  db.all("SELECT id, name, email, phone, birthdate, gender FROM patients", [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Error al obtener pacientes" });
    res.json(rows);
  });
});


app.get("/api/doctors", (req, res) => {
    db.all("SELECT id, name, specialty FROM doctors", [], (err, rows) => {
        if (err) return res.status(500).json({ error: "Error al obtener médicos" });
        res.json(rows);
    });
});

app.get("/api/doctorz", authenticateToken, (req, res) => {
  db.all("SELECT id, name, email, specialty, phone FROM doctors", [], (err, rows) => {
        if (err) return res.status(500).json({ error: "Error al obtener médicos" });
        res.json(rows);
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});