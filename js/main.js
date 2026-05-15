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
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
  document.getElementById('scrollTop').classList.toggle('visible', window.scrollY > 400);
});

// ===== HAMBURGER =====
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');
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

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
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

// ===== SCROLL TO TOP =====
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== TOAST =====
function showToast(msg) {
  const toast = document.getElementById('toast');
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
  const iban = document.getElementById('ibanValue').textContent;
  if (iban && !iban.includes('Contattaci')) {
    navigator.clipboard.writeText(iban.replace(/\s/g,'')).then(() => showToast('✅ IBAN copiato!'));
  } else {
    showToast('Per l\'IBAN scrivici a info@balome.org');
  }
}

// ===== PAYPAL AMOUNT =====
function setAmount(amount) {
  document.getElementById('paypalAmount').value = amount;
  document.querySelectorAll('.importo-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  updatePayPalLink();
}
function updatePayPalLink() {
  const amount = document.getElementById('paypalAmount').value || 50;
  const btn = document.getElementById('paypalBtn');
  btn.href = `https://www.paypal.com/donate/?business=info.balome@gmail.com&currency_code=EUR&amount=${amount}`;
}
document.getElementById('paypalAmount').addEventListener('input', () => {
  document.querySelectorAll('.importo-btn').forEach(btn => btn.classList.remove('active'));
  updatePayPalLink();
});

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
  document.getElementById('formSuccess').style.display = 'block';
  form.reset();
  setTimeout(() => { document.getElementById('formSuccess').style.display = 'none'; }, 5000);
}

// ===== ACTIVE NAV ON SCROLL =====
const sections = document.querySelectorAll('section[id]');
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

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'hg-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Foto ' + (i + 1));
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  function goTo(idx) {
    current = (idx + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dotsContainer.querySelectorAll('.hg-dot').forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 4000);
  }

  document.getElementById('heroPrev').addEventListener('click', () => { goTo(current - 1); startAuto(); });
  document.getElementById('heroNext').addEventListener('click', () => { goTo(current + 1); startAuto(); });

  // Touch/swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) { goTo(current + (dx < 0 ? 1 : -1)); startAuto(); }
  });

  startAuto();
})();

// ===================================================
// GALLERY IMAGE REGISTRY
// Each key maps to an array of {src, alt, filename} objects.
// Galleries: 'hero', 'deepashram', 'karunanjali', 'anandasharam', 'calcutta'
// ===================================================
const GALLERIES = {};

function buildGalleryFromDOM() {
  // Hero gallery
  const heroSlides = document.querySelectorAll('#heroTrack .hg-slide img');
  GALLERIES['hero'] = Array.from(heroSlides).map((img, i) => ({
    src: img.src,
    alt: img.alt,
    filename: img.getAttribute('src')
  }));

  // Project galleries — scan data-gallery attributes
  document.querySelectorAll('.progetto-gallery[data-gallery]').forEach(container => {
    const key = container.getAttribute('data-gallery');
    const imgs = container.querySelectorAll('img');
    GALLERIES[key] = Array.from(imgs).map(img => ({
      src: img.src,
      alt: img.alt,
      filename: img.getAttribute('src')
    }));
  });
}

// ===================================================
// LIGHTBOX
// ===================================================
let lbGallery = [];
let lbIndex = 0;

function openLightbox(galleryKey, startIndex) {
  if (!Object.keys(GALLERIES).length) buildGalleryFromDOM();
  lbGallery = GALLERIES[galleryKey] || [];
  lbIndex = startIndex || 0;
  renderLightbox();
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
  document.addEventListener('keydown', lbKeyHandler);
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
  document.removeEventListener('keydown', lbKeyHandler);
}

function lbNavigate(dir) {
  lbIndex = (lbIndex + dir + lbGallery.length) % lbGallery.length;
  renderLightbox();
}

function renderLightbox() {
  const item = lbGallery[lbIndex];
  const img = document.getElementById('lbImg');
  const empty = document.getElementById('lbEmpty');
  const filename = document.getElementById('lbFilename');
  const counter = document.getElementById('lbCounter');

  counter.textContent = (lbIndex + 1) + ' / ' + lbGallery.length;

  if (!item) return;
  filename.textContent = item.filename;

  // Try loading — show empty state if image fails
  img.style.display = 'none';
  empty.style.display = 'flex';
  filename.textContent = item.filename;

  const tester = new Image();
  tester.onload = () => {
    img.src = item.src;
    img.alt = item.alt;
    img.style.display = 'block';
    empty.style.display = 'none';
  };
  tester.onerror = () => {
    img.style.display = 'none';
    empty.style.display = 'flex';
    filename.textContent = item.filename;
  };
  tester.src = item.src;

  // Arrows visibility
  document.getElementById('lbPrev').style.visibility = lbGallery.length > 1 ? 'visible' : 'hidden';
  document.getElementById('lbNext').style.visibility = lbGallery.length > 1 ? 'visible' : 'hidden';
}

function lbKeyHandler(e) {
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') lbNavigate(-1);
  if (e.key === 'ArrowRight') lbNavigate(1);
}

// Build gallery index on load
window.addEventListener('DOMContentLoaded', buildGalleryFromDOM);
