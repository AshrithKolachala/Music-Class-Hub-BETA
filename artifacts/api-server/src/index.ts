import app from "./app";

console.log(`[startup] PORT env = ${process.env["PORT"]}`);

const port = Number(process.env["PORT"] ?? 3001);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${process.env["PORT"]}"`);
}

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on port ${port}`);
});

server.on("error", (err) => {
  console.error("Server error:", err);
  process.exit(1);
});
