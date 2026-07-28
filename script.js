// LPE-GM Mission Control — Spec Section 4 (styling/behavior) + Section 9 (config-driven
// personalization, no per-unit site changes). Content in units.json is placeholder — see
// site/README.md and Engineering-Log.md open questions.

const DEFAULT_UNIT_ID = "LPE-GM-001";

// Inline fallback so the page still works when opened directly (file://), which blocks
// fetch() of local JSON in most browsers. GitHub Pages serves over https, where the
// units.json fetch below is the real path.
const FALLBACK_UNITS = {
  "LPE-GM-001": {
    name: "[NAME]",
    callsign: "BEST MAN",
    objectives: [
      "Report for duty on [DATE] — full mission briefing at check-in.",
      "Secure the groom's suit, rings, and general composure. In that order.",
      "Deliver the best man speech. Keep it under control; keep it real.",
      "Stand beside [GROOM] at the altar. This is the actual mission.",
    ],
    hiddenMessage: "SERVICE LOG — This unit was custom-built by [GROOM] for one reason: you've always shown up when it counted. Every objective on this screen is real — [DATE], for real. Thanks for saying yes to standing up there with me. — [GROOM]",
  },
};

function getUnitId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("unit") || DEFAULT_UNIT_ID;
}

async function loadUnits() {
  try {
    const res = await fetch("units.json", { cache: "no-store" });
    if (!res.ok) throw new Error("units.json not reachable");
    const data = await res.json();
    return data.units;
  } catch (err) {
    console.warn("Falling back to inline unit data:", err.message);
    return FALLBACK_UNITS;
  }
}

function typewriter(el, lines, lineDelayMs = 220) {
  let i = 0;
  el.textContent = "";
  const timer = setInterval(() => {
    if (i >= lines.length) { clearInterval(timer); return; }
    el.textContent += (i > 0 ? "\n" : "") + lines[i];
    i++;
  }, lineDelayMs);
}

function renderClock() {
  const el = document.getElementById("clock");
  const tick = () => { el.textContent = new Date().toLocaleTimeString([], { hour12: false }); };
  tick();
  setInterval(tick, 1000);
}

function setupHiddenMenu(unit) {
  const toggle = document.getElementById("adminToggle");
  const menu = document.getElementById("hiddenMenu");
  const closeBtn = document.getElementById("hiddenClose");
  const messageEl = document.getElementById("hiddenMessage");
  messageEl.textContent = unit.hiddenMessage || "";

  // Secret-menu gesture: 5 taps within 3 seconds. Placeholder mechanism — Rev A's exact
  // "hidden menu" spec isn't in this project folder, see Engineering-Log.md.
  let taps = 0;
  let resetTimer = null;
  const open = () => { menu.hidden = false; };
  const close = () => { menu.hidden = true; };

  toggle.addEventListener("click", () => {
    taps++;
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => { taps = 0; }, 3000);
    if (taps >= 5) { taps = 0; open(); }
  });
  closeBtn.addEventListener("click", close);
  menu.addEventListener("click", (e) => { if (e.target === menu) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
}

async function main() {
  renderClock();

  const unitId = getUnitId();
  const units = await loadUnits();
  const unit = units[unitId] || Object.values(units)[0];

  document.getElementById("pName").textContent = unit.name;
  document.getElementById("pCallsign").textContent = unit.callsign;
  document.getElementById("pSerial").textContent = unitId;

  const objectivesEl = document.getElementById("objectivesList");
  objectivesEl.innerHTML = "";
  (unit.objectives || []).forEach((line) => {
    const li = document.createElement("li");
    li.textContent = line;
    objectivesEl.appendChild(li);
  });

  typewriter(document.getElementById("bootLog"), [
    "LPE-GM MISSION CONTROL",
    "LINK ESTABLISHED...OK",
    `UNIT ${unitId}...ONLINE`,
    "ALL SYSTEMS NOMINAL",
  ]);

  setupHiddenMenu(unit);
}

main();
