"use strict";
const L = require("./_lib");
module.exports = async (req, res) => {
  if (req.method !== "POST") return L.send(res, 405, { error: "Method not allowed" });
  try {
    const who = await L.verifyAdmin(req);
    L.rateLimit("a:" + who.uid, 8, 0);
    const { task, input } = L.readBody(req);
    if (typeof task !== "string" || !L.ALLOWED_AI_TASKS.includes(task)) return L.send(res, 400, { error: "ປະເພດວຽກ AI ບໍ່ຖືກຕ້ອງ" });
    if (typeof input !== "string" || !input.trim()) return L.send(res, 400, { error: "ກະລຸນາໃສ່ຂໍ້ຄວາມກ່ອນ" });
    if (input.length > L.MAX_AI_INPUT_CHARS) return L.send(res, 413, { error: "ຂໍ້ຄວາມຍາວເກີນ " + L.MAX_AI_INPUT_CHARS + " ຕົວອັກສອນ" });
    const result = await L.runAI(task, input.trim());
    return L.send(res, 200, { result });
  } catch (e) {
    if (e && e.status >= 500) console.error("ai failed", e.name || "Error", e.status);
    return L.send(res, (e && e.status) || 502, { error: (e && e.message) || "AI request ລົ້ມເຫຼວ" });
  }
};
