/* ============================================================
   uwu.js — كل وظائف الموقع
   مقسّم لأقسام واضحة، كل قسم مشروح
   ============================================================ */

/* ============================================================
   1. القائمة الجانبية (Sidebar)
   ============================================================ */
function toggleMenu() {
  document.getElementById('sidebar').classList.toggle('active');
}

/* أغلق السايدبار لو ضغط المستخدم بره منه */
document.addEventListener('click', function(e) {
  const sidebar = document.getElementById('sidebar');
  const toggle  = document.querySelector('.menu-toggle');
  if (sidebar && toggle && !sidebar.contains(e.target) && !toggle.contains(e.target)) {
    sidebar.classList.remove('active');
  }
});

/* ============================================================
   2. زر اللغات (Language Dropdown)
   ============================================================ */
const langBtn     = document.querySelector('.lang-btn');
const langWrapper = document.querySelector('.lang-wrapper');

if (langBtn) {
  langBtn.addEventListener('click', (e) => {
    e.stopPropagation(); /* منع الحدث من الانتشار للـ document */
    langWrapper.classList.toggle('active');
  });

  /* أغلق الـ dropdown لو ضغط بره */
  document.addEventListener('click', function(e) {
    if (langWrapper && !langWrapper.contains(e.target)) {
      langWrapper.classList.remove('active');
    }
  });
}

/* ============================================================
   3. الساعة والتاريخ
   ============================================================ */
function updateTime() {
  const timeEl = document.getElementById('time');
  const dateEl = document.getElementById('date');
  if (!timeEl) return; /* لو الصفحة ما فيها ساعة، تجاهل */

  const now = new Date();
  timeEl.textContent = now.toLocaleTimeString('ar-SA');
  dateEl.textContent = now.toLocaleDateString('ar-SA', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}
setInterval(updateTime, 1000);
updateTime();

/* ============================================================
   4. سلايدر الصور والنصوص
   ============================================================ */
function startSlider(selector, intervalMs) {
  /* دالة عامة تشغّل أي سلايدر */
  const items = document.querySelectorAll(selector);
  if (!items.length) return;
  let current = 0;
  setInterval(() => {
    items[current].classList.remove('active');
    current = (current + 1) % items.length;
    items[current].classList.add('active');
  }, intervalMs);
}

/* سلايدر الصور كل 5 ثواني */
startSlider('#imageSlider img', 5000);

/* سلايدر النص كل 5 ثواني */
startSlider('#textSlider .text', 5000);

/* ============================================================
   5. عبارات عشوائية (Quote Box)
   تستخدم الترجمة من lang.json عبر shared.js
   ============================================================ */
function setRandomQuote() {
  const quoteBox = document.getElementById('quoteBox');
  if (!quoteBox) return;

  /* انتظر تحميل الترجمات من shared.js */
  const trySet = () => {
    const t = (typeof translations !== 'undefined') ? translations[currentLang || 'ar'] : null;
    if (t) {
      const keys = Object.keys(t).filter(k => k.startsWith('quote_'));
      if (keys.length) {
        const key = keys[Math.floor(Math.random() * keys.length)];
        quoteBox.textContent = t[key];
        quoteBox.dataset.i18nQuote = 'true'; /* علّم أنه عبارة عشوائية */
        return;
      }
    }
    /* لو الترجمة ما اتحملت بعد، انتظر */
    setTimeout(trySet, 100);
  };
  trySet();
}
setRandomQuote();

/* ============================================================
   6. الرمز السري (Secret Code)
   حرف + 4 أرقام يفتح محتوى مخفي
   ============================================================ */

/* قاموس الأكواد: كل كود يفتح نوع ومصدر */
const secretCodes = {
  /* مثال: 'A1234' → يفتح صورة */
  'A1234': { type: 'image', src: 'https://picsum.photos/400/300?secret=1', label: '🎉 وجدتها!' },
  'B5678': { type: 'video', src: 'https://www.youtube.com/embed/dQw4w9WgXcQ',  label: '🎬 مقطع خاص' },
  /* أضف أكوادك هنا بنفس الشكل */
};

const secretLetter  = document.getElementById('secretLetter');
const secretDigits  = document.querySelectorAll('.secret-digit');
const secretSubmit  = document.getElementById('secretSubmit');
const secretResult  = document.getElementById('secretResult');
const secretModal   = document.getElementById('secretModal');
const secretContent = document.getElementById('secretContent');
const closeModal    = document.getElementById('closeModal');

/* تنقّل تلقائي بين حقول الأرقام */
if (secretDigits.length) {
  secretDigits.forEach((input, index) => {
    input.addEventListener('input', () => {
      if (input.value.length >= 1 && index < secretDigits.length - 1) {
        secretDigits[index + 1].focus(); /* انتقل للحقل التالي */
      }
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && index > 0) {
        secretDigits[index - 1].focus(); /* رجع للحقل السابق عند حذف */
      }
    });
  });
}

