export type EscposTicketPayload = {
  tipo: string;
  id?: string;
  fecha: string;
  hora: string;
  tragoGratis?: boolean;
  nota?: string;
  controlCode?: string;
};

export type EscposPrintOptions = {
  /**
   * Base URL for the print server (e.g. http://localhost:4000).
   * Defaults to VITE_PRINT_SERVER_URL when available.
   */
  baseUrl?: string;
  /** Optional path override (defaults to /imprimir). */
  path?: string;
  signal?: AbortSignal;
};

function normalizeBaseUrl(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function resolveBaseUrl(options?: EscposPrintOptions): string | undefined {
  if (options?.baseUrl) return normalizeBaseUrl(options.baseUrl);
  const envValue = import.meta.env?.VITE_PRINT_SERVER_URL as string | undefined;
  return envValue ? normalizeBaseUrl(envValue) : undefined;
}

export async function sendTicketToEscposServer(
  payload: EscposTicketPayload,
  options?: EscposPrintOptions,
): Promise<void> {
  const baseUrl = resolveBaseUrl(options);

  if (!baseUrl) {
    throw new Error(
      "Falta configurar la URL del servidor de impresión (VITE_PRINT_SERVER_URL).",
    );
  }

  const path = options?.path ?? "/imprimir";
  const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: options?.signal,
  });

  if (!response.ok) {
    const message = await response
      .json()
      .then((data) => data?.message || JSON.stringify(data))
      .catch(() => response.statusText || "Error desconocido");

    throw new Error(
      `El servidor de impresión respondió con un error (${response.status}): ${message}`,
    );
  }
}