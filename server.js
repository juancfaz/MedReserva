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
    const { patientEmail, doctorId, date, reason } = req.body;

    if (!patientEmail || !doctorId || !date) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    // Buscar ID del paciente por email
    db.get("SELECT id FROM patients WHERE email = ?", [patientEmail], (err, patient) => {
        if (err || !patient) {
            return res.status(404).json({ error: "Patient not found" });
        }

        const patientId = patient.id;

        // Insertar reserva
        const stmt = db.prepare(`
            INSERT INTO reservations (patient_id, doctor_id, date, reason, status)
            VALUES (?, ?, ?, ?, 'pending')
        `);

        stmt.run(patientId, doctorId, date, reason || "", function (err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Error saving reservation" });
            }
            res.json({ message: "Reservation successful", id: this.lastID });
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

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
