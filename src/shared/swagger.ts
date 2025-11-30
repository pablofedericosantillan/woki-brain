import path from "path";
import swaggerJSDoc from "swagger-jsdoc";

const PORT = process.env.PORT || 3000;

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "WokiBrain API",
      version: "1.0.0",
      description: "API documentation for WokiBrain booking system",
    },
    servers: [{ url: `http://localhost:${PORT}` }],
  },
  apis: [
    path.join(__dirname, "./docs.ts"),
  ],
});
