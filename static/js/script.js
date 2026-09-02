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
     Los modales viven en el HTML (mejor accesibilidad/autocompletado).
     Aquí solo se controla apertura/cierre, cambio entre modales y
     validación de formulario en el cliente. No hay envío a servidor. */
  const modals = document.querySelectorAll('.modal-overlay');
  let activeModal = null;
  let lastFocused = null;

  const openModalById = (id) => {
    const modal = document.getElementById(id);
    if (!modal) return;
    closeActiveModal();

    lastFocused = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    activeModal = modal;

    document.addEventListener('keydown', onModalKeydown);
    window.setTimeout(() => modal.querySelector('input')?.focus(), 200);
  };

  const closeActiveModal = () => {
    if (!activeModal) return;
    activeModal.classList.remove('is-open');
    activeModal.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', onModalKeydown);
    lastFocused?.focus();
    activeModal = null;
  };

  const onModalKeydown = (e) => {
    if (e.key === 'Escape') closeActiveModal();
  };

  // Abrir: botones del nav con data-modal="modalLogin" / "modalRegister"
  document.querySelectorAll('[data-modal]').forEach((btn) => {
    btn.addEventListener('click', () => openModalById(btn.dataset.modal));
  });

  // Cerrar: botón "✕" o clic fuera del cuadro del modal
  modals.forEach((overlay) => {
    overlay.querySelector('[data-close-modal]')?.addEventListener('click', closeActiveModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeActiveModal();
    });
  });

  // Cambiar entre "Iniciar sesión" <-> "Registrarse" dentro del modal
  document.querySelectorAll('[data-switch-to]').forEach((btn) => {
    btn.addEventListener('click', () => openModalById(btn.dataset.switchTo));
  });

  /* ---- Validación de formularios (solo cliente, sin backend) ---- */
  const showFieldError = (input, message) => {
    input.classList.toggle('is-invalid', Boolean(message));
    const errorEl = input.closest('form').querySelector(`[data-error-for="${input.id}"]`);
    if (errorEl) errorEl.textContent = message || '';
  };

  const isEmailValid = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const showFormSuccess = (form, title, text) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'form-success';
    wrapper.innerHTML = `
      <svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm-1.2 14.6-4.4-4.4 1.4-1.4 3 3 6-6 1.4 1.4Z"/></svg>
      <h4>${title}</h4>
      <p>${text}</p>
    `;
    form.replaceWith(wrapper);
  };

  // --- Formulario de inicio de sesión ---
  const loginForm = document.getElementById('loginForm');
  loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail');
    const password = document.getElementById('loginPassword');
    let valid = true;

    if (!isEmailValid(email.value.trim())) {
      showFieldError(email, 'Escribe un correo válido.');
      valid = false;
    } else {
      showFieldError(email, '');
    }

    if (password.value.trim().length < 6) {
      showFieldError(password, 'Mínimo 6 caracteres.');
      valid = false;
    } else {
      showFieldError(password, '');
    }

    if (!valid) return;

    showFormSuccess(loginForm, '¡Sesión iniciada!', 'Esto es una vista de referencia: aquí se conectaría tu backend real.');
    window.setTimeout(closeActiveModal, 1600);
  });

  // --- Formulario de registro ---
  const registerForm = document.getElementById('registerForm');
  registerForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('registerName');
    const email = document.getElementById('registerEmail');
    const password = document.getElementById('registerPassword');
    const password2 = document.getElementById('registerPassword2');
    const terms = document.getElementById('registerTerms');
    let valid = true;

    if (name.value.trim().length < 2) {
      showFieldError(name, 'Cuéntanos cómo te llamas.');
      valid = false;
    } else {
      showFieldError(name, '');
    }

    if (!isEmailValid(email.value.trim())) {
      showFieldError(email, 'Escribe un correo válido.');
      valid = false;
    } else {
      showFieldError(email, '');
    }

    if (password.value.trim().length < 6) {
      showFieldError(password, 'Mínimo 6 caracteres.');
      valid = false;
    } else {
      showFieldError(password, '');
    }

    if (password2.value.trim() !== password.value.trim() || !password2.value.trim()) {
      showFieldError(password2, 'Las contraseñas no coinciden.');
      valid = false;
    } else {
      showFieldError(password2, '');
    }

    if (!terms.checked) {
      valid = false;
    }

    if (!valid) return;

    showFormSuccess(registerForm, '¡Cuenta creada!', 'Esto es una vista de referencia: aquí se conectaría tu backend real.');
    window.setTimeout(closeActiveModal, 1600);
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
