import { QZ } from "qz-tray-types";

export interface TicketPayload {
  tipo: string;
  id: number | string;
  fecha: string;
  hora: string;
}

const THERMAL_PRINTER = "Xprinter XPE200L";

const ensureQzLoaded = (): QZ => {
  if (typeof window === "undefined" || !window.qz) {
    throw new Error("QZ Tray no está disponible. Verificá la instalación.");
  }

  return window.qz;
};

export const connectPrinter = async (): Promise<void> => {
  const qz = ensureQzLoaded();

  if (qz.websocket.isActive()) {
    console.log("Conexión WebSocket activa");
    return;
  }

  try {
    await qz.websocket.connect();
    console.log("Conexión WebSocket establecida");
  } catch (error) {
    console.error("Error al conectar a QZ Tray: ", error);
  }
};


const buildTicketCommands = (payload: TicketPayload): string[] => {
  const controlCode = `SC-${payload.id}-${String(Date.now()).slice(-6)}`;

  return [
    "\x1B\x40",
    "\x1B\x61\x01",
    "\x1B\x45\x01",
    "SANTAS\n",
    "\x1B\x45\x00",
    "ENTRADA DIGITAL\n",
    "\x1B\x61\x00",
    "---------------------------\n",
    `Tipo: ${payload.tipo}\n`,
    `Ticket ID: ${payload.id}\n`,
    `Fecha: ${payload.fecha}\n`,
    `Hora: ${payload.hora}\n`,
    "---------------------------\n",
    "NO COMPARTIR ESTE TICKET\n",
    `Codigo: ${controlCode}\n`,
    "---------------------------\n",
    "\x1B\x61\x01",
    "Gracias por tu compra\n\n",
    "\x1B\x61\x00",
    "\x1D\x56\x00",
  ];
};

export const printTicket = async (payload: TicketPayload): Promise<void> => {
  const qz = ensureQzLoaded();
  await connectPrinter();

  const config = qz.configs.create(THERMAL_PRINTER, {
    altPrinting: true,
    encoding: "CP1252",
  });

  const commands = buildTicketCommands(payload);

  await qz.print(config, commands);
};
