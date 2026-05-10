type LogLevel = "debug" | "info" | "warn" | "error";

const PREFIX = "[academy]";

function out(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const line = meta && Object.keys(meta).length > 0 ? `${message} ${JSON.stringify(meta)}` : message;
  if (level === "error") {
    console.error(PREFIX, line);
    return;
  }
  if (level === "warn") {
    console.warn(PREFIX, line);
    return;
  }
  if (process.env.NODE_ENV !== "production" && level === "debug") {
    console.debug(PREFIX, line);
    return;
  }
  console.log(PREFIX, line);
}

/** تسجيل بسيط وقابل للاستبدال لاحقًا بـ OpenTelemetry / Axiom / إلخ */
export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => out("debug", message, meta),
  info: (message: string, meta?: Record<string, unknown>) => out("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => out("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => out("error", message, meta),
};
