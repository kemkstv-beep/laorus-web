"use strict";
const L = require("./_lib");
module.exports = async (req, res) => {
  if (req.method !== "POST") return L.send(res, 405, { error: "Method not allowed" });
  try {
    const { input } = L.readBody(req);
    if (typeof input !== "string" || !input.trim()) return L.send(res, 400, { error: "ກະລຸນາພິມຄຳຖາມກ່ອນ" });
    if (input.length > L.MAX_PUBLIC_AI_INPUT_CHARS) return L.send(res, 413, { error: "ຄຳຖາມຍາວເກີນ " + L.MAX_PUBLIC_AI_INPUT_CHARS + " ຕົວອັກສອນ" });
    L.rateLimit("t:" + L.clientIp(req), 8, 30);
    const q = input.trim();
    await L.loadRows(L.originOf(req));
    const result = await L.runTutor(q, L.getRelevantPublicContext(q));
    return L.send(res, 200, { result });
  } catch (e) {
    if (e && e.status >= 500) console.error("tutor failed", e.name || "Error", e.status);
    return L.send(res, (e && e.status) || 502, { error: (e && e.message) || "AI request ລົ້ມເຫຼວ" });
  }
};
