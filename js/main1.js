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
function updatePayPalLink(e) {
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
