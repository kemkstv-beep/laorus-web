import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  ALLOWED_AI_TASKS,
  MAX_AI_INPUT_CHARS,
  MAX_PUBLIC_AI_INPUT_CHARS,
  enforcePublicRateLimit,
  enforceUserRateLimit,
  requireAdmin,
  runAI,
  runTutorAI,
} from "./ai.js";
import { getRelevantPublicContext } from "./public-content.js";

const app = express();
const here = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(here, "../public");
const port = Number.parseInt(process.env.PORT || "3000", 10);

app.disable("x-powered-by");
app.set("trust proxy", 1); // ໃຫ້ນັບຂີດຈຳກັດຕາມ IP ຜູ້ໃຊ້ຈິງ ເມື່ອຢູ່ຫຼັງ proxy ຂອງ host
app.use((req, res, next) => {
  res.set("X-Content-Type-Options", "nosniff");
  res.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});
app.use("/api", (_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});
// 12,000 non-ASCII characters may exceed 16 KiB when UTF-8 encoded or JSON-escaped.
// Keep a bounded transport limit here; /api/ai enforces the stricter character limit.
app.use(express.json({ limit: "80kb", type: "application/json", strict: true }));

app.get("/_app/health", (_req, res) => res.status(200).json({ ok: true }));

// Public tutor: context is retrieved server-side only from public vocabulary and lesson files.
app.post("/api/tutor", enforcePublicRateLimit, async (req, res) => {
  const { input } = req.body || {};
  if (typeof input !== "string" || !input.trim()) {
    return res.status(400).json({ error: "ກະລຸນາພິມຄຳຖາມກ່ອນ" });
  }
  if (input.length > MAX_PUBLIC_AI_INPUT_CHARS) {
    return res.status(413).json({ error: `ຄຳຖາມຍາວເກີນ ${MAX_PUBLIC_AI_INPUT_CHARS.toLocaleString("en-US")} ຕົວອັກສອນ` });
  }
  try {
    const question = input.trim();
    const publicContext = getRelevantPublicContext(question);
    const result = await runTutorAI(question, publicContext);
    return res.status(200).json({ result });
  } catch (error) {
    if (error?.status >= 500) {
      // Never log the question, client IP, account identity or upstream response body.
      console.error("Public tutor request failed:", error?.name || "Error", error?.status || 502);
    }
    return res.status(error?.status || 502).json({ error: error?.message || "AI request ລົ້ມເຫຼວ" });
  }
});

app.post("/api/ai", requireAdmin, enforceUserRateLimit, async (req, res) => {
  const { task, input } = req.body || {};

  if (typeof task !== "string" || !ALLOWED_AI_TASKS.includes(task)) {
    return res.status(400).json({ error: "ປະເພດວຽກ AI ບໍ່ຖືກຕ້ອງ" });
  }
  if (typeof input !== "string" || !input.trim()) {
    return res.status(400).json({ error: "ກະລຸນາໃສ່ຂໍ້ຄວາມກ່ອນ" });
  }
  if (input.length > MAX_AI_INPUT_CHARS) {
    return res.status(413).json({ error: `ຂໍ້ຄວາມຍາວເກີນ ${MAX_AI_INPUT_CHARS.toLocaleString("en-US")} ຕົວອັກສອນ` });
  }

  try {
    const result = await runAI(task, input.trim());
    return res.status(200).json({ result });
  } catch (error) {
    if (error?.status >= 500) {
      // Avoid logging prompt text, bearer tokens, user email or upstream response bodies.
      console.error("AI request failed:", error?.name || "Error", error?.status || 502);
    }
    return res.status(error?.status || 502).json({ error: error?.message || "AI request ລົ້ມເຫຼວ" });
  }
});

app.use("/api", (_req, res) => res.status(404).json({ error: "API route ບໍ່ພົບ" }));
app.use(express.static(publicDir, { index: "index.html", maxAge: 0, etag: true }));
app.use((_req, res) => res.status(404).type("text/plain").send("Not found"));

app.use((error, _req, res, _next) => {
  if (error?.type === "entity.too.large") {
    return res.status(413).json({ error: "ຂໍ້ມູນທີ່ສົ່ງໃຫຍ່ເກີນກຳນົດ" });
  }
  if (error?.type === "entity.parse.failed" || error instanceof SyntaxError) {
    return res.status(400).json({ error: "JSON ບໍ່ຖືກຮູບແບບ" });
  }
  console.error("HTTP request failed:", error?.name || "Error");
  return res.status(500).json({ error: "Server ເກີດບັນຫາ; ລອງໃໝ່ພາຍຫຼັງ" });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`LaoRus Admin listening on 0.0.0.0:${port}`);
});
