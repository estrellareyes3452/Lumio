/* ===========================================================
   LUMIA — script.js
   Vanilla JS: solo diseño y animación de frontend, sin backend.
   =========================================================== */
(() => {
  'use strict';

  /* ---------- 1. Año dinámico en el footer ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 2. Header: sombra al hacer scroll ---------- */
  const header = document.getElementById('siteHeader');
  const onScrollHeader = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  };
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* ---------- 3. Menú de navegación móvil ---------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    });

    // Cierra el menú al elegir un enlace (mobile)
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- 4. Revelado de elementos al hacer scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            // pequeño escalonado para grupos de tarjetas/pasos
            const delay = (entry.target.dataset.delayIndex || i % 4) * 90;
            entry.target.style.transitionDelay = `${delay}ms`;
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach((el) => io.observe(el));
  } else {
    // Fallback: si no hay soporte, mostrar todo de inmediato
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- 5. Carrusel de testimonios ---------- */
  const track = document.getElementById('testimonial');
  if (track) {
    const slides = Array.from(track.querySelectorAll('.testimonial__slide'));
    const dots = Array.from(track.querySelectorAll('.dot'));
    const btnPrev = document.getElementById('testPrev');
    const btnNext = document.getElementById('testNext');
    let current = 0;
    let timer = null;

    const goTo = (index) => {
      slides[current].classList.remove('is-active');
      dots[current].classList.remove('is-active');
      current = (index + slides.length) % slides.length;
      slides[current].classList.add('is-active');
      dots[current].classList.add('is-active');
    };

    const startAutoplay = () => {
      stopAutoplay();
      timer = setInterval(() => goTo(current + 1), 6000);
    };
    const stopAutoplay = () => timer && clearInterval(timer);

    btnNext?.addEventListener('click', () => { goTo(current + 1); startAutoplay(); });
    btnPrev?.addEventListener('click', () => { goTo(current - 1); startAutoplay(); });
    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        goTo(Number(dot.dataset.go));
        startAutoplay();
      });
    });

    track.addEventListener('mouseenter', stopAutoplay);
    track.addEventListener('mouseleave', startAutoplay);

    startAutoplay();
  }

  /* ---------- 6. Formulario de newsletter (solo UI, sin backend) ---------- */
  const newsletterForm = document.getElementById('newsletterForm');
  const offerNote = document.getElementById('oferta-note');

  if (newsletterForm && offerNote) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = newsletterForm.querySelector('#email');
      const email = emailInput.value.trim();
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!isValid) {
        offerNote.textContent = 'Escribe un correo válido para recibir tu código.';
        emailInput.focus();
        return;
      }

      offerNote.textContent = '¡Listo! Revisa tu correo, tu código va en camino.';
      newsletterForm.reset();
    });
  }

  /* ---------- 7. Modales de "Iniciar sesión" / "Registrarse" ----------
     Modales generados dinámicamente: solo maquetación/UX de referencia,
     no envían datos a ningún servidor. */
  const modalContent = {
    login: {
      title: 'Bienvenido de nuevo',
      text: 'Ingresa para ver tus pedidos y direcciones guardadas.',
      cta: 'Iniciar sesión',
    },
    register: {
      title: 'Crea tu cuenta',
      text: 'Guarda direcciones frecuentes y repite tus pedidos favoritos en un clic.',
      cta: 'Registrarme',
    },
  };

  let overlay = null;

  const closeModal = () => {
    if (!overlay) return;
    overlay.classList.remove('is-open');
    window.setTimeout(() => {
      overlay?.remove();
      overlay = null;
    }, 250);
    document.removeEventListener('keydown', onKeydown);
  };

  const onKeydown = (e) => {
    if (e.key === 'Escape') closeModal();
  };

  const openModal = (type) => {
    const data = modalContent[type];
    if (!data) return;

    overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
        <button type="button" class="modal__close" aria-label="Cerrar">✕</button>
        <h3 id="modalTitle">${data.title}</h3>
        <p>${data.text}</p>
        <form data-modal-form>
          <label class="sr-only" for="modalEmail">Correo electrónico</label>
          <input id="modalEmail" type="email" placeholder="tu@correo.com" required>
          <label class="sr-only" for="modalPass">Contraseña</label>
          <input id="modalPass" type="password" placeholder="Contraseña" required minlength="6">
          <button type="submit" class="btn btn--accent">${data.cta}</button>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('is-open'));

    overlay.querySelector('.modal__close').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
    overlay.querySelector('[data-modal-form]').addEventListener('submit', (e) => {
      e.preventDefault();
      closeModal();
    });

    document.addEventListener('keydown', onKeydown);
    overlay.querySelector('input')?.focus();
  };

  document.querySelectorAll('[data-modal]').forEach((btn) => {
    btn.addEventListener('click', () => openModal(btn.dataset.modal));
  });

  /* ---------- 8. Paralaje suave de las "bloom" del hero ---------- */
  const bloomEls = document.querySelectorAll('.bloom');
  const hero = document.getElementById('hero');

  if (hero && bloomEls.length && window.matchMedia('(pointer: fine)').matches) {
    hero.addEventListener('mousemove', (e) => {
      const { innerWidth: w, innerHeight: h } = window;
      const x = (e.clientX / w - 0.5) * 2;
      const y = (e.clientY / h - 0.5) * 2;

      bloomEls.forEach((el, i) => {
        const strength = 10 + i * 6;
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
    });
  }
})();
