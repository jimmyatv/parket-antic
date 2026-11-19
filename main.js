document.addEventListener('DOMContentLoaded', () => {
  /* ================= 1. STICKY HEADER, VIEWPORT SYNC & BACK TO TOP NA 60px ================= */
  const siteHeader = document.getElementById('siteHeader');
  const backToTopBtn = document.getElementById('backToTop');

  const syncViewportOffset = () => {
    if (window.innerWidth <= 1024 && window.visualViewport) {
      const offsetTop = Math.max(0, window.visualViewport.offsetTop);
      siteHeader.style.top = `${offsetTop}px`;
    } else {
      siteHeader.style.top = '';
    }
  };

  const handleScroll = () => {
    const scrollY = window.scrollY || window.pageYOffset;

    if (scrollY > 60) {
      siteHeader.classList.add('scrolled');
      backToTopBtn.classList.add('visible');
    } else {
      siteHeader.classList.remove('scrolled');
      backToTopBtn.classList.remove('visible');
    }

    syncViewportOffset();
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('scroll', syncViewportOffset, { passive: true });
    window.visualViewport.addEventListener('resize', syncViewportOffset, { passive: true });
  }
  handleScroll();

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ================= 2. ANIMIRANI HAMBURGER MENI (3 LINIJE -> X) ================= */
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  const toggleMenu = (forceState) => {
    const isOpen =
      typeof forceState === 'boolean'
        ? forceState
        : !hamburgerBtn.classList.contains('active');

    hamburgerBtn.classList.toggle('active', isOpen);
    hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
    siteHeader.classList.toggle('menu-open', isOpen);
    mobileDrawer.classList.toggle('active', isOpen);
    mobileDrawer.setAttribute('aria-hidden', String(!isOpen));
    mobileOverlay.classList.toggle('active', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  hamburgerBtn.addEventListener('click', () => toggleMenu());
  mobileOverlay.addEventListener('click', () => toggleMenu(false));
  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  /* ================= 3. VIEWPORT SCROLL-REVEAL & BROJAČI (INTERSECTION OBSERVER) ================= */
  const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const delay = parseInt(el.getAttribute('data-delay') || '0', 10);

        setTimeout(() => {
          el.classList.add('in-view');
        }, delay);

        observer.unobserve(el);
      });
    },
    { threshold: 0.15 }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  // Animirani brojači (pokreću se kad broj uđe u viewport)
  const counters = document.querySelectorAll('.counter');

  const animateCounter = (counterEl) => {
    const target = parseInt(counterEl.getAttribute('data-target'), 10);
    const duration = 1800;
    const startTime = performance.now();

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counterEl.textContent = Math.floor(eased * target);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        counterEl.textContent = target;
      }
    };

    requestAnimationFrame(update);
  };

  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((c) => counterObserver.observe(c));

  /* ================= 4. SWIPER / CAROUSEL ZA PROJEKTE (STRELICE, TAČKICE, SWIPE PALCEM) ================= */
  const swiperContainer = document.getElementById('projectsSwiper');
  const track = document.getElementById('projectsTrack');
  const slides = Array.from(document.querySelectorAll('.project-slide'));
  const prevBtn = document.getElementById('projPrev');
  const nextBtn = document.getElementById('projNext');
  const dotsContainer = document.getElementById('projDots');

  let currentIndex = 0;

  const getSlidesPerView = () => {
    if (window.innerWidth <= 680) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  };

  const getMaxIndex = () => Math.max(0, slides.length - getSlidesPerView());

  const buildDots = () => {
    dotsContainer.innerHTML = '';
    const totalPages = getMaxIndex() + 1;
    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement('button');
      dot.className = 'swiper-dot' + (i === currentIndex ? ' active' : '');
      dot.setAttribute('aria-label', `Strana ${i + 1}`);
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    }
  };

  const updateDots = () => {
    const dots = dotsContainer.querySelectorAll('.swiper-dot');
    dots.forEach((d, idx) => d.classList.toggle('active', idx === currentIndex));
  };

  const goToSlide = (index) => {
    const maxIdx = getMaxIndex();
    currentIndex = Math.max(0, Math.min(index, maxIdx));
    const slideWidth = slides[0].getBoundingClientRect().width + 24;
    track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
    updateDots();
  };

  prevBtn.addEventListener('click', () => {
    goToSlide(currentIndex <= 0 ? getMaxIndex() : currentIndex - 1);
  });

  nextBtn.addEventListener('click', () => {
    goToSlide(currentIndex >= getMaxIndex() ? 0 : currentIndex + 1);
  });

  // Touch (swipe palcem na telefonu) + Mouse drag podrška za Swiper
  let startX = 0;
  let isMouseDown = false;

  swiperContainer.addEventListener(
    'touchstart',
    (e) => {
      startX = e.touches[0].clientX;
    },
    { passive: true }
  );

  swiperContainer.addEventListener(
    'touchend',
    (e) => {
      const endX = e.changedTouches[0].clientX;
      const diff = endX - startX;
      if (diff < -40) nextBtn.click();
      if (diff > 40) prevBtn.click();
    },
    { passive: true }
  );

  swiperContainer.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    startX = e.clientX;
  });

  window.addEventListener('mouseup', (e) => {
    if (!isMouseDown) return;
    isMouseDown = false;
    const diff = e.clientX - startX;
    if (diff < -50) nextBtn.click();
    if (diff > 50) prevBtn.click();
  });

  window.addEventListener('resize', () => {
    buildDots();
    goToSlide(currentIndex);
    syncViewportOffset();
  });

  buildDots();

  /* ================= 5. UTISCI KLIJENATA (TESTIMONIALS SLIDER) ================= */
  const testimonialsData = [
    {
      title: 'KVALITET IZNAD OČEKIVANJA',
      text: 'Renoviranje starog parketa urađeno je temeljno - brušenje i lakiranje su vratili pod u odlično stanje. Preporučujem svima koji traže pouzdanog majstora.',
      author: 'MARKO JOVANOVIĆ',
      location: 'Palilula, Niš',
    },
    {
      title: 'PRECIZNOST I POŠTOVANJE ROKA',
      text: 'Postavljali su nam hrastov parket u celom stanu. Sve je završeno tačno u dogovorenom danu, bez prašine i sa savršeno uklopljenim lajsnama.',
      author: 'JELENA NIKOLIĆ',
      location: 'Medijana, Niš',
    },
    {
      title: 'PORODIČNA TRADICIJA KOJA SE VIDI',
      text: 'Od prvog dolaska na procenu pa do poslednjeg sloja laka, komunikacija je bila jasna i profesionalna. Parket izgleda kao nov.',
      author: 'DEJAN STOJANOVIĆ',
      location: 'Pantelej, Niš',
    },
  ];

  let testiIndex = 0;
  const testiBody = document.getElementById('testimonialBody');
  const testiTitle = document.getElementById('testiTitle');
  const testiText = document.getElementById('testiText');
  const testiAuthor = document.getElementById('testiAuthor');
  const testiLocation = document.getElementById('testiLocation');

  const changeTestimonial = (newIndex) => {
    testiIndex = (newIndex + testimonialsData.length) % testimonialsData.length;
    testiBody.classList.add('fading');

    setTimeout(() => {
      const item = testimonialsData[testiIndex];
      testiTitle.textContent = item.title;
      testiText.textContent = item.text;
      testiAuthor.textContent = item.author;
      testiLocation.textContent = item.location;
      testiBody.classList.remove('fading');
    }, 220);
  };

  document.getElementById('testiPrev').addEventListener('click', () => {
    changeTestimonial(testiIndex - 1);
  });

  document.getElementById('testiNext').addEventListener('click', () => {
    changeTestimonial(testiIndex + 1);
  });

  document.getElementById('testimonialNextPill').addEventListener('click', () => {
    changeTestimonial(testiIndex + 1);
  });

  /* ================= 6. FAQ HARMONIKA (ACCORDION) ================= */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item) => {
    const questionBtn = item.querySelector('.faq-question');
    const answerDiv = item.querySelector('.faq-answer');
    const toggleSymbol = item.querySelector('.faq-toggle');

    questionBtn.addEventListener('click', () => {
      const isCurrentlyActive = item.classList.contains('active');

      faqItems.forEach((other) => {
        other.classList.remove('active');
        other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        other.querySelector('.faq-answer').style.maxHeight = null;
        other.querySelector('.faq-toggle').textContent = '+';
      });

      if (!isCurrentlyActive) {
        item.classList.add('active');
        questionBtn.setAttribute('aria-expanded', 'true');
        answerDiv.style.maxHeight = answerDiv.scrollHeight + 'px';
        toggleSymbol.textContent = '−';
      }
    });
  });

  /* ================= 7. KONTAKT FORMA (FRONT-END VALIDACIJA + MAILTO/API SPREMNO) ================= */
  const quoteForm = document.getElementById('quoteForm');
  const formStatus = document.getElementById('formStatus');

  quoteForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = document.getElementById('fullName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!fullName || !phone || !message) {
      formStatus.className = 'form-status error';
      formStatus.textContent = 'Molimo vas da popunite sva obavezna polja (*).';
      return;
    }

    const WEB3FORMS_KEY = '';

    if (WEB3FORMS_KEY) {
      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_key: WEB3FORMS_KEY,
            subject: `Novi upit za parket - ${fullName}`,
            name: fullName,
            phone,
            email,
            message,
          }),
        });
        if (res.ok) {
          formStatus.className = 'form-status success';
          formStatus.textContent = 'Hvala! Vaš upit je uspešno poslat. Javićemo vam se uskoro.';
          quoteForm.reset();
          return;
        }
      } catch (err) {
        // Nastavlja na fallback ispod
      }
    }

    formStatus.className = 'form-status success';
    formStatus.textContent = 'Hvala! Upit je pripremljen — otvaramo vaš email klijent za slanje.';

    const mailSubject = encodeURIComponent(`Upit za ponudu - ${fullName}`);
    const mailBody = encodeURIComponent(
      `Ime i prezime: ${fullName}\nTelefon: ${phone}\nEmail: ${email || 'Nije unet'}\n\nOpis radova:\n${message}`
    );

    setTimeout(() => {
      window.location.href = `mailto:antaantica@gmail.com?subject=${mailSubject}&body=${mailBody}`;
      quoteForm.reset();
    }, 800);
  });

  /* ================= 8. GODINA U FOOTERU ================= */
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});