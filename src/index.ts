import app from "./app";
import { logger } from "./shared";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`WokiBrain API is running on: http://localhost:${PORT}`);
});