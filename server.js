const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const db = new sqlite3.Database("./reservations.db");

app.use(express.static("public"));
app.use(express.json());

db.run(`CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    date TEXT NOT NULL
)`);

app.post("/reserve", (req, res) => {
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

app.get("/api/reservations", (req, res) => {
    db.all("SELECT * FROM reservations ORDER BY date ASC", [], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error fetching reservations.");
        }
        res.json(rows);
    });
});

app.delete("/api/reservations/:id", (req, res) => {
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


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
