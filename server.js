// server.js

const express = require("express");
const escpos = require("escpos");
const bodyParser = require("body-parser");

const app = express();
const port = 3000; // Puedes elegir el puerto que desees

// Configuración del body parser para que acepte datos JSON
app.use(bodyParser.json());

// Dirección de la impresora en red (reemplázalo con la IP de tu impresora)
new escpos.Printer(new escpos.USB());

// Ruta para recibir la solicitud de impresión
app.post("/imprimir", (req, res) => {
  const { tipo, cantidad, precio, total, fecha, hora } = req.body;

  const ticketContent = `
    Tipo: ${tipo}
    Cantidad: ${cantidad}
    Precio: ${precio}
    Total: ${total}
    Fecha: ${fecha}
    Hora: ${hora}
  `;

  // Enviar la información a la impresora
  printer.text(ticketContent).cut().close();

  res.send({ message: "Ticket enviado a la impresora" });
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
