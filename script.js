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
  form.querySelectorAll("input, textarea, select").forEach((el) => {
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

function formatLabel(key) {
  return key.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function saveForm(formId, storageKey, redirectTo) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const entry = {
      id: Date.now() + "-" + Math.random().toString(36).slice(2, 9),
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

function deleteEntry(type, id) {
  const items = getItems(KEYS[type]).filter((item) => item.id !== id);
  setItems(KEYS[type], items);
  renderEntries(type);
}

function renderEntries(type) {
  const list = document.getElementById("savedList");
  if (!list) return;

  const items = getItems(KEYS[type]);

  if (!items.length) {
    list.innerHTML = '<div class="placeholder-box">Noch keine Einträge gespeichert.</div>';
    return;
  }

  const title =
    type === "patient" ? "Patientenfrage" :
    type === "report" ? "Bericht" :
    "xABCDE";

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

    return `
      <article class="saved-item">
        <div class="saved-item-head">
          <h3>${title} ${index + 1}</h3>
          <button class="delete-btn" type="button" data-type="${type}" data-id="${entry.id}">Löschen</button>
        </div>
        <div class="meta">${escapeHtml(entry.savedAt)}</div>
        <div class="saved-grid">${fields}</div>
      </article>
    `;
  }).join("");

  list.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.type;
      const id = btn.dataset.id;
      if (!confirm("Diesen Eintrag wirklich löschen?")) return;
      deleteEntry(type, id);
    });
  });
}

function setupSwitcher() {
  const buttons = document.querySelectorAll(".tab-btn");
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderEntries(btn.dataset.view);
    });
  });

  const active = document.querySelector(".tab-btn.active") || buttons[0];
  if (active) {
    buttons.forEach((b) => b.classList.remove("active"));
    active.classList.add("active");
    renderEntries(active.dataset.view);
  }
}

function setupClear() {
  const btn = document.getElementById("clearAllBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    if (!confirm("Alle gespeicherten Einträge wirklich löschen?")) return;

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
