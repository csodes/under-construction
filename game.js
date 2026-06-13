/* Brick Stacker — a tiny one-tap stacking game shown in a modal. */

(function () {
  "use strict";

  var modal = document.getElementById("gameModal");
  var openBtn = document.getElementById("openGame");
  var closeBtn = document.getElementById("closeGame");
  var canvas = document.getElementById("gameCanvas");
  var ctx = canvas.getContext("2d");
  var scoreEl = document.getElementById("gameScore");
  var bestEl = document.getElementById("gameBest");
  var messageEl = document.getElementById("gameMessage");
  var messageText = document.getElementById("gameMessageText");
  var actionBtn = document.getElementById("gameAction");

  if (!modal || !canvas) return;

  /* ---------- Constants ---------- */
  var W = canvas.width; // logical pixels (320)
  var H = canvas.height; // 480
  var BRICK_H = 26;
  var GROUND = 8; // bottom margin
  var VISIBLE_ROWS = 7; // rows kept on screen before camera scrolls
  var BASE_WIDTH = 150;
  var START_SPEED = 2.2;
  var SPEED_STEP = 0.14;
  var MAX_SPEED = 7;
  var PERFECT_TOL = 4; // px tolerance for a "perfect" drop

  var COLORS = ["#ffcb05", "#ff6b35", "#0f3460", "#533483", "#16a085"];

  var BEST_KEY = "brickStackerBest";

  /* ---------- State ---------- */
  var state = "ready"; // ready | playing | over
  var bricks; // placed bricks: {x, width, level, color}
  var current; // moving brick
  var slivers; // falling cut-off pieces
  var speed;
  var dir; // +1 / -1 slide direction
  var cameraLevel; // float, lerps toward target
  var score;
  var best = parseInt(localStorage.getItem(BEST_KEY) || "0", 10) || 0;
  var rafId = null;

  bestEl.textContent = best;

  /* ---------- Helpers ---------- */
  function screenY(level) {
    // Lower levels sit near the bottom; higher levels rise up the canvas.
    return H - GROUND - (level - cameraLevel + 1) * BRICK_H;
  }

  function colorFor(level) {
    return COLORS[level % COLORS.length];
  }

  function reset() {
    bricks = [];
    slivers = [];
    speed = START_SPEED;
    dir = 1;
    cameraLevel = 0;
    score = 0;
    scoreEl.textContent = "0";

    // Base brick, centered.
    bricks.push({
      x: (W - BASE_WIDTH) / 2,
      width: BASE_WIDTH,
      level: 0,
      color: colorFor(0),
    });
    spawnBrick();
  }

  function spawnBrick() {
    var top = bricks[bricks.length - 1];
    var fromLeft = Math.random() < 0.5;
    dir = fromLeft ? 1 : -1;
    current = {
      x: fromLeft ? -top.width : W,
      width: top.width,
      level: top.level + 1,
      color: colorFor(top.level + 1),
    };
  }

  /* ---------- Game flow ---------- */
  function startGame() {
    reset();
    state = "playing";
    messageEl.classList.remove("show");
    if (!rafId) loop();
  }

  function drop() {
    if (state !== "playing") return;

    var below = bricks[bricks.length - 1];
    var left = Math.max(current.x, below.x);
    var right = Math.min(current.x + current.width, below.x + below.width);
    var overlap = right - left;

    if (overlap <= 0) {
      gameOver();
      return;
    }

    // Perfect drop: snap to the brick below, no shrink.
    if (current.width - overlap <= PERFECT_TOL) {
      left = below.x;
      overlap = below.width;
    } else {
      // Cut off the overhang as a falling sliver for flavor.
      if (current.x < left) {
        slivers.push({ x: current.x, y: screenY(current.level), width: left - current.x, color: current.color, vy: 0 });
      }
      var curRight = current.x + current.width;
      if (curRight > right) {
        slivers.push({ x: right, y: screenY(current.level), width: curRight - right, color: current.color, vy: 0 });
      }
    }

    bricks.push({ x: left, width: overlap, level: current.level, color: current.color });
    score++;
    scoreEl.textContent = score;
    speed = Math.min(MAX_SPEED, speed + SPEED_STEP);
    spawnBrick();
  }

  function gameOver() {
    state = "over";
    if (score > best) {
      best = score;
      localStorage.setItem(BEST_KEY, String(best));
      bestEl.textContent = best;
      messageText.innerHTML = "🏆 New best: <b>" + score + "</b>!<br />Nicely stacked.";
    } else {
      messageText.innerHTML = "💥 Toppled at height <b>" + score + "</b>.<br />Give it another go!";
    }
    actionBtn.textContent = "Play again 🔁";
    messageEl.classList.add("show");
  }

  /* ---------- Update + render ---------- */
  function update() {
    if (state === "playing") {
      current.x += speed * dir;
      // Bounce within a generous range so the brick is always reachable.
      var min = -current.width + 10;
      var max = W - 10;
      if (current.x <= min) { current.x = min; dir = 1; }
      if (current.x >= max) { current.x = max; dir = -1; }

      // Scroll camera up as the tower grows.
      var top = bricks[bricks.length - 1];
      var target = Math.max(0, top.level - VISIBLE_ROWS);
      cameraLevel += (target - cameraLevel) * 0.12;
    }

    // Advance falling slivers.
    for (var i = slivers.length - 1; i >= 0; i--) {
      var s = slivers[i];
      s.vy += 0.6;
      s.y += s.vy;
      if (s.y > H + 40) slivers.splice(i, 1);
    }
  }

  function drawBrick(b) {
    var y = screenY(b.level);
    ctx.fillStyle = b.color;
    roundRect(b.x, y, b.width, BRICK_H - 3, 4);
    ctx.fill();
    // Mortar line highlight on top edge.
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(b.x + 3, y + 2, Math.max(0, b.width - 6), 2);
  }

  function roundRect(x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function render() {
    ctx.clearRect(0, 0, W, H);

    // Subtle gridline backdrop.
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    for (var gx = 0; gx <= W; gx += 32) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, H);
      ctx.stroke();
    }

    for (var i = 0; i < bricks.length; i++) drawBrick(bricks[i]);

    if (state === "playing") drawBrick(current);

    // Falling slivers.
    for (var j = 0; j < slivers.length; j++) {
      var s = slivers[j];
      ctx.fillStyle = s.color;
      ctx.globalAlpha = 0.85;
      ctx.fillRect(s.x, s.y, s.width, BRICK_H - 3);
      ctx.globalAlpha = 1;
    }
  }

  function loop() {
    update();
    render();
    rafId = requestAnimationFrame(loop);
  }

  /* ---------- Input ---------- */
  function handleAction() {
    if (state === "playing") drop();
    else startGame();
  }

  canvas.addEventListener("pointerdown", function (e) {
    e.preventDefault();
    if (state === "playing") drop();
  });

  actionBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    handleAction();
  });

  /* ---------- Modal open/close ---------- */
  function openModal() {
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    state = "ready";
    // Draw an initial frame (base brick preview) without starting play.
    reset();
    state = "ready";
    messageText.innerHTML = "Tap to drop the brick.<br />Stack 'em as high as you can!";
    actionBtn.textContent = "Start 🧱";
    messageEl.classList.add("show");
    if (!rafId) loop();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
    state = "ready";
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  openBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", function (e) {
    if (e.target === modal) closeModal();
  });

  document.addEventListener("keydown", function (e) {
    if (modal.hidden) return;
    if (e.key === "Escape") {
      closeModal();
    } else if (e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      handleAction();
    }
  });
})();
