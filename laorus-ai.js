(function () {
  "use strict";

  const iconUrl = "/manus-storage/laorus-ai-icon_36f73105.webp";
  const localIconFallback = "/laorus-ai-icon.webp";
  const maxChars = 3_000;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function setIconSource(image) {
    image.src = iconUrl;
    image.onerror = function () {
      image.onerror = null;
      image.src = localIconFallback;
    };
  }

  function createPanel() {
    const panel = element("section");
    panel.id = "lr-ai-panel";
    panel.hidden = true;
    panel.setAttribute("role", "region");
    panel.setAttribute("aria-label", "LaoRus AI tutor");

    const wrap = element("div", "lr-ai-wrap");
    const top = element("header", "lr-ai-top");
    const icon = element("img", "lr-ai-brand-icon");
    icon.alt = "";
    setIconSource(icon);
    const heading = element("div", "lr-ai-heading");
    const title = element("h1", "", "LaoRus AI");
    title.id = "lr-ai-title";
    const subtitle = element("p", "", "ຜູ້ຊ່ວຍຮຽນພາສາລັດເຊຍ–ລາວ");
    heading.append(title, subtitle);
    const close = element("button", "lr-ai-close", "ປິດ");
    close.type = "button";
    close.setAttribute("aria-label", "ປິດ LaoRus AI");
    top.append(icon, heading, close);

    const card = element("div", "lr-ai-card");
    const cardTitle = element("h2", "", "ຖາມ ຫຼືຂໍຄຳແນະນຳການຮຽນ");
    const intro = element("p", "", "AI ຈະຄົ້ນຫາຈາກຄຳສັບ ແລະບົດຮຽນສາທາລະນະເທົ່ານັ້ນ.");
    const examples = element("div", "lr-ai-examples");
    const suggestions = [
      "ຄຳວ່າ «спасибо» ໃຊ້ແນວໃດ?",
      "ຊ່ວຍກວດໄວຍາກອນປະໂຫຍກນີ້: Я учу русский язык.",
      "ແນະນຳບົດຝຶກສັ້ນໆຈາກບົດຮຽນພາສາລັດເຊຍ",
    ];
    const label = element("label", "lr-ai-label-text", "ຄຳຖາມຂອງທ່ານ");
    label.htmlFor = "lr-ai-input";
    const input = element("textarea");
    input.id = "lr-ai-input";
    input.maxLength = maxChars;
    input.rows = 4;
    input.placeholder = "ຕົວຢ່າງ: «спасибо» ອ່ານ ແລະໃຊ້ແນວໃດ?";
    input.autocomplete = "off";
    const controls = element("div", "lr-ai-controls");
    const count = element("span", "", `0/${maxChars}`);
    count.id = "lr-ai-count";
    const submit = element("button", "lr-ai-submit", "ຖາມ LaoRus AI");
    submit.type = "submit";
    submit.disabled = true;
    controls.append(count, submit);
    const status = element("p", "", "");
    status.id = "lr-ai-status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    const form = element("form");
    form.append(label, input, controls, status);

    for (const text of suggestions) {
      const suggestion = element("button", "lr-ai-example", text);
      suggestion.type = "button";
      suggestion.addEventListener("click", function () {
        input.value = text;
        updateCount();
        input.focus();
      });
      examples.appendChild(suggestion);
    }

    const note = element(
      "p",
      "lr-ai-note",
      "ຄຳຕອບເປັນຂໍ້ແນະນຳເທົ່ານັ້ນ; AI ບໍ່ຂຽນ ຫຼືລຶບຂໍ້ມູນເວັບ. ຄຳຖາມຈະຖືກສົ່ງໃຫ້ Google Gemini ເມື່ອຕັ້ງ Gemini key, ແລະອາດໃຊ້ quota/ມີຄ່າບໍລິການຕາມບັນຊີ Google; Google ປະມວນຜົນຄຳຖາມຕາມເງື່ອນໄຂຂອງຕົນ. ຖ້າບໍ່ມີ key ຈຶ່ງກັບໄປໃຊ້ Manus project credits. ຢ່າສົ່ງ password, ຂໍ້ມູນບັນຊີ ຫຼືຂໍ້ມູນສ່ວນຕົວ. ຈຳກັດ 30 ຄຳຂໍຕໍ່ IP ໃນ 24 ຊົ່ວໂມງ.",
    );
    card.append(cardTitle, intro, examples, form, note);

    const resultCard = element("div", "lr-ai-card");
    resultCard.hidden = true;
    const resultHeading = element("h2", "", "ຂໍ້ແນະນຳ");
    const resultText = element("div");
    resultText.id = "lr-ai-result";
    const copy = element("button", "lr-ai-copy", "ຄັດລອກຄຳຕອບ");
    copy.type = "button";
    resultCard.append(resultHeading, resultText, copy);

    wrap.append(top, card, resultCard);
    panel.appendChild(wrap);
    document.body.appendChild(panel);

    function updateCount() {
      count.textContent = `${input.value.length}/${maxChars}`;
      submit.disabled = !input.value.trim() || submit.dataset.busy === "true";
    }

    input.addEventListener("input", updateCount);
    close.addEventListener("click", function () {
      panel.hidden = true;
      const tab = document.querySelector("#bar [data-lr-ai-tab]");
      if (tab) {
        tab.setAttribute("aria-current", "false");
        tab.focus();
      }
    });

    copy.addEventListener("click", async function () {
      try {
        await navigator.clipboard.writeText(resultText.textContent);
        status.dataset.kind = "success";
        status.textContent = "ຄັດລອກຄຳຕອບແລ້ວ";
      } catch {
        status.dataset.kind = "error";
        status.textContent = "ຄັດລອກບໍ່ສຳເລັດ; ກະລຸນາເລືອກຂໍ້ຄວາມແລ້ວຄັດລອກເອງ";
      }
    });

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      const question = input.value.trim();
      if (!question || submit.dataset.busy === "true") return;
      submit.dataset.busy = "true";
      submit.disabled = true;
      status.dataset.kind = "pending";
      status.textContent = "ກຳລັງຄິດ…";
      resultCard.hidden = true;

      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 60_000);
      try {
        const response = await fetch("/api/tutor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: question }),
          signal: controller.signal,
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || `HTTP ${response.status}`);
        if (typeof payload.result !== "string" || !payload.result.trim()) {
          throw new Error("AI ບໍ່ໄດ້ສົ່ງຄຳຕອບທີ່ໃຊ້ໄດ້");
        }
        resultText.textContent = payload.result;
        resultCard.hidden = false;
        status.dataset.kind = "success";
        status.textContent = "ສຳເລັດ — ກະລຸນາກວດຄຳແນະນຳກ່ອນນຳໃຊ້";
        resultCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } catch (error) {
        status.dataset.kind = "error";
        status.textContent = error.name === "AbortError"
          ? "AI ໃຊ້ເວລາດົນເກີນໄປ; ຄຳຖາມຍັງຢູ່, ກະລຸນາລອງໃໝ່"
          : (error.message || "ສົ່ງຄຳຖາມບໍ່ສຳເລັດ; ລອງໃໝ່");
      } finally {
        window.clearTimeout(timer);
        submit.dataset.busy = "false";
        updateCount();
      }
    });

    return panel;
  }

  function install() {
    const bar = document.getElementById("bar");
    if (!bar || bar.querySelector("[data-lr-ai-tab]")) return Boolean(bar);

    const tab = element("button", "bi lr-ai-tab");
    tab.type = "button";
    tab.dataset.lrAiTab = "true";
    tab.setAttribute("aria-label", "LaoRus AI — ຜູ້ຊ່ວຍຮຽນພາສາ");
    tab.setAttribute("aria-controls", "lr-ai-panel");
    tab.setAttribute("aria-expanded", "false");
    tab.setAttribute("aria-current", "false");
    const icon = element("span", "em");
    icon.setAttribute("aria-hidden", "true");
    const image = element("img");
    image.alt = "";
    setIconSource(image);
    icon.appendChild(image);
    const label = element("span", "lr-ai-label", "LaoRus AI");
    tab.append(icon, label);
    const panel = createPanel();

    function closePanel() {
      if (panel.hidden) return;
      panel.hidden = true;
      tab.setAttribute("aria-current", "false");
      tab.setAttribute("aria-expanded", "false");
    }

    tab.addEventListener("click", function () {
      const opening = panel.hidden;
      panel.hidden = !opening;
      tab.setAttribute("aria-current", String(opening));
      tab.setAttribute("aria-expanded", String(opening));
      if (opening) {
        bar.querySelectorAll(".bi:not([data-lr-ai-tab])").forEach((item) => item.setAttribute("aria-current", "false"));
        const input = document.getElementById("lr-ai-input");
        if (input) input.focus();
      }
    });
    bar.addEventListener("click", function (event) {
      const clickedTab = event.target.closest(".bi");
      if (clickedTab && clickedTab !== tab) closePanel();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !panel.hidden) closePanel();
    });
    bar.appendChild(tab);
    return true;
  }

  function start() {
    // ສະແດງແຖບ AI ສະເພາະເມື່ອມີ server (/api) ພ້ອມໃຊ້ງານ; ເວັບ static ຈະບໍ່ເຫັນແຖບນີ້
    fetch("/_app/health", { cache: "no-store" }).then(function (r) {
      return r.ok ? r.json() : null;
    }).then(function (j) {
      if (j && j.ok) begin();
    }).catch(function () {});
  }

  function begin() {
    if (install()) return;
    const observer = new MutationObserver(function () {
      if (install()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 10_000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
