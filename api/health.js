"use strict";
// ok = true ເມື່ອຕັ້ງ LAORUS_GEMINI_API_KEY ແລ້ວ (ແຖບ LaoRus AI ໃນແອັບຈະສະແດງຕາມຄ່ານີ້)
module.exports = (req, res) => {
  res.status(200).setHeader("Cache-Control", "no-store").json({ ok: !!(process.env.LAORUS_GEMINI_API_KEY || "").trim() });
};
