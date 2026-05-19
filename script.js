const STORAGE_KEY = "einsatzdoku_entries";

function getEntries() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function setEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
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

function renderSaved() {
  const list = document.getElementById("savedList");
  if (!list) return;

  const entries = getEntries();
  if (!entries.length) {
    list.innerHTML = '<div class="placeholder-box">Noch keine Einträge gespeichert.</div>';
    return;
  }

  list.innerHTML = entries.map((entry, index) => {
    const items = Object.entries(entry.data).map(([key, value]) => {
      const text = Array.isArray(value) ? value.join(", ") : (value || "-");
      return `<div class="saved-field"><strong>${escapeHtml(key)}</strong>${escapeHtml(text)}</div>`;
    }).join("");

    return `<article class="saved-item"><h3>Eintrag ${index + 1}</h3><div class="meta">${escapeHtml(entry.savedAt)}</div><div class="saved-grid">${items}</div></article>`;
  }).join("");
}

function setupForm() {
  const form = document.getElementById("patientForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const entries = getEntries();
    entries.unshift({
      savedAt: new Date().toLocaleString("de-DE"),
      data: readForm(form)
    });
    setEntries(entries);
    window.location.href = "gespeichert.html";
  });
}

function setupClear() {
  const btn = document.getElementById("clearAllBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    if (confirm("Alle gespeicherten Einträge wirklich löschen?")) {
      setEntries([]);
      renderSaved();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupForm();
  renderSaved();
  setupClear();
});
