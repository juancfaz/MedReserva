const express = require("express");
const path = require("path");
const session = require("express-session");
const app = express();
const db = require("./db");

app.use(express.static("public"));
app.use(express.json());

// Configurar express-session
app.use(session({
    secret: "mi_secreto_super_seguro_123", // Cambia esto por un secreto seguro
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 1 día
    }
}));

// Middleware para verificar sesión activa
function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({ error: "Unauthorized, please login" });
    }
    next();
}

// Endpoint para login
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
    }

    db.get("SELECT * FROM users WHERE email = ? AND password = ?", [email, password], (err, user) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Server error" });
        }

        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Guardar usuario en sesión
        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        res.json({ message: "Login successful", user: req.session.user });
    });
});

// Endpoint para logout
app.post("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: "Failed to logout" });
        }
        res.clearCookie("connect.sid");
        res.json({ message: "Logged out successfully" });
    });
});

// Endpoint para crear reservas (solo usuarios logueados)
app.post("/reserve", requireLogin, (req, res) => {
    const { name, date } = req.body;

    if (!name || !date) {
        return res.status(400).send("Missing name or date.");
    }

    const stmt = db.prepare("INSERT INTO reservations (name, date) VALUES (?, ?)");
    stmt.run(name, date, function (err) {
        if (err) {
            console.error(err);
            return res.status(500).send("Error saving reservation.");
        }
        res.send("Reservation successful!");
    });
});

// Obtener reservas (solo usuarios logueados)
// Usuarios normales solo ven sus reservas, admins ven todas
app.get("/api/reservations", requireLogin, (req, res) => {
    if (req.session.user.role === "admin") {
        // Admin ve todas las reservas
        db.all("SELECT * FROM reservations ORDER BY date ASC", [], (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Error fetching reservations.");
            }
            res.json(rows);
        });
    } else {
        // Usuario normal ve solo sus reservas (filtrando por nombre)
        db.all("SELECT * FROM reservations WHERE name = ? ORDER BY date ASC", [req.session.user.name], (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Error fetching reservations.");
            }
            res.json(rows);
        });
    }
});

// Eliminar reserva (solo admins)
app.delete("/api/reservations/:id", requireLogin, (req, res) => {
    if (req.session.user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden: Admins only" });
    }

    const id = req.params.id;

    db.run("DELETE FROM reservations WHERE id = ?", id, function(err) {
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

// Actualizar reserva (solo admins)
app.put("/api/reservations/:id", requireLogin, (req, res) => {
    if (req.session.user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden: Admins only" });
    }

    const id = req.params.id;
    const { name, date } = req.body;

    if (!name || !date) {
        return res.status(400).json({ error: "Name and date are required." });
    }

    const sql = "UPDATE reservations SET name = ?, date = ? WHERE id = ?";
    const params = [name, date, id];

    db.run(sql, params, function(err) {
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

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
