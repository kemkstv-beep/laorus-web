# LaoRus 2.0 — GitHub Pages

## ວິທີອັບຂຶ້ນ GitHub Pages

1. ສ້າງ repository ໃໝ່ໃນ GitHub ຫຼືເຂົ້າ repository ເກົ່າ.
2. ອັບໂຫຼດໄຟລ໌ **ທັງ 3 ໄຟລ໌** ນີ້ໄວ້ທີ່ລະດັບຫຼັກຂອງ repository:
   - `index.html`
   - `sw.js`
   - `.nojekyll`
3. ເຂົ້າ **Settings → Pages**.
4. ທີ່ **Build and deployment** ເລືອກ:
   - **Source:** Deploy from a branch
   - **Branch:** `main` (ຫຼື branch ທີ່ໃຊ້), folder `/ (root)`
5. ກົດ **Save** ແລ້ວລໍຖ້າ GitHub ສ້າງເວັບ.
6. ເປີດ URL ທີ່ GitHub Pages ສະແດງໃຫ້. ຖ້າເຫັນເວີຊັນເກົ່າ ໃຫ້ refresh ແບບລ້າງ cache ຫຼືເປີດ Private/Incognito.

## ໝາຍເຫດ

- ຕ້ອງອັບ `sw.js` ຄູ່ກັບ `index.html`; ບໍ່ຄວນອັບສະເພາະ HTML ຢ່າງດຽວ.
- `.nojekyll` ຊ່ວຍໃຫ້ GitHub ເສີບໄຟລ໌ static ໂດຍກົງ.
- ຄຳສັບຫຼັກຢູ່ໃນ HTML ແລ້ວ; ຟັງຊັນແປພາສາ, OCR, Firebase, Google Fonts ແລະຟັງຊັນອອນລາຍອື່ນໆຕ້ອງໃຊ້ Internet.
- ຖ້າໃຊ້ repository ແບບ project site, URL ຈະມີຊື່ repository ຕໍ່ທ້າຍ username.
