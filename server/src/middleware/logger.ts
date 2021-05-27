import pinoColada from "pino-colada";
import pino from "pino-http";

function logger() {
  return pino({
    level: process.env.LOG_LEVEL || "info",
    prettyPrint: process.env.NODE_ENV !== "production",
    prettifier: pinoColada,
  });
}

export default logger;
