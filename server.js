const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("./db");

const app = express();
app.use(express.static("public"));
app.use(express.json());

const JWT_SECRET = "tu_clave_secreta_super_segura";

// Ruta login - recibe email y password, devuelve token JWT si correcto
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
    }

    db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Database error" });
        }

        if (!user || user.password !== password) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Crear token JWT con datos de usuario
        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ message: "Login successful", token });
    });
});

// Middleware para verificar token JWT y guardar usuario en req.user
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

// Obtener datos del usuario actual (con token)
app.get("/api/me", authenticateToken, (req, res) => {
    res.json(req.user);
});

// Obtener todas las reservas - solo admin
app.get("/api/reservations", authenticateToken, (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden: Admins only" });
    }

    db.all("SELECT * FROM reservations ORDER BY date ASC", [], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Error fetching reservations" });
        }
        res.json(rows);
    });
});

// Crear nueva reserva - usuarios autenticados
app.post("/reserve", authenticateToken, (req, res) => {
    const { name, date } = req.body;

    if (!name || !date) {
        return res.status(400).json({ error: "Missing name or date" });
    }

    const stmt = db.prepare("INSERT INTO reservations (name, date) VALUES (?, ?)");
    stmt.run(name, date, function (err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Error saving reservation" });
        }
        res.json({ message: "Reservation successful", id: this.lastID });
    });
});

// Actualizar reserva - solo admin
app.put("/api/reservations/:id", authenticateToken, (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden: Admins only" });
    }

    const id = req.params.id;
    const { name, date } = req.body;

    if (!name || !date) {
        return res.status(400).json({ error: "Name and date are required." });
    }

    const sql = "UPDATE reservations SET name = ?, date = ? WHERE id = ?";
    const params = [name, date, id];

    db.run(sql, params, function (err) {
        if (err) {
            console.error("Error updating reservation:", err.message);
            return res.status(500).json({ error: "Failed to update reservation" });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: "Reservation not found" });
        }

        res.json({ message: "Reservation updated successfully." });
    });
});

// Eliminar reserva - solo admin
app.delete("/api/reservations/:id", authenticateToken, (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden: Admins only" });
    }

    const id = req.params.id;

    db.run("DELETE FROM reservations WHERE id = ?", id, function (err) {
        if (err) {
            console.error("Error deleting reservation:", err.message);
            return res.status(500).json({ error: "Failed to delete reservation" });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: "Reservation not found" });
        }

        res.json({ success: true });
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
