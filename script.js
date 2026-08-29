// LPE-GM Mission Control — Spec Section 4 (styling/behavior) + Section 9 (config-driven
// personalization, no per-unit site changes). Content in units.json is placeholder — see
// site/README.md and Engineering-Log.md open questions.

const DEFAULT_UNIT_ID = "LPE-GM-001";

// Inline fallback so the page still works when opened directly (file://), which blocks
// fetch() of local JSON in most browsers. GitHub Pages serves over https, where the
// units.json fetch below is the real path.
const FALLBACK_UNITS = {
  "LPE-GM-001": {
    name: "JAKE",
    callsign: "BEST MAN",
    serial: "GFAB",
    objectives: [
      "Report for duty on 10.20.2028 — full mission briefing at check-in.",
      "Secure the groom's suit, rings, and general composure. In that order.",
      "Deliver the best man speech. Keep it under control; keep it real.",
      "Stand beside Skyler at the altar. This is the actual mission.",
    ],
    hiddenMessage: "SERVICE LOG — This unit was custom-built by Skyler for one reason: you've always shown up when it counted. Every objective on this screen is real — 10.20.2028, for real. Thanks for saying yes to standing up there with me. — Skyler",
    puzzleClue: "◈ INTERCEPT — SRC UNKNOWN — 61% RECOVERED ◈\n\n\"...not all of them are true. only one. it has to go first, alone — the other one still lying, still wrong. it cannot look away. not once. not even to blink — or the count forgets itself and you begin again from nothing. the second one only tells the truth after the first has already proven itself, by itself, with no one watching...\"\n\n◈ SIGNAL LOST ◈",
    puzzleLinkUrl: "",
    puzzleLinkText: "CLICK HERE TO SOLVE PUZZLE",
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

function renderAnomalyHint() {
  // Made deliberately easy to notice/access (2026-08-28) — this used to be inert
  // text pointing at an obscure 5-tap footer gesture; it's now a directly tappable
  // button that opens the puzzle straight away. Still appears with a short delay
  // (a "boot sequence found something" beat) rather than instantly.
  setTimeout(() => {
    const hint = document.getElementById("anomalyHint");
    if (hint) hint.hidden = false;
  }, 1500);
}

function renderPuzzle(unit) {
  const clueEl = document.getElementById("puzzleClue");
  clueEl.textContent = unit.puzzleClue || "";

  const linkEl = document.getElementById("puzzleLink");
  if (unit.puzzleLinkUrl) {
    linkEl.href = unit.puzzleLinkUrl;
    linkEl.textContent = unit.puzzleLinkText || "CLICK HERE TO SOLVE PUZZLE";
    linkEl.classList.remove("puzzle-link-pending");
    linkEl.removeAttribute("aria-disabled");
  } else {
    linkEl.removeAttribute("href");
    linkEl.textContent = "[ CHANNEL NOT YET PATCHED ]";
    linkEl.classList.add("puzzle-link-pending");
    linkEl.setAttribute("aria-disabled", "true");
  }
}

function setupHiddenMenu(unit) {
  const toggle = document.getElementById("adminToggle");
  const menu = document.getElementById("hiddenMenu");
  const closeBtn = document.getElementById("hiddenClose");
  const messageEl = document.getElementById("hiddenMessage");
  messageEl.textContent = unit.hiddenMessage || "";
  renderPuzzle(unit);

  const open = () => { menu.hidden = false; };
  const close = () => { menu.hidden = true; };

  // Primary entrance (2026-08-28): the visible anomaly-hint button opens the menu
  // directly — no gesture required. This is now the intended way in.
  const anomalyBtn = document.getElementById("anomalyHint");
  if (anomalyBtn) anomalyBtn.addEventListener("click", open);

  // Secret-menu gesture kept as a fallback/easter egg: 5 taps within 4.5s on the
  // small footer dot also opens the same menu. Placeholder mechanism — Rev A's
  // exact "hidden menu" spec isn't in this project folder, see Engineering-Log.md.
  let taps = 0;
  let resetTimer = null;
  toggle.addEventListener("click", () => {
    taps++;
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => { taps = 0; }, 4500);
    if (taps >= 5) { taps = 0; open(); }
  });
  closeBtn.addEventListener("click", close);
  menu.addEventListener("click", (e) => { if (e.target === menu) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
}

function armAcceptGate(startSequence) {
  // Nothing in the main panel starts (typewriter, anomaly hint, hidden-menu
  // gesture) until the user taps through — the accept button is the actual
  // entry point on mobile, not page load.
  const landing = document.getElementById("landing");
  const crt = document.getElementById("crt");
  const acceptBtn = document.getElementById("acceptBtn");
  acceptBtn.addEventListener("click", () => {
    landing.hidden = true;
    crt.hidden = false;
    startSequence();
  }, { once: true });
}

async function main() {
  renderClock();

  const unitId = getUnitId();
  const units = await loadUnits();
  const unit = units[unitId] || Object.values(units)[0];

  document.getElementById("pName").textContent = unit.name;
  document.getElementById("pCallsign").textContent = unit.callsign;
  document.getElementById("pSerial").textContent = unit.serial || unitId;

  const objectivesEl = document.getElementById("objectivesList");
  objectivesEl.innerHTML = "";
  (unit.objectives || []).forEach((line) => {
    const li = document.createElement("li");
    li.textContent = line;
    objectivesEl.appendChild(li);
  });

  // Wires the footer's 5-tap gesture to the hidden service menu (personal
  // message + the AUX CHANNEL puzzle clue/link). Safe to arm now — inert
  // until the user finds and taps it, same as before this landing gate existed.
  setupHiddenMenu(unit);

  armAcceptGate(() => {
    typewriter(document.getElementById("bootLog"), [
      "LPE-GM MISSION CONTROL",
      "LINK ESTABLISHED...OK",
      `UNIT ${unitId}...ONLINE`,
      "ALL SYSTEMS NOMINAL",
    ]);
    renderAnomalyHint();
  });
}

main();