/* تحقق من الكود */
if (secretSubmit) {
  secretSubmit.addEventListener('click', () => {
    const letter = secretLetter?.value.toUpperCase().trim() || '';
    const digits = Array.from(secretDigits).map(d => d.value).join('');
    const code   = letter + digits;

    const t = (typeof translations !== 'undefined' && translations[currentLang]) ? translations[currentLang] : {};

    if (code.length < 5) {
      secretResult.textContent = t.secret_empty || 'أكمل الرمز أولاً!';
      secretResult.className = 'secret-result error';
      return;
    }

    const found = secretCodes[code];
    if (found) {
      secretResult.textContent = (t.secret_ok || '🎉 رمز صحيح!');
      secretResult.className = 'secret-result success';
      openSecretModal(found);
    } else {
      secretResult.textContent = t.secret_wrong || 'رمز خاطئ، حاول مجدداً!';
      secretResult.className = 'secret-result error';
    }
  });
}

function openSecretModal(item) {
  if (!secretModal) return;
  let html = '';
  if (item.type === 'image') {
    html = `<img src="${item.src}" alt="محتوى سري">`;
  } else if (item.type === 'video') {
    html = `<iframe src="${item.src}" width="100%" height="280" frameborder="0" allowfullscreen></iframe>`;
  }
  secretContent.innerHTML = html;
  secretModal.classList.add('active');
}

if (closeModal) {
  closeModal.addEventListener('click', () => {
    secretModal.classList.remove('active');
    secretContent.innerHTML = ''; /* نظّف المحتوى */
  });
}

/* ============================================================
   7. نافذة الكتاب المنبثقة (Book Modal)
   ============================================================ */
const books            = document.querySelectorAll('.book');
const bookModalOverlay = document.getElementById('bookModalOverlay');
const closePanel       = document.getElementById('closePanel');

if (books.length && bookModalOverlay) {
  books.forEach(book => {
    book.addEventListener('click', () => {
      document.getElementById('panelTitle').textContent = book.dataset.title || '';
      document.getElementById('panelDesc').textContent  = book.dataset.desc  || '';
      document.getElementById('panelImg').src           = book.dataset.img   || '';

      /* التصنيفات لو موجودة */
      const tagsEl = document.getElementById('panelTags');
      if (tagsEl && book.dataset.tags) {
        tagsEl.innerHTML = book.dataset.tags
          .split(',')
          .map(t => `<span class="book-tag">${t.trim()}</span>`)
          .join('');
      }

      bookModalOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  /* إغلاق بالزر */
  closePanel?.addEventListener('click', closeBookModal);

  /* إغلاق بالضغط على الـ overlay */
  bookModalOverlay.addEventListener('click', (e) => {
    if (e.target === bookModalOverlay) closeBookModal();
  });

  function closeBookModal() {
    bookModalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/* ============================================================
   8. زر Switch في أقسام index.html
   يغير الصورة والنص بين حالتين
   ============================================================ */
const switchBtn   = document.getElementById('switchBtn');
const switchBlock = document.getElementById('switchBlock');

if (switchBtn && switchBlock) {
  let isStateA = true; /* نبدأ بحالة A */

  switchBtn.addEventListener('click', () => {
    const stateA = switchBlock.querySelector('.state-a');
    const stateB = switchBlock.querySelector('.state-b');

    if (isStateA) {
      stateA.style.display = 'none';
      stateB.style.display = 'flex';
    } else {
      stateB.style.display = 'none';
      stateA.style.display = 'flex';
    }
    isStateA = !isStateA;
  });
}

/* ============================================================
   9. الجسيمات (tsParticles) — فقط في الصفحات اللي فيها #tsparticles
   ============================================================ */
const particlesEl = document.getElementById('tsparticles');
if (particlesEl && typeof tsParticles !== 'undefined') {
  tsParticles.load('tsparticles', {
    background: { color: '#000' },
    particles: {
      number:  { value: 60 },
      color:   { value: '#00ffff' },  /* --aqua */
      links: {
        enable:   true,
        color:    '#00ffff',
        distance: 130,
        opacity:  0.4
      },
      move: { enable: true, speed: 1 },
      size: { value: 2 }
    }
  });
}

/* ============================================================
   10. الكلمات العشوائية (Random Word Box)
   تتغير كل 3 ثواني بأنيميشن fade
   ============================================================ */
(function startRandomWords() {
  const box = document.getElementById('randomWord');
  if (!box) return;

  const words = [
    '✦ يالليل ✦', '𝓢𝓮𝓻𝓮𝓷𝓮', '静寂', 'هدوء', '𝔻𝕣𝕖𝕒𝕞',
    '꒰ᵕ༚ᵕ꒱', 'nostalgia', 'وحيد', '夜明け', 'ethereal',
    'غريب', '⟡ حنين ⟡', 'melancholy', 'سكون', '꧁꧂',
    'bittersweet', 'ضياع', '月光', 'reverie', 'شوق',
    '✿ peace ✿', '虚无', 'لحظة', 'ephemeral', 'أبدية',
    '⋆｡‧˚ʚ', 'void', 'صمت', '夢', 'longing'
  ];

  let current = Math.floor(Math.random() * words.length);

  function showNext() {
    box.style.opacity = '0';
    box.style.transform = 'translateY(8px)';
    setTimeout(() => {
      current = (current + 1) % words.length;
      box.textContent = words[current];
      box.style.opacity = '1';
      box.style.transform = 'translateY(0)';
    }, 400);
  }

  /* اعرض أول كلمة فوراً */
  box.textContent = words[current];
  box.style.opacity = '1';
  box.style.transform = 'translateY(0)';

  setInterval(showNext, 3000);
})();

