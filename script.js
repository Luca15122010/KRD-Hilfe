const KEYS = {
  patient: "einsatzdoku_patientenfragen",
  report: "einsatzdoku_berichte",
  xabcde: "einsatzdoku_xabcde"
};

function getItems(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function setItems(key, items) {
  localStorage.setItem(key, JSON.stringify(items));
}

function readForm(form) {
  const data = {};
  const elements = form.querySelectorAll("input, textarea, select");

  elements.forEach((el) => {
    if (!el.name) return;

    if (el.type === "checkbox") {
      if (!data[el.name]) data[el.name] = [];
      if (el.checked) data[el.name].push(el.value || "true");
      return;
    }

    if (el.type === "radio") {
      if (el.checked) data[el.name] = el.value;
      return;
    }

    data[el.name] = el.value;
  });

  return data;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function saveForm(formId, storageKey, redirectTo) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const entry = {
      savedAt: new Date().toLocaleString("de-DE"),
      data: readForm(form)
    };

    const items = getItems(storageKey);
    items.unshift(entry);
    setItems(storageKey, items);

    if (redirectTo) {
      window.location.href = redirectTo;
    }
  });
}

function formatLabel(key) {
  return key
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function renderEntries(type) {
  const list = document.getElementById("savedList");
  if (!list) return;

  const items = getItems(KEYS[type]);

  if (!items.length) {
    list.innerHTML = '<div class="placeholder-box">Noch keine Einträge gespeichert.</div>';
    return;
  }

  list.innerHTML = items.map((entry, index) => {
    const fields = Object.entries(entry.data).map(([key, value]) => {
      const text = Array.isArray(value) ? value.join(", ") : (value || "-");
      return `
        <div class="saved-field">
          <strong>${escapeHtml(formatLabel(key))}</strong>
          ${escapeHtml(text)}
        </div>
      `;
    }).join("");

    const title =
      type === "patient" ? "Patientenfrage" :
      type === "report" ? "Bericht" :
      "xABCDE";

    return `
      <article class="saved-item">
        <h3>${title} ${index + 1}</h3>
        <div class="meta">${escapeHtml(entry.savedAt)}</div>
        <div class="saved-grid">${fields}</div>
      </article>
    `;
  }).join("");
}

function setupSwitcher() {
  const buttons = document.querySelectorAll(".tab-btn");
  if (!buttons.length) return;

  let active = buttons[0]?.dataset.view || "patient";
  renderEntries(active);

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      active = btn.dataset.view;
      renderEntries(active);
    });
  });
}

function setupClear() {
  const btn = document.getElementById("clearAllBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const ok = confirm("Alle gespeicherten Einträge wirklich löschen?");
    if (!ok) return;

    Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
    renderEntries(document.querySelector(".tab-btn.active")?.dataset.view || "patient");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  saveForm("patientForm", KEYS.patient, "gespeichert.html");
  saveForm("reportForm", KEYS.report, "gespeichert.html");
  saveForm("xabcdeForm", KEYS.xabcde, "gespeichert.html");
  setupSwitcher();
  setupClear();
});
