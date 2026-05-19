document.addEventListener('DOMContentLoaded', function () {

// ===== SCROLL REVEAL =====
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); }
  });
}, { threshold: 0.12 });
reveals.forEach(el => observer.observe(el));

// ===== STICKY HEADER =====
const header = document.getElementById('header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
    const scrollTopBtn = document.getElementById('scrollTop');
    if (scrollTopBtn) scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
  });
}

// ===== HAMBURGER =====
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');
if (hamburger && nav) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    nav.classList.toggle('open');
  });
  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('active');
      nav.classList.remove('open');
    });
  });
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ===== COUNTER ANIMATION =====
function animateCounter(el) {
  const target = parseInt(el.dataset.count);
  const duration = 2000;
  const start = performance.now();
  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target) + (target >= 100 ? '+' : '');
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}
const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCounter(e.target);
      counterObs.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-number').forEach(el => counterObs.observe(el));

// ===== PAYPAL AMOUNT =====
const paypalAmount = document.getElementById('paypalAmount');
if (paypalAmount) {
  paypalAmount.addEventListener('input', () => {
    document.querySelectorAll('.importo-btn').forEach(btn => btn.classList.remove('active'));
    updatePayPalLink();
  });
}

// ===== ACTIVE NAV ON SCROLL =====
const sections = document.querySelectorAll('section[id]');
if (sections.length) {
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    document.querySelectorAll('.nav-link').forEach(link => {
      link.style.color = '';
      if (link.getAttribute('href') === '#' + current) {
        link.style.color = 'var(--orange)';
      }
    });
  });
}

// ===================================================
// HERO GALLERY SLIDER
// ===================================================
(function initHeroGallery() {
  const track = document.getElementById('heroTrack');
  const dotsContainer = document.getElementById('heroDots');
  if (!track) return;

  const slides = track.querySelectorAll('.hg-slide');
  const total = slides.length;
  let current = 0;
  let autoTimer;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'hg-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Foto ' + (i + 1));
    dot.addEventListener('click', () => goTo(i));
    if (dotsContainer) dotsContainer.appendChild(dot);
  });

  function goTo(idx) {
    current = (idx + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    if (dotsContainer) dotsContainer.querySelectorAll('.hg-dot').forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 4000);
  }

  const heroPrev = document.getElementById('heroPrev');
  const heroNext = document.getElementById('heroNext');
  if (heroPrev) heroPrev.addEventListener('click', () => { goTo(current - 1); startAuto(); });
  if (heroNext) heroNext.addEventListener('click', () => { goTo(current + 1); startAuto(); });

  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) { goTo(current + (dx < 0 ? 1 : -1)); startAuto(); }
  });

  startAuto();
})();

// ===================================================
// CHI SIAMO GALLERY SLIDER
// ===================================================
(function initChiSiamoGallery() {
  const track = document.getElementById('chiSiamoTrack');
  const dotsContainer = document.getElementById('chiSiamoDots');
  if (!track) return;

  const slides = track.querySelectorAll('.hg-slide');
  const total = slides.length;
  let current = 0;
  let autoTimer;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'hg-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Foto ' + (i + 1));
    dot.addEventListener('click', () => goTo(i));
    if (dotsContainer) dotsContainer.appendChild(dot);
  });

  function goTo(idx) {
    current = (idx + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    if (dotsContainer) dotsContainer.querySelectorAll('.hg-dot').forEach((d, i) =>
      d.classList.toggle('active', i === current));
  }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 4000);
  }

  const csPrev = document.getElementById('chiSiamoPrev');
  const csNext = document.getElementById('chiSiamoNext');
  if (csPrev) csPrev.addEventListener('click', () => { goTo(current - 1); startAuto(); });
  if (csNext) csNext.addEventListener('click', () => { goTo(current + 1); startAuto(); });

  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) { goTo(current + (dx < 0 ? 1 : -1)); startAuto(); }
  });

  startAuto();
})();

// ===================================================
// GALLERY IMAGE REGISTRY + LIGHTBOX
// ===================================================
const GALLERIES = {};

function buildGalleryFromDOM() {
  const heroSlides = document.querySelectorAll('#heroTrack .hg-slide img');
  GALLERIES['hero'] = Array.from(heroSlides).map(img => ({
    src: img.src, alt: img.alt, filename: img.getAttribute('src')
  }));

  const csSlides = document.querySelectorAll('#chiSiamoTrack .hg-slide img');
  if (csSlides.length) {
    GALLERIES['chisiamo'] = Array.from(csSlides).map(img => ({
      src: img.src, alt: img.alt, filename: img.getAttribute('src')
    }));
  }

  document.querySelectorAll('[data-gallery]').forEach(track => {
    const key = track.getAttribute('data-gallery');
    const imgs = track.querySelectorAll('img');
    GALLERIES[key] = Array.from(imgs).map(img => ({
      src: img.src, alt: img.alt, filename: img.getAttribute('src')
    }));
  });

  document.querySelectorAll('.progetto-gallery[data-gallery]').forEach(container => {
    const key = container.getAttribute('data-gallery');
    const imgs = container.querySelectorAll('img');
    GALLERIES[key] = Array.from(imgs).map(img => ({
      src: img.src, alt: img.alt, filename: img.getAttribute('src')
    }));
  });
}

let lbGallery = [];
let lbIndex = 0;

window.openLightbox = function(galleryKey, startIndex) {
  if (!Object.keys(GALLERIES).length) buildGalleryFromDOM();
  lbGallery = GALLERIES[galleryKey] || [];
  lbIndex = startIndex || 0;
  renderLightbox();
  const lb = document.getElementById('lightbox');
  if (lb) { lb.classList.add('open'); document.body.style.overflow = 'hidden'; }
  document.addEventListener('keydown', lbKeyHandler);
};

