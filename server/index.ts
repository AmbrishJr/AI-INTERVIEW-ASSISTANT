import "dotenv/config";
import { createApplication } from "./app";
import { serveStatic } from "./static";
export function log(message: string, source = "express") {
  console.log(`[${source}] ${message}`);
}
(async () => {
  const { app, httpServer } = await createApplication();
  if (process.env.NODE_ENV === "production") serveStatic(app);
  else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }
  const port = Number(process.env.PORT || "3000");
  httpServer.listen(port, () => log(`serving on port ${port}`));
})().catch((error) => {
  console.error(
    error instanceof Error ? error.message : "Unable to start server",
  );
  process.exitCode = 1;
});
