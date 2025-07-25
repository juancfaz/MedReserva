const express = require("express");
const path = require("path");
const db = require("./db");
const app = express();
const PORT = 3000;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/reserve", (req, res) => {
    const { fname, dtime } = req.body;

    if (!fname || !dtime) {
        return res.status(400).send("Incomplete data");
    }

    const query = "INSERT INTO reservas (name, date) VALUES (?, ?)";
    db.run(query, [fname, dtime], function (err) {
        if (err) {
            console.error(err);
            return res.status(500).send("Error saving reservation");
        }

        console.log("Saved reservation:", { id: this.lastID, nombre: fname, fecha: dtime });
        res.send("Reservation saved successfully");
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
