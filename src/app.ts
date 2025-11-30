import express from "express";
import pinoHttp from "pino-http";
import { logger } from "./infrastructure/logger";
import routes from "./routes";

const app = express();

app.use(express.json());

app.use(
  pinoHttp({
    logger,
    customSuccessMessage() {
      return "request completed";
    },
  })
);

app.use(routes);

app.use(
  (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error({ err }, "Unhandled error");
    res.status(500).json({ error: "internal_error", detail: "Unexpected error" });
  }
);

export default app;
