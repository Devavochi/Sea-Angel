/* ============================================================
   shared.js — مشترك بين كل صفحات الموقع
   يحتوي: خلفية النجوم + غلتر + مؤشر مخصص + نظام الترجمة
   أضفه قبل uwu.js في كل صفحة
   ============================================================ */

/* ============================================================
   A. نظام الترجمة
   يقرأ lang.json ويبدّل النصوص اللي عليها data-i18n
   ============================================================ */
let currentLang = localStorage.getItem('siteLang') || 'ar';
let translations = {};

/* تحميل ملف الترجمة مرة واحدة */
fetch('lang.json')
  .then(r => r.json())
  .then(data => {
    translations = data;
    applyLang(currentLang);
  })
  .catch(() => console.warn('lang.json غير موجود'));

/* تطبيق اللغة على كل عناصر data-i18n="key" */
function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem('siteLang', lang);
  const t = translations[lang] || translations['ar'] || {};

  /* النصوص العادية */
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key]) el.textContent = t[key];
  });

  /* placeholder للـ input */
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.dataset.i18nPh;
    if (t[key]) el.placeholder = t[key];
  });

  /* الاتجاه ثابت RTL دايماً — الموقع RTL بكل اللغات */
  document.documentElement.dir  = 'rtl';
  document.documentElement.lang = lang;

  /* الـ dropdown يُغلق تلقائياً من خلال الـ click listener في الـ document */
}

/* ربط كل lang-item بلغته */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.lang-item').forEach(item => {
    item.addEventListener('click', () => {
      const lang = item.dataset.lang;
      if (lang) applyLang(lang);
    });
  });
});

/* ============================================================
   B. الخلفية — نجوم + غلتر يتفاعل مع الماوس
   يشتغل على كل صفحة فيها <canvas id="bg-canvas">
   ============================================================ */
