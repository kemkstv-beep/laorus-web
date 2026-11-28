# LaoRus AI server (ທາງເລືອກ)

ເວັບ static ເທິງ Vercel ໃຊ້ໄດ້ປົກກະຕິໂດຍບໍ່ຕ້ອງມີ server ນີ້ (ແຖບ LaoRus AI ຈະບໍ່ສະແດງ).
ຖ້າຢາກເປີດ AI: ເອົາ server ນີ້ໄປຮັນເທິງ host ທີ່ຮອງຮັບ Node 22 (Render/Railway/Fly.io...).

1. ສຳເນົາໄຟລ໌ເວັບທັງໝົດ (index.html, admin.html, *.json, laorus-ai.*) ໄປໄວ້ໂຟນເດີ `public/` ຖັດ `server/`
2. `pnpm install && node server/index.js` (ຫຼືໃຊ້ Dockerfile ທີ່ມາກັບ ZIP ເດີມ)
3. ຕັ້ງ env: `LAORUS_GEMINI_API_KEY`, `LAORUS_ADMIN_EMAILS`, `FIREBASE_PROJECT_ID`
4. ເພີ່ມໂດເມນຂອງ host ໃນ Firebase → Authentication → Authorized domains
