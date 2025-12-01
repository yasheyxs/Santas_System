import express from "express";
import escpos from "escpos"; // Importación predeterminada para CommonJS
import { randomBytes } from "crypto";
import { printTicket } from "./src/lib/printing/printEscposTicket.js";

// Log de depuración para verificar si `escpos.USB` está disponible
console.log("escpos.USB disponible:", !!escpos.USB);

const device = escpos.USB; // Usamos escpos.USB directamente

escpos.Network = escpos.Network || escpos.Adapter?.Network;

const app = express();
const port = Number(process.env.PRINT_SERVER_PORT) || 4000;

app.use(express.json({ limit: "1mb" }));

// Simple CORS handling
app.use((req, res, next) => {
  const allowedOrigin = process.env.PRINT_ALLOWED_ORIGIN || "*";
  res.header("Access-Control-Allow-Origin", allowedOrigin);
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
});

function toNumberOrUndefined(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function buildControlCode(preferredCode) {
  if (preferredCode) return preferredCode;
  const randomSuffix = randomBytes(3).toString("hex");
  return `CTRL-${randomSuffix}`.toUpperCase();
}

// Aquí simplificamos la creación del dispositivo, ya que lo intentamos previamente
function buildPrinterDevice() {
  if (!device) {
    throw new Error("El adaptador USB de escpos no está disponible.");
  }

  return device; // Ya no hace falta crear un nuevo dispositivo, simplemente retornamos el existente
}

app.post("/imprimir", async (req, res) => {
  console.log("BODY RECIBIDO >>>", req.body);

  const { tipo, id, fecha, hora, tragoGratis, nota, controlCode } =
    req.body || {};

  if (!tipo || !fecha || !hora) {
    return res.status(400).json({
      message:
        "Faltan campos obligatorios para imprimir el ticket (tipo, fecha, hora)",
    });
  }

  const payload = {
    tipo,
    id,
    fecha,
    hora,
    tragoGratis: tragoGratis ?? undefined,
    nota,
  };

  try {
    const device = buildPrinterDevice();
    await printTicket(payload, buildControlCode(controlCode), device);

    return res.json({
      message: "Ticket enviado a la impresora",
      payload,
    });
  } catch (error) {
    console.error("No se pudo imprimir el ticket:", error);
    return res.status(500).json({
      message: "No se pudo imprimir el ticket",
      error: error.message,
    });
  }
});

app.get("/salud", (_req, res) => {
  res.json({ status: "ok", printer: Boolean(escpos.USB || escpos.Network) });
});

// Aquí simplemente agregamos app.listen directamente
app.listen(port, () => {
  console.log(`Servidor de impresión escuchando en http://localhost:${port}`);
});

export default app;