(function initBackground() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, mouseX = W/2, mouseY = H/2, frame = 0;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    mouseX = W / 2; mouseY = H / 2;
  }
  resize();
  window.addEventListener('resize', resize);
  document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

  /* ============================================================
     النجوم الذهبية الثابتة
  ============================================================ */
  const STARS = 160;
  const stars = Array.from({ length: STARS }, () => ({
    x:     Math.random() * window.innerWidth,
    y:     Math.random() * window.innerHeight,
    r:     Math.random() * 1.2 + 0.2,
    phase: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.008 + 0.002,
  }));

  /* ============================================================
     فقاعات الذهب المنصهر (لافا لامب)
     كل فقاعة: موجة دائرية بلون ذهبي متوهج تطفو وتتمدد
  ============================================================ */
  const BLOBS = 14;
  const blobs = Array.from({ length: BLOBS }, (_, i) => ({
    x:    Math.random() * window.innerWidth,
    y:    Math.random() * window.innerHeight,
    r:    55 + Math.random() * 90,          /* حجم عشوائي */
    vx:   (Math.random() - 0.5) * 0.35,
    vy:   -0.15 - Math.random() * 0.25,     /* تطفو للأعلى */
    phase: Math.random() * Math.PI * 2,
    speed: 0.004 + Math.random() * 0.006,
    /* لون: بعض ذهبي وبعض برتقالي داكن */
    hue:  Math.random() > 0.4 ? 42 : 28,
  }));

  /* ============================================================
     جسيمات الغلتر الذهبي (تتفاعل مع الماوس)
     تخرج من المؤشر وتتساقط ببطء كالذهب المنصهر
  ============================================================ */
  const MAX_G = 180;
  const glitters = [];

  function spawnGlitter(x, y) {
    if (glitters.length >= MAX_G) glitters.shift();
    /* كل جسيمة لها شكل وسرعة مختلفة */
    glitters.push({
      x, y,
      vx:    (Math.random() - 0.5) * 1.8,
      vy:    (Math.random() - 0.5) * 1.2 - 0.5,
      life:  1,
      decay: 0.012 + Math.random() * 0.01,
      r:     2 + Math.random() * 5,
      rot:   Math.random() * Math.PI * 2,
      rotV:  (Math.random() - 0.5) * 0.08,
      type:  Math.floor(Math.random() * 3), /* 0=دائرة، 1=معين، 2=نجمة */
      /* ألوان: ذهبي أو برتقالي أو أبيض ذهبي */
      color: ['#f5c842','#e8a020','#fff0a0','#ffdd44','#c8962a'][Math.floor(Math.random()*5)],
    });
  }

  /* إنتاج جسيمات مستمر من الماوس */
  document.addEventListener('mousemove', e => {
    if (Math.random() > 0.25) spawnGlitter(e.clientX, e.clientY);
    /* جسيمة إضافية لتأثير الانسياب */
    if (Math.random() > 0.6)  spawnGlitter(
      e.clientX + (Math.random()-0.5)*12,
      e.clientY + (Math.random()-0.5)*12
    );
  });

  /* ============================================================
     رسم نجمة ذهبية صغيرة
  ============================================================ */
  function drawStar(cx, cy, r, pts, ctx) {
    ctx.beginPath();
    for (let i = 0; i < pts * 2; i++) {
      const ang  = (i * Math.PI) / pts;
      const rad  = i % 2 === 0 ? r : r * 0.4;
      const x = cx + Math.cos(ang - Math.PI/2) * rad;
      const y = cy + Math.sin(ang - Math.PI/2) * rad;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  }

  /* ============================================================
     حلقة الرسم الرئيسية
  ============================================================ */
  function draw() {
    requestAnimationFrame(draw);
    ctx.clearRect(0, 0, W, H);
    frame++;

    /* ---------- فقاعات الذهب المنصهر ---------- */
    blobs.forEach(b => {
      /* حركة موجية + تأثير الماوس (يجذب الفقاعات القريبة) */
      const dx   = mouseX - b.x;
      const dy   = mouseY - b.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const pull = Math.max(0, 1 - dist / 320) * 0.012;

      b.x += b.vx + dx * pull;
      b.y += b.vy + dy * pull;

      /* موجة للأعلى وإعادة للأسفل حين تخرج */
      if (b.y + b.r < 0)  { b.y = H + b.r; b.x = Math.random() * W; }
      if (b.y - b.r > H)  { b.y = -b.r; }
      if (b.x + b.r < 0)  b.x = W + b.r;
      if (b.x - b.r > W)  b.x = -b.r;

      /* تذبذب الحجم (تنفس) */
      const pulse = 1 + 0.08 * Math.sin(frame * b.speed + b.phase);
      const rr    = b.r * pulse;

      /* تدرج دائري: مركز مضيء → حافة شفافة */
      const grd = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, rr);
      grd.addColorStop(0,   `hsla(${b.hue},95%,68%,0.22)`);
      grd.addColorStop(0.4, `hsla(${b.hue},88%,50%,0.14)`);
      grd.addColorStop(0.75,`hsla(${b.hue},80%,35%,0.07)`);
      grd.addColorStop(1,   `hsla(${b.hue},70%,20%,0)`);

      ctx.beginPath();
      ctx.arc(b.x, b.y, rr, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.globalAlpha = 1;
      ctx.fill();
    });

    /* ---------- النجوم الذهبية ---------- */
    stars.forEach(s => {
      const a = 0.2 + 0.65 * Math.abs(Math.sin(frame * s.speed + s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle   = '#f5d060';
      ctx.globalAlpha = a * 0.7;
      ctx.fill();
    });

    /* ---------- جسيمات الغلتر الذهبي ---------- */
    for (let i = glitters.length - 1; i >= 0; i--) {
      const g = glitters[i];

      /* فيزياء: جاذبية خفيفة + احتكاك */
      g.x  += g.vx;
      g.y  += g.vy;
      g.vy += 0.04;       /* جاذبية */
      g.vx *= 0.995;      /* احتكاك */
      g.rot += g.rotV;
      g.life -= g.decay;
      if (g.life <= 0) { glitters.splice(i, 1); continue; }

      /* توهج: الجسيمة تضيء في البداية ثم تخفت */
      const alpha = g.life < 0.3 ? g.life / 0.3 * 0.9 : 0.9;

      ctx.save();
      ctx.translate(g.x, g.y);
      ctx.rotate(g.rot);
      ctx.globalAlpha = alpha;

      /* هالة ضوئية حول الجسيمة */
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, g.r * 2.5);
      glow.addColorStop(0,   g.color + 'cc');
      glow.addColorStop(0.5, g.color + '44');
      glow.addColorStop(1,   g.color + '00');
      ctx.beginPath();
      ctx.arc(0, 0, g.r * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      /* الشكل الأساسي */
      ctx.fillStyle = g.color;
      if (g.type === 0) {
        /* دائرة */
        ctx.beginPath();
        ctx.arc(0, 0, g.r, 0, Math.PI * 2);
        ctx.fill();
      } else if (g.type === 1) {
        /* معين */
        ctx.beginPath();
        ctx.moveTo(0, -g.r);
        ctx.lineTo(g.r * 0.5, 0);
        ctx.lineTo(0, g.r);
        ctx.lineTo(-g.r * 0.5, 0);
        ctx.closePath();
        ctx.fill();
      } else {
        /* نجمة */
        drawStar(0, 0, g.r, 4, ctx);
      }

      ctx.restore();
    }

    ctx.globalAlpha = 1;
  }
  draw();
})();

/* ============================================================
   C. المؤشر المخصص
   يشتغل على أي صفحة فيها <div id="custom-cursor">
   ============================================================ */
(function initCursor() {
  const cursor = document.getElementById('custom-cursor');
  if (!cursor) return;
  if ('ontouchstart' in window) { cursor.style.display = 'none'; return; }

  /* إزالة الصورة الداخلية إن وُجدت — المؤشر الآن CSS فقط */
  cursor.innerHTML = '';

  let hideTimer = null;

  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';

    /* اخفِ فوراً عند التحرك */
    cursor.classList.remove('clicking');

    clearTimeout(hideTimer);
  });

  /* أظهر الدائرة عند الضغط وأخفها عند الرفع */
  document.addEventListener('mousedown', () => {
    cursor.classList.add('clicking');
  });
  document.addEventListener('mouseup', () => {
    /* انتظر لحظة صغيرة ثم اخفِ */
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => cursor.classList.remove('clicking'), 350);
  });

  document.addEventListener('mouseleave', () => cursor.classList.remove('clicking'));
})();

/* ============================================================
   D. الموسيقى المستمرة عبر الصفحات
   - تشتغل تلقائياً عند أول تفاعل من المستخدم
   - loop لا نهائي
   - تكمل من نفس الوقت لو المستخدم بدّل صفحة (sessionStorage)
   - زر تشغيل/إيقاف ثابت أسفل اليسار
   ============================================================ */
/* music player removed */
