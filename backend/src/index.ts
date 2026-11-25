import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { villageRouter } from "./routes/village.js";

const app = express();
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/village", villageRouter);

app.listen(config.port, () => {
  console.log(`GigaRaid API on :${config.port}`);
});
