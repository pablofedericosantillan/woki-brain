import express from "express";
import pino from "pino";
import pinoHttp from "pino-http";
import routes from "./routes";
import { logger } from "./infrastructure/logger";


const app = express();
app.use(express.json());
app.use(
  pinoHttp({
    logger,
    customSuccessMessage(req, res) {
      return `request completed`;
    },
  }),
);

app.use(routes);

app.use(
  (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error({ err }, "Unhandled error");
    res.status(500).json({ error: "internal_error", detail: "Unexpected error" });
  },
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`WokiBrain API on port ${PORT}`);
});
