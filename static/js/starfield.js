(() => {
  'use strict';

  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  /** @type {CanvasRenderingContext2D} */
  const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });

  // 配置：在 home 中不启用鼠标视角和滚轮速度，避免干扰页面滚动
  const SHOW_HUD = false;
  const ENABLE_MOUSE_LOOK = false;
  const ENABLE_SPEED_CONTROL = false;

  // 画布与投影参数
  let dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 3));
  let width = 0;
  let height = 0;
  let centerX = 0;
  let centerY = 0;
  let focalLength = 0;

  // 星体参数
  /** @type {Array<{x:number,y:number,z:number,px:number,py:number,color:number}>} */
  let stars = [];
  let starCount = 0;
  let starFieldDepth = 800;
  const zNear = 4;

  // 相机姿态
  let yaw = 0;
  let pitch = 0;
  let targetYaw = 0;
  let targetPitch = 0;
  const maxYaw = 0.5;
  const maxPitch = 0.35;
  const viewLerp = 0.085;

  // 速度控制（以 80 为 1.0x 基数）
  let speed = 80 * 0.3; // 默认 0.3x
  const minSpeed = 20;
  const maxSpeed = 800; // 10x

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function getFadeAlpha(currentSpeed) {
    const t = (currentSpeed - minSpeed) / (maxSpeed - minSpeed);
    return clamp(0.35 - t * 0.31, 0.04, 0.35);
  }

  function colorForStar(shade) {
    const s = Math.round(200 + shade * 55);
    return `rgb(${s - 10}, ${s - 10}, ${s})`;
  }

  function resize() {
    dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 3));
    width = Math.floor(window.innerWidth);
    height = Math.floor(window.innerHeight);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    centerX = width / 2;
    centerY = height / 2;
    focalLength = Math.max(300, Math.min(width, height)) * 0.9;

    const area = width * height;
    const targetCount = clamp(Math.floor(area * 0.0011), 600, 2600);
    if (targetCount !== starCount) {
      starCount = targetCount;
      initStars();
    }

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
  }

  function initStars() {
    stars = new Array(starCount);
    for (let i = 0; i < starCount; i++) {
      stars[i] = spawnStar(true);
    }
  }

  function spawnStar(isInit = false) {
    const spreadX = width * 0.9;
    const spreadY = height * 0.9;
    const x = (Math.random() * 2 - 1) * spreadX;
    const y = (Math.random() * 2 - 1) * spreadY;
    const z = isInit
      ? Math.random() * (starFieldDepth - zNear) + zNear
      : Math.random() * (starFieldDepth - zNear) + starFieldDepth * 0.75;
    const shade = Math.random();
    return { x, y, z, px: NaN, py: NaN, color: shade };
  }

  function onPointerMove(ev) {
    if (!ENABLE_MOUSE_LOOK) return;
    const rect = canvas.getBoundingClientRect();
    const mx = ev.clientX - rect.left;
    const my = ev.clientY - rect.top;
    const nx = (mx - rect.width / 2) / Math.max(1, rect.width / 2);
    const ny = (my - rect.height / 2) / Math.max(1, rect.height / 2);
    targetYaw = clamp(nx * maxYaw, -maxYaw, maxYaw);
    targetPitch = clamp(-ny * maxPitch, -maxPitch, maxPitch);
  }

  function onWheel(ev) {
    if (!ENABLE_SPEED_CONTROL) return;
    ev.preventDefault();
    const delta = (ev.deltaY || 0);
    const factor = (ev.ctrlKey || ev.metaKey) ? 0.25 : 1.0;
    speed = clamp(speed + delta * factor, minSpeed, maxSpeed);
    updateHud();
  }

  function updateHud() {
    if (!SHOW_HUD) return;
    const el = document.getElementById('speedValue');
    if (el) el.textContent = (speed / 80).toFixed(1) + 'x';
  }

  let lastTs = performance.now();
  function frame(now) {
    const dtMs = now - lastTs;
    lastTs = now;
    const dt = clamp(dtMs / 1000, 0.001, 0.033);

    if (!ENABLE_MOUSE_LOOK) {
      targetYaw = 0;
      targetPitch = 0;
    }
    yaw = lerp(yaw, targetYaw, viewLerp);
    pitch = lerp(pitch, targetPitch, viewLerp);

    const sinY = Math.sin(yaw);
    const cosY = Math.cos(yaw);
    const sinX = Math.sin(pitch);
    const cosX = Math.cos(pitch);

    const fadeAlpha = getFadeAlpha(speed);
    ctx.fillStyle = `rgba(0,0,0,${fadeAlpha})`;
    ctx.fillRect(0, 0, width, height);

    const useTrail = speed > 140;
    if (useTrail) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }

    const advance = speed * dt;

    for (let i = 0; i < starCount; i++) {
      let s = stars[i];

      s.z -= advance;
      if (s.z <= zNear) {
        stars[i] = s = spawnStar(false);
      }

      let rx = s.x * cosY + s.z * sinY;
      let rz = s.z * cosY - s.x * sinY;
      let ry = s.y * cosX - rz * sinX;
      rz = rz * cosX + s.y * sinX;

      if (rz <= zNear) { s.px = NaN; s.py = NaN; continue; }
      const invZ = focalLength / rz;
      const sx = rx * invZ + centerX;
      const sy = ry * invZ + centerY;

      const visible = sx >= -32 && sx <= width + 32 && sy >= -32 && sy <= height + 32;
      if (!visible) { s.px = NaN; s.py = NaN; continue; }

      const depthFactor = clamp(1 - (rz / starFieldDepth), 0, 1);
      const size = 0.5 + depthFactor * 2.4;
      const shade = clamp(depthFactor * 0.9 + 0.1, 0.1, 1);
      const color = colorForStar(s.color * 0.5 + shade * 0.5);

      if (useTrail && Number.isFinite(s.px) && Number.isFinite(s.py)) {
        ctx.strokeStyle = color;
        ctx.globalAlpha = clamp(0.4 + depthFactor * 0.6, 0.25, 1);
        ctx.lineWidth = Math.max(1, size);
        ctx.beginPath();
        ctx.moveTo(s.px, s.py);
        ctx.lineTo(sx, sy);
        ctx.stroke();
      } else {
        ctx.fillStyle = color;
        ctx.globalAlpha = clamp(0.5 + depthFactor * 0.6, 0.35, 1);
        const hs = size * 0.5;
        ctx.fillRect(sx - hs, sy - hs, Math.max(1, size), Math.max(1, size));
      }

      s.px = sx; s.py = sy;
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }

  // 控制 API：供外部切换速度
  function setMultiplier(multiplier) {
    const m = clamp(multiplier, 0.3, 10);
    speed = clamp(m * 80, minSpeed, maxSpeed);
    updateHud();
  }
  function getMultiplier() { return clamp(speed / 80, 0.3, 10); }
  function setFastMode(on) { setMultiplier(on ? 10 : 0.3); }
  function toggleFast() { setFastMode(!(getMultiplier() >= 10)); }

  window.starfieldControl = { setMultiplier, getMultiplier, setFastMode, toggleFast };

  // 事件绑定
  window.addEventListener('resize', resize, { passive: true });
  if (ENABLE_MOUSE_LOOK) {
    window.addEventListener('pointermove', onPointerMove, { passive: true });
  }
  if (ENABLE_SPEED_CONTROL) {
    window.addEventListener('wheel', onWheel, { passive: false });
  }

  // 初始
  resize();
  if (!SHOW_HUD) {
    const hud = document.getElementById('hud');
    if (hud) hud.style.display = 'none';
  }
  // 确保初始是 0.3x
  setMultiplier(0.3);
  requestAnimationFrame(frame);
})();


