// page-timer.js -- shared, reusable time-tracking widget for the Pattern
// Academy pages. Two independently-tracked timers, plus playback controls:
//   1. PAGE timer   -- cumulative time spent on THIS specific page (keyed by
//                      location.pathname), resumes and keeps counting up
//                      every time you come back to the same page.
//   2. GLOBAL timer -- cumulative time spent across every page that includes
//                      this script, shared via localStorage.
//   Controls:
//   - Play/Pause (shared across all pages -- pausing means "I stepped away",
//     so it stays paused when you navigate to another page until you resume).
//   - Reset page  -- zeroes only this page's timer.
//   - Reset total -- zeroes the global timer (asks for confirmation first,
//     since it wipes cumulative progress across the whole site).
// Everything persists in localStorage (not sessionStorage) so closing the
// tab and coming back later keeps the running total and pause state.
// Ticking also auto-pauses while the tab is backgrounded (Page Visibility
// API) on top of the manual pause, so idle tabs never inflate the numbers.
// Drop `<script src="page-timer.js"></script>` into any page to get the
// floating widget -- no other markup or wiring required.
(function () {
  const GLOBAL_KEY = "cpAcademy_globalTimerSeconds";
  const PAGE_KEY = "cpAcademy_pageTimerSeconds:" + location.pathname;
  const PAUSED_KEY = "cpAcademy_timerPaused";

  function loadSeconds(key) {
    const raw = localStorage.getItem(key);
    const n = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(n) ? n : 0;
  }

  function saveSeconds(key, val) {
    try { localStorage.setItem(key, String(val)); } catch (e) { /* storage full/unavailable -- fail silently */ }
  }

  function loadPaused() {
    return localStorage.getItem(PAUSED_KEY) === "1";
  }

  function savePaused(val) {
    try { localStorage.setItem(PAUSED_KEY, val ? "1" : "0"); } catch (e) { /* ignore */ }
  }

  let pageSeconds = loadSeconds(PAGE_KEY);
  let globalSeconds = loadSeconds(GLOBAL_KEY);
  let paused = loadPaused();

  function formatDuration(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      #cpAcademyTimerWidget {
        position: fixed; bottom: 14px; right: 14px; z-index: 9999;
        background: #1c1917; color: #fbbf24; font-family: system-ui, -apple-system, sans-serif;
        font-size: 11px; font-weight: 700; border-radius: 999px; padding: 8px 10px 8px 14px;
        box-shadow: 0 4px 14px rgba(0,0,0,0.28); display: flex; gap: 9px; align-items: center;
        opacity: 0.9; user-select: none; transition: opacity .15s;
      }
      #cpAcademyTimerWidget:hover { opacity: 1; }
      #cpAcademyTimerWidget.cp-timer-paused { color: #9ca3af; }
      #cpAcademyTimerWidget .cp-timer-sep { opacity: .35; }
      #cpAcademyTimerWidget .cp-timer-label { opacity: .6; font-weight: 600; margin-right: 2px; }
      #cpAcademyTimerWidget .cp-timer-btn {
        opacity: .6; cursor: pointer; font-weight: 800; padding: 2px 4px; border-radius: 5px;
        line-height: 1; display: inline-flex; align-items: center; justify-content: center;
      }
      #cpAcademyTimerWidget .cp-timer-btn:hover { opacity: 1; background: rgba(255,255,255,0.08); }
      #cpAcademyTimerWidget .cp-timer-play { color: #4ade80; font-size: 13px; }
      #cpAcademyTimerWidget .cp-timer-reset-page:hover { color: #fbbf24; }
      #cpAcademyTimerWidget .cp-timer-reset-global:hover { color: #f87171; }
      @media (max-width: 480px) {
        #cpAcademyTimerWidget { font-size: 10px; padding: 6px 8px 6px 10px; gap: 6px; bottom: 8px; right: 8px; }
      }
    `;
    document.head.appendChild(style);
  }

  function buildWidget() {
    const wrap = document.createElement("div");
    wrap.id = "cpAcademyTimerWidget";
    wrap.innerHTML = `
      <span class="cp-timer-btn cp-timer-play" id="cpTimerPlayPause" title="Pause/resume both timers"></span>
      <span><span class="cp-timer-label">page</span><span id="cpTimerPage">00:00</span></span>
      <span class="cp-timer-sep">|</span>
      <span><span class="cp-timer-label">total</span><span id="cpTimerGlobal">00:00</span></span>
      <span class="cp-timer-btn cp-timer-reset-page" id="cpTimerResetPage" title="Reset this page's timer">&#8635; pg</span>
      <span class="cp-timer-btn cp-timer-reset-global" id="cpTimerResetGlobal" title="Reset the global timer (all pages)">&#8635; all</span>
    `;
    document.body.appendChild(wrap);

    document.getElementById("cpTimerPlayPause").addEventListener("click", function () {
      paused = !paused;
      savePaused(paused);
      updateDisplay();
    });

    document.getElementById("cpTimerResetPage").addEventListener("click", function () {
      pageSeconds = 0;
      saveSeconds(PAGE_KEY, pageSeconds);
      updateDisplay();
    });

    document.getElementById("cpTimerResetGlobal").addEventListener("click", function () {
      if (!confirm("Reset the GLOBAL timer? This wipes cumulative time across every page. Per-page timers are unaffected.")) return;
      globalSeconds = 0;
      saveSeconds(GLOBAL_KEY, globalSeconds);
      updateDisplay();
    });
  }

  function updateDisplay() {
    const wrap = document.getElementById("cpAcademyTimerWidget");
    const pageEl = document.getElementById("cpTimerPage");
    const globalEl = document.getElementById("cpTimerGlobal");
    const playPauseEl = document.getElementById("cpTimerPlayPause");
    if (pageEl) pageEl.textContent = formatDuration(pageSeconds);
    if (globalEl) globalEl.textContent = formatDuration(globalSeconds);
    if (playPauseEl) playPauseEl.innerHTML = paused ? "&#9654;" : "&#10074;&#10074;"; // play triangle or pause bars
    if (wrap) wrap.classList.toggle("cp-timer-paused", paused);
  }

  function tick() {
    // Re-read pause state every tick in case another open tab toggled it.
    paused = loadPaused();
    if (paused || document.hidden) { updateDisplay(); return; }
    pageSeconds += 1;
    globalSeconds += 1;
    saveSeconds(PAGE_KEY, pageSeconds);
    saveSeconds(GLOBAL_KEY, globalSeconds);
    updateDisplay();
  }

  function init() {
    injectStyles();
    buildWidget();
    updateDisplay();
    setInterval(tick, 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
