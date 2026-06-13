/* Under Construction — a little interactivity to keep things fun. */

(function () {
  "use strict";

  /* --------- Rotating taglines --------- */
  var taglines = [
    "Pardon our dust — we're building something awesome.",
    "Our hamsters are running as fast as they can. 🐹",
    "Measuring twice, cutting once. ✂️",
    "Pouring fresh pixels as we speak. 🎨",
    "Tightening the last few bolts. 🔧",
    "We promise it'll be worth the wait!",
    "Currently herding bytes into place… 🐑",
    "Brewing something special. ☕",
  ];

  var taglineEl = document.getElementById("tagline");
  var taglineIndex = 0;

  function rotateTagline() {
    taglineIndex = (taglineIndex + 1) % taglines.length;
    taglineEl.style.opacity = "0";
    setTimeout(function () {
      taglineEl.textContent = taglines[taglineIndex];
      taglineEl.style.transition = "opacity 0.4s ease";
      taglineEl.style.opacity = "0.9";
    }, 400);
  }
  setInterval(rotateTagline, 3500);

  /* --------- Faux progress bar that never quite finishes --------- */
  var fill = document.getElementById("progressFill");
  var label = document.getElementById("progressLabel");
  var progress = 0;

  function tickProgress() {
    // Creep toward 99% with diminishing steps — the classic "almost done".
    var remaining = 99 - progress;
    progress += Math.max(0.2, remaining * 0.04);
    if (progress > 99) progress = 99;
    fill.style.width = progress + "%";
    label.textContent = Math.floor(progress) + "%";
    document.querySelector(".progress").setAttribute("aria-valuenow", Math.floor(progress));
  }
  tickProgress();
  setInterval(tickProgress, 600);

  /* --------- "Hammer Time" button: bumps progress + celebratory burst --------- */
  var btn = document.getElementById("ctaBtn");
  var hardhat = document.querySelector(".hardhat");
  var clicks = 0;

  var quips = [
    "BONK! 🔨",
    "Nailed it! 🔨",
    "Stop! Hammer time. 🎵",
    "Construction intensifies… 🏗️",
    "+1 productivity ⚡",
    "You can't touch this. ✋",
  ];

  btn.addEventListener("click", function () {
    clicks++;
    btn.textContent = quips[clicks % quips.length];

    // Give the worker a celebratory spin.
    hardhat.classList.remove("spin");
    void hardhat.offsetWidth; // force reflow to restart animation
    hardhat.classList.add("spin");

    burstConfetti();

    // Nudge progress forward as a reward.
    progress = Math.min(99, progress + 3);
    fill.style.width = progress + "%";
    label.textContent = Math.floor(progress) + "%";
  });

  /* --------- Floating tool emojis --------- */
  var emojis = ["🔧", "🔨", "🪛", "⚙️", "🚧", "🏗️", "🧱", "📐", "🪜", "🛠️"];
  var floaties = document.querySelector(".floaties");

  function spawnFloatie() {
    var el = document.createElement("span");
    el.className = "floatie";
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.left = Math.random() * 100 + "vw";
    el.style.fontSize = 1.4 + Math.random() * 1.8 + "rem";
    var duration = 8 + Math.random() * 8;
    el.style.animationDuration = duration + "s";
    floaties.appendChild(el);
    setTimeout(function () {
      el.remove();
    }, duration * 1000);
  }

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!prefersReducedMotion) {
    setInterval(spawnFloatie, 1400);
    for (var i = 0; i < 4; i++) setTimeout(spawnFloatie, i * 500);
  }

  /* --------- Tiny confetti burst (canvas-free, DOM based) --------- */
  function burstConfetti() {
    if (prefersReducedMotion) return;
    var colors = ["#ffcb05", "#ff6b35", "#533483", "#0f3460", "#ffffff"];
    var rect = btn.getBoundingClientRect();
    var originX = rect.left + rect.width / 2;
    var originY = rect.top + rect.height / 2;

    for (var i = 0; i < 18; i++) {
      var piece = document.createElement("div");
      piece.style.position = "fixed";
      piece.style.left = originX + "px";
      piece.style.top = originY + "px";
      piece.style.width = "8px";
      piece.style.height = "8px";
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
      piece.style.pointerEvents = "none";
      piece.style.zIndex = "999";
      document.body.appendChild(piece);

      var angle = Math.random() * Math.PI * 2;
      var velocity = 60 + Math.random() * 120;
      var dx = Math.cos(angle) * velocity;
      var dy = Math.sin(angle) * velocity - 80;

      piece.animate(
        [
          { transform: "translate(0, 0) rotate(0deg)", opacity: 1 },
          {
            transform: "translate(" + dx + "px, " + (dy + 200) + "px) rotate(" + Math.random() * 720 + "deg)",
            opacity: 0,
          },
        ],
        { duration: 900 + Math.random() * 400, easing: "cubic-bezier(0.2, 0.8, 0.3, 1)" }
      ).onfinish = function () {
        this.effect.target.remove();
      };
    }
  }

  /* --------- Worker high-fives you back on click --------- */
  hardhat.addEventListener("click", function () {
    hardhat.classList.remove("spin");
    void hardhat.offsetWidth;
    hardhat.classList.add("spin");
    burstConfetti();
  });

  /* --------- Konami-ish easter egg: type "build" --------- */
  var buffer = "";
  document.addEventListener("keydown", function (e) {
    buffer = (buffer + e.key).slice(-5).toLowerCase();
    if (buffer === "build") {
      document.body.style.transition = "filter 0.5s";
      document.body.style.filter = "hue-rotate(180deg)";
      taglineEl.textContent = "🎉 Secret build mode activated! 🎉";
      for (var i = 0; i < 5; i++) setTimeout(burstConfetti, i * 150);
      setTimeout(function () {
        document.body.style.filter = "";
      }, 3000);
    }
  });
})();
