const express = require("express");
const path = require("path");
const app = express();
const PORT = 3000;

// Middleware
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Ruta para recibir reservas
app.post("/reserve", (req, res) => {
    const { fname, dtime } = req.body;

    if (!fname || !dtime) {
        return res.status(400).send("Datos incompletos");
    }

    console.log("Reserva recibida:");
    console.log("Nombre:", fname);
    console.log("Fecha:", dtime);

    res.send("Reserva recibida con éxito");
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
