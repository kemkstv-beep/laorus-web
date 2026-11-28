"use strict";
const L = require("./_lib");
// ok = true ເມື່ອຕັ້ງ LAORUS_GEMINI_API_KEY ແລ້ວ (ແຖບ LaoRus AI ໃນແອັບຈະສະແດງຕາມຄ່ານີ້)
// ເປີດ /api/health?probe=1 ເພື່ອທົດສອບເອີ້ນ Gemini 1 ຄັ້ງ ແລະເບິ່ງຂໍ້ຄວາມ error ຈາກ Google (ບໍ່ສະແດງ key)
module.exports = async (req, res) => {
  const key = (process.env.LAORUS_GEMINI_API_KEY || "").trim();
  const out = { ok: !!key, provider: key.startsWith("AQ.") ? "vertex-express" : key ? "gemini-api" : "none" };
  if (key && String((req.query && req.query.probe) || "") === "1") {
    try {
      L.rateLimit("p:" + L.clientIp(req), 3, 20);
      const text = await L.gemini("Reply with the single word: OK", "ping", 20);
      out.probe = { ok: true, reply: text.slice(0, 20) };
    } catch (e) { out.probe = { ok: false, status: e.status || 500, error: String(e.message || e).slice(0, 300) }; }
  }
  res.status(200).setHeader("Cache-Control", "no-store").json(out);
};