window.closeLightbox = function() {
  const lb = document.getElementById('lightbox');
  if (lb) { lb.classList.remove('open'); document.body.style.overflow = ''; }
  document.removeEventListener('keydown', lbKeyHandler);
};

window.lbNavigate = function(dir) {
  lbIndex = (lbIndex + dir + lbGallery.length) % lbGallery.length;
  renderLightbox();
};

function renderLightbox() {
  const item = lbGallery[lbIndex];
  const img = document.getElementById('lbImg');
  const empty = document.getElementById('lbEmpty');
  const filename = document.getElementById('lbFilename');
  const counter = document.getElementById('lbCounter');

  if (counter) counter.textContent = (lbIndex + 1) + ' / ' + lbGallery.length;
  if (!item) return;
  if (filename) filename.textContent = item.filename;

  if (img) img.style.display = 'none';
  if (empty) empty.style.display = 'flex';

  const tester = new Image();
  tester.onload = () => {
    if (img) { img.src = item.src; img.alt = item.alt; img.style.display = 'block'; }
    if (empty) empty.style.display = 'none';
  };
  tester.onerror = () => {
    if (img) img.style.display = 'none';
    if (empty) empty.style.display = 'flex';
  };
  tester.src = item.src;

  const lbPrev = document.getElementById('lbPrev');
  const lbNext = document.getElementById('lbNext');
  if (lbPrev) lbPrev.style.visibility = lbGallery.length > 1 ? 'visible' : 'hidden';
  if (lbNext) lbNext.style.visibility = lbGallery.length > 1 ? 'visible' : 'hidden';
}

function lbKeyHandler(e) {
  if (e.key === 'Escape') window.closeLightbox();
  if (e.key === 'ArrowLeft') window.lbNavigate(-1);
  if (e.key === 'ArrowRight') window.lbNavigate(1);
}

// ===================================================
// INIT AUTOMATICO — tutti gli slider con data-gallery
// ===================================================
function initAllSliders() {
  document.querySelectorAll('[data-gallery]').forEach(track => {
    const slides = track.querySelectorAll('.hg-slide');
    if (!slides.length) return;

    const total = slides.length;
    let current = 0;
    let autoTimer;

    const wrapper = track.closest('.hero-gallery, .cs-gallery, .articolo-gallery');
    if (!wrapper) return;
    const dotsContainer = wrapper.querySelector('.hg-dots');
    const prevBtn = wrapper.querySelector('.hg-prev');
    const nextBtn = wrapper.querySelector('.hg-next');

    if (dotsContainer) {
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'hg-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Foto ' + (i + 1));
        dot.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(dot);
      });
    }

    function goTo(idx) {
      current = (idx + total) % total;
      track.style.transform = `translateX(-${current * 100}%)`;
      if (dotsContainer) {
        dotsContainer.querySelectorAll('.hg-dot').forEach((d, i) =>
          d.classList.toggle('active', i === current));
      }
    }

    function startAuto() {
      clearInterval(autoTimer);
      autoTimer = setInterval(() => goTo(current + 1), 4000);
    }

    if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); startAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); startAuto(); });

    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) { goTo(current + (dx < 0 ? 1 : -1)); startAuto(); }
    });

    startAuto();
  });
}

buildGalleryFromDOM();
initAllSliders();

}); // fine DOMContentLoaded

// ===== SCROLL TO TOP =====
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== TOAST =====
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== COPY CF =====
function copyCF() {
  navigator.clipboard.writeText('95254690167').then(() => showToast('✅ Codice Fiscale copiato!'));
}

// ===== COPY IBAN =====
function copyIBAN() {
  const ibanEl = document.getElementById('ibanValue');
  if (ibanEl && !ibanEl.textContent.includes('Contattaci')) {
    navigator.clipboard.writeText(ibanEl.textContent.replace(/\s/g, '')).then(() => showToast('✅ IBAN copiato!'));
  } else {
    showToast('Per l\'IBAN scrivici a info@balome.org');
  }
}

// ===== PAYPAL AMOUNT =====
function setAmount(amount) {
  const paypalAmount = document.getElementById('paypalAmount');
  if (paypalAmount) paypalAmount.value = amount;
  document.querySelectorAll('.importo-btn').forEach(btn => btn.classList.remove('active'));
  if (event && event.target) event.target.classList.add('active');
  updatePayPalLink();
}

function updatePayPalLink() {
  const paypalAmount = document.getElementById('paypalAmount');
  const btn = document.getElementById('paypalBtn');
  if (!paypalAmount || !btn) return;
  const amount = paypalAmount.value || 50;
  btn.href = `https://www.paypal.com/donate/?business=info.balome@gmail.com&currency_code=EUR&amount=${amount}`;
}

// ===== CONTACT FORM =====
function handleFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const nome = form.nome.value;
  const email = form.email.value;
  const oggetto = form.oggetto.value;
  const messaggio = form.messaggio.value;
  const mailtoLink = `mailto:info@balome.org?subject=${encodeURIComponent('[Balomè] ' + oggetto + ' - ' + nome)}&body=${encodeURIComponent('Nome: ' + nome + '\nEmail: ' + email + '\n\nMessaggio:\n' + messaggio)}`;
  window.location.href = mailtoLink;
  const formSuccess = document.getElementById('formSuccess');
  if (formSuccess) formSuccess.style.display = 'block';
  form.reset();
  setTimeout(() => { if (formSuccess) formSuccess.style.display = 'none'; }, 5000);
}