import "dotenv/config";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import { createServer } from "node:http";
import { registerRoutes } from "./routes";
export async function createApplication() {
  const app = express();
  const httpServer = createServer(app);
  if (process.env.TRUST_PROXY === "1") app.set("trust proxy", 1);
  app.use(
    cors({
      origin: ["http://localhost:5000", "http://localhost:5001"],
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "128kb" }));
  app.use(express.urlencoded({ extended: false, limit: "128kb" }));
  app.use((req, res, next) => {
    const started = Date.now();
    res.on("finish", () => {
      if (req.path.startsWith("/api"))
        console.log(
          `${req.method} ${req.path} ${res.statusCode} ${Date.now() - started}ms`,
        );
    });
    next();
  });
  await registerRoutes(httpServer, app);
  app.use("/api", (_req, res) =>
    res.status(404).json({ message: "API route not found" }),
  );
  app.use((error: any, _req: Request, res: Response, _next: NextFunction) => {
    const status =
      Number.isInteger(error.status) &&
      error.status >= 400 &&
      error.status < 600
        ? error.status
        : 500;
    console.error(`Request failed (${status})`);
    if (!res.headersSent)
      res
        .status(status)
        .json({
          message:
            status === 413
              ? "Request is too large"
              : status === 400
                ? "Invalid request"
                : "Internal server error",
        });
  });
  return { app, httpServer };
}
