const KEYS = {
  patient: "einsatzdoku_patientenfragen",
  report: "einsatzdoku_berichte"
};

function getItems(key) {
  return JSON.parse(localStorage.getItem(key) || "[]");
}

function setItems(key, items) {
  localStorage.setItem(key, JSON.stringify(items));
}

function readForm(form) {
  const data = {};
  form.querySelectorAll("input, textarea, select").forEach((el) => {
    if (!el.name) return;
    if (el.type === "checkbox") {
      if (!data[el.name]) data[el.name] = [];
      if (el.checked) data[el.name].push(el.value || "true");
    } else if (el.type === "radio") {
      if (el.checked) data[el.name] = el.value;
    } else {
      data[el.name] = el.value;
    }
  });
  return data;
}

function escapeHtml(str) {
  return String(str)
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
    const items = getItems(storageKey);
    items.unshift({
      savedAt: new Date().toLocaleString("de-DE"),
      data: readForm(form)
    });
    setItems(storageKey, items);
    window.location.href = redirectTo;
  });
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
      return `<div class="saved-field"><strong>${escapeHtml(key)}</strong>${escapeHtml(text)}</div>`;
    }).join("");

    return `
      <article class="saved-item">
        <h3>${type === "patient" ? "Patientenfrage" : "Bericht"} ${index + 1}</h3>
        <div class="meta">${escapeHtml(entry.savedAt)}</div>
        <div class="saved-grid">${fields}</div>
      </article>
    `;
  }).join("");
}

function setupSwitcher() {
  const buttons = document.querySelectorAll(".tab-btn");
  if (!buttons.length) return;

  let active = "patient";
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
    if (confirm("Alle gespeicherten Einträge wirklich löschen?")) {
      setItems(KEYS.patient, []);
      setItems(KEYS.report, []);
      renderEntries("patient");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  saveForm("patientForm", KEYS.patient, "gespeichert.html");
  saveForm("reportForm", KEYS.report, "gespeichert.html");
  setupSwitcher();
  setupClear();
});
