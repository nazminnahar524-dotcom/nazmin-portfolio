/* ==========================================================================
   NAZMIN NAHAR — PORTFOLIO SCRIPT
   Vanilla JS. No frameworks. Organized by feature.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------------------------------ */
  /* 1. THEME (dark / light) — respects system preference, saves choice */
  /* ------------------------------------------------------------------ */
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    themeToggle.setAttribute('aria-pressed', theme === 'light');
  }

  (function initTheme() {
    const saved = localStorage.getItem('nn-theme');
    if (saved) {
      applyTheme(saved);
    } else {
      const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
      applyTheme(prefersLight ? 'light' : 'dark');
    }
  })();

  themeToggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    applyTheme(next);
    localStorage.setItem('nn-theme', next);
    // Leaflet needs a nudge after layout/paint changes
    setTimeout(() => { if (window.__nnMap) window.__nnMap.invalidateSize(); }, 300);
  });

  /* ------------------------------------------------------------------ */
  /* 2. NAVBAR — scroll state, smooth scroll, active link, mobile menu   */
  /* ------------------------------------------------------------------ */
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  function updateNavbarState() {
    navbar.classList.toggle('scrolled', window.scrollY > 12);
  }
  updateNavbarState();
  window.addEventListener('scroll', updateNavbarState, { passive: true });

  hamburger.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
  });

  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // Close mobile menu on outside click
  document.addEventListener('click', (e) => {
    if (mobileMenu.classList.contains('open') &&
        !mobileMenu.contains(e.target) &&
        !hamburger.contains(e.target)) {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });

  // Smooth scroll for all in-page anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Highlight active nav link on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  function setActiveLink() {
    let currentId = '';
    const scrollPos = window.scrollY + 120;
    sections.forEach(sec => {
      if (scrollPos >= sec.offsetTop) currentId = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
    });
  }
  window.addEventListener('scroll', setActiveLink, { passive: true });
  setActiveLink();

  /* ------------------------------------------------------------------ */
  /* 3. SCROLL PROGRESS BAR                                              */
  /* ------------------------------------------------------------------ */
  const scrollProgress = document.getElementById('scrollProgress');
  function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = `${pct}%`;
  }
  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();

  /* ------------------------------------------------------------------ */
  /* 4. BACK TO TOP                                                      */
  /* ------------------------------------------------------------------ */
  const backToTop = document.getElementById('backToTop');
  function toggleBackToTop() {
    backToTop.classList.toggle('visible', window.scrollY > 500);
  }
  window.addEventListener('scroll', toggleBackToTop, { passive: true });
  toggleBackToTop();
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ------------------------------------------------------------------ */
  /* 5. DYNAMIC COPYRIGHT YEAR                                           */
  /* ------------------------------------------------------------------ */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------ */
  /* 6. SCROLL REVEAL ANIMATIONS (IntersectionObserver)                  */
  /* ------------------------------------------------------------------ */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('in-view'), i * 60);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  function observeReveals() {
    document.querySelectorAll('.reveal:not(.in-view)').forEach(el => revealObserver.observe(el));
  }

  /* ------------------------------------------------------------------ */
  /* 7. COUNT-UP STAT ANIMATION                                          */
  /* ------------------------------------------------------------------ */
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const isDecimal = el.dataset.count.includes('.');
        const duration = 1400;
        const start = performance.now();
        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          const value = target * eased;
          el.textContent = isDecimal ? value.toFixed(2) : Math.round(value);
          if (progress < 1) requestAnimationFrame(tick);
          else el.textContent = isDecimal ? target.toFixed(2) : target;
        }
        requestAnimationFrame(tick);
        statObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat-number').forEach(el => statObserver.observe(el));

  /* ------------------------------------------------------------------ */
  /* 8. HERO CANVAS — subtle floating particle / node network            */
  /* ------------------------------------------------------------------ */
  (function heroCanvas() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, particles;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize() {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    }

    function initParticles() {
      const count = Math.min(50, Math.floor((w * h) / 22000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.6
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#3ed9c8';
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.strokeStyle = accent;
            ctx.globalAlpha = (1 - dist / 130) * 0.15;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = accent;
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      if (!prefersReducedMotion) requestAnimationFrame(draw);
    }

    resize();
    initParticles();
    draw();
    window.addEventListener('resize', () => { resize(); initParticles(); });
  })();

  /* ------------------------------------------------------------------ */
  /* 9. DATA — SKILLS                                                    */
  /* ------------------------------------------------------------------ */
  const languageSkills = [
    { name: 'C', icon: 'devicon-c-plain', cat: 'Programming Language' },
    { name: 'C++', icon: 'devicon-cplusplus-plain', cat: 'Programming Language' },
    { name: 'Java', icon: 'devicon-java-plain', cat: 'Programming Language' },
    { name: 'Python', icon: 'devicon-python-plain', cat: 'Programming Language' }
  ];

  const webSkills = [
    { name: 'HTML', icon: 'devicon-html5-plain', cat: 'Markup Language' },
    { name: 'CSS', icon: 'devicon-css3-plain', cat: 'Stylesheet Language' },
    { name: 'Database Management', icon: 'fa-solid fa-database', cat: 'Data & Storage', fa: true },
    { name: 'Data Structures & Algorithms', icon: 'fa-solid fa-diagram-project', cat: 'Core CS', fa: true }
  ];

  const interestSkills = [
    { name: 'Programming', icon: 'fa-solid fa-code', fa: true },
    { name: 'Machine Learning', icon: 'fa-solid fa-brain', fa: true },
    { name: 'Artificial Intelligence', icon: 'fa-solid fa-robot', fa: true },
    { name: 'Technology', icon: 'fa-solid fa-microchip', fa: true }
  ];

  const focusAreas = [
    { name: 'Programming', level: 'foundation' },
    { name: 'Web Development', level: 'developing' },
    { name: 'Database Management', level: 'developing' },
    { name: 'Data Structures & Algorithms', level: 'foundation' },
    { name: 'Machine Learning', level: 'exploring' },
    { name: 'Artificial Intelligence', level: 'exploring' }
  ];

  function renderSkillCard(skill) {
    const iconHTML = skill.fa
      ? `<i class="${skill.icon}"></i>`
      : `<i class="${skill.icon} colored"></i>`;
    return `
      <div class="skill-card">
        ${iconHTML}
        <div class="skill-name">${skill.name}</div>
        <div class="skill-cat">${skill.cat || ''}</div>
      </div>`;
  }

  document.getElementById('langSkills').innerHTML = languageSkills.map(renderSkillCard).join('');
  document.getElementById('webSkills').innerHTML = webSkills.map(renderSkillCard).join('');
  document.getElementById('interestSkills').innerHTML = interestSkills.map(renderSkillCard).join('');

  document.getElementById('focusGrid').innerHTML = focusAreas.map(f => `
    <div class="focus-tag">
      <span>${f.name}</span>
      <span class="focus-level ${f.level}">${f.level.charAt(0).toUpperCase() + f.level.slice(1)}</span>
    </div>
  `).join('');

  /* ------------------------------------------------------------------ */
  /* 10. DATA — PROJECTS                                                 */
  /* ------------------------------------------------------------------ */
  const projects = [
    {
      title: 'ZyloMart',
      type: 'Console-based Online Shopping Management System',
      category: 'Java',
      description: 'ZyloMart is a Java-based console application designed to simulate an online shopping management system. The project focuses on shopping logic, inventory management, product handling, and user selections through a structured console interface.',
      technologies: [{ name: 'Java', icon: 'devicon-java-plain' }],
      features: ['Shopping logic', 'Inventory management', 'Product handling', 'User selections', 'Console-based interaction'],
      icon: 'devicon-java-plain',
      github: ''
    },
    {
      title: 'Database Management System',
      type: 'Web-based Relational Database Management System',
      category: 'Web Development',
      description: 'A web-based relational database management system developed with a Flask backend and HTML/CSS frontend. The project focuses on managing structured information through a database-driven web interface.',
      technologies: [
        { name: 'Python', icon: 'devicon-python-plain' },
        { name: 'Flask', icon: 'devicon-flask-original' },
        { name: 'HTML', icon: 'devicon-html5-plain' },
        { name: 'CSS', icon: 'devicon-css3-plain' },
        { name: 'Database', icon: 'fa-solid fa-database', fa: true }
      ],
      features: ['Database management', 'Web-based interface', 'Flask backend', 'HTML/CSS frontend'],
      icon: 'fa-solid fa-server',
      iconFa: true,
      github: ''
    }
  ];

  const projectsGrid = document.getElementById('projectsGrid');
  projectsGrid.innerHTML = projects.map((p, i) => `
    <article class="project-card reveal" data-index="${i}" tabindex="0" role="button" aria-label="View details for ${p.title}">
      <div class="project-icon-row">
        <div class="project-icon">${p.iconFa ? `<i class="${p.icon}"></i>` : `<i class="${p.icon} colored"></i>`}</div>
        <span class="project-type-tag">${p.category}</span>
      </div>
      <h3 class="project-title">${p.title}</h3>
      <p class="project-desc">${p.description}</p>
      <div class="tech-badges">
        ${p.technologies.map(t => `<span class="tech-badge">${t.fa ? `<i class="${t.icon}"></i>` : `<i class="${t.icon} colored"></i>`} ${t.name}</span>`).join('')}
      </div>
      <button class="project-details-btn" data-index="${i}">View Details <i class="fa-solid fa-arrow-right"></i></button>
    </article>
  `).join('');
  observeReveals();

  /* Project modal */
  const projectModal = document.getElementById('projectModal');
  const projectModalContent = document.getElementById('projectModalContent');
  const projectModalClose = document.getElementById('projectModalClose');

  function openProjectModal(index) {
    const p = projects[index];
    projectModalContent.innerHTML = `
      <div class="modal-project-icon">${p.iconFa ? `<i class="${p.icon}"></i>` : `<i class="${p.icon} colored"></i>`}</div>
      <h3 class="modal-project-title">${p.title}</h3>
      <p class="modal-project-type">${p.type}</p>
      <p class="modal-project-desc">${p.description}</p>
      <div class="tech-badges">
        ${p.technologies.map(t => `<span class="tech-badge">${t.fa ? `<i class="${t.icon}"></i>` : `<i class="${t.icon} colored"></i>`} ${t.name}</span>`).join('')}
      </div>
      <p class="modal-section-label">Features</p>
      <ul class="modal-feature-list">
        ${p.features.map(f => `<li>${f}</li>`).join('')}
      </ul>
      ${p.github
        ? `<a href="${p.github}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">View Repository <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`
        : `<p class="modal-repo-note"><i class="fa-solid fa-clock"></i> Repository Link Coming Soon</p>`}
    `;
    projectModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeProjectModal() {
    projectModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  projectsGrid.addEventListener('click', (e) => {
    const card = e.target.closest('.project-card');
    const btn = e.target.closest('.project-details-btn');
    if (btn) { openProjectModal(btn.dataset.index); return; }
    if (card && !e.target.closest('a')) openProjectModal(card.dataset.index);
  });
  projectsGrid.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.project-card')) {
      e.preventDefault();
      openProjectModal(e.target.closest('.project-card').dataset.index);
    }
  });
  projectModalClose.addEventListener('click', closeProjectModal);
  projectModal.addEventListener('click', (e) => { if (e.target === projectModal) closeProjectModal(); });

  /* ------------------------------------------------------------------ */
  /* 11. DATA — CERTIFICATES + FILTER + LIGHTBOX                        */
  /* ------------------------------------------------------------------ */
  const certificates = [
    { title: 'SSC Certificate', category: 'Academic', image: 'assets/certificates/ssc.jpeg' },
    { title: 'HSC Certificate', category: 'Academic', image: 'assets/certificates/hsc.jpeg' },
    { title: 'BAFSD Carnival Certificate', category: 'Activity', image: 'assets/certificates/firstbafsdcarnivalcert.jpeg' },
    { title: "1st Semester Dean's Award", category: 'Academic Award', image: 'assets/certificates/firstsemesterdeansaward.jpeg' },
    { title: "2nd Semester Vice Chancellor's Award", category: 'Academic Award', image: 'assets/certificates/secondsemestervcaward.jpeg' },
    { title: "3rd Semester Dean's Award", category: 'Academic Award', image: 'assets/certificates/thirdsemesterdeansaward.jpeg' }
  ];

  const certGrid = document.getElementById('certGrid');
  let currentCertFilter = 'All';
  let filteredCerts = certificates.slice();
  let currentCertIndex = 0;

  function renderCertificates(filter) {
    filteredCerts = filter === 'All' ? certificates.slice() : certificates.filter(c => c.category === filter);
    certGrid.innerHTML = filteredCerts.map((c, i) => `
      <div class="cert-card" data-index="${i}" tabindex="0" role="button" aria-label="View ${c.title}">
        <div class="cert-thumb-wrap">
          <img src="${c.image}" alt="${c.title}" class="cert-thumb" loading="lazy">
          <div class="cert-overlay"><i class="fa-solid fa-magnifying-glass-plus"></i></div>
        </div>
        <div class="cert-info">
          <div class="cert-title">${c.title}</div>
          <div class="cert-cat">${c.category}</div>
        </div>
      </div>
    `).join('');
  }
  renderCertificates('All');

  document.getElementById('certFilterBar').addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCertFilter = btn.dataset.filter;
    renderCertificates(currentCertFilter);
  });

  const certLightbox = document.getElementById('certLightbox');
  const certLightboxImg = document.getElementById('certLightboxImg');
  const certLightboxCaption = document.getElementById('certLightboxCaption');

  function openCertLightbox(index) {
    currentCertIndex = index;
    updateCertLightbox();
    certLightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function updateCertLightbox() {
    const c = filteredCerts[currentCertIndex];
    certLightboxImg.src = c.image;
    certLightboxImg.alt = c.title;
    certLightboxCaption.textContent = `${c.title} — ${c.category}`;
  }
  function closeCertLightbox() {
    certLightbox.classList.remove('open');
    document.body.style.overflow = '';
  }
  function certNav(dir) {
    currentCertIndex = (currentCertIndex + dir + filteredCerts.length) % filteredCerts.length;
    updateCertLightbox();
  }

  certGrid.addEventListener('click', (e) => {
    const card = e.target.closest('.cert-card');
    if (card) openCertLightbox(Number(card.dataset.index));
  });
  certGrid.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.cert-card')) {
      e.preventDefault();
      openCertLightbox(Number(e.target.closest('.cert-card').dataset.index));
    }
  });
  document.getElementById('certLightboxClose').addEventListener('click', closeCertLightbox);
  document.getElementById('certPrev').addEventListener('click', () => certNav(-1));
  document.getElementById('certNext').addEventListener('click', () => certNav(1));
  certLightbox.addEventListener('click', (e) => { if (e.target === certLightbox) closeCertLightbox(); });

  /* ------------------------------------------------------------------ */
  /* 12. GALLERY + LIGHTBOX                                              */
  /* ------------------------------------------------------------------ */
  const galleryImages = [
    { src: 'assets/gallery/mypic1.jpeg', alt: 'Gallery photo 1' },
    { src: 'assets/gallery/mypic2.jpeg', alt: 'Gallery photo 2' },
    { src: 'assets/gallery/mypic3.jpeg', alt: 'Gallery photo 3' },
    { src: 'assets/gallery/mypic4.jpeg', alt: 'Gallery photo 4' },
    { src: 'assets/gallery/mypic5.jpeg', alt: 'Gallery photo 5' },
    { src: 'assets/gallery/mypic6.jpeg', alt: 'Gallery photo 6' },
    { src: 'assets/gallery/mypic7.jpeg', alt: 'Gallery photo 7' },
    { src: 'assets/gallery/mypic8.jpeg', alt: 'Gallery photo 8' },
    { src: 'assets/gallery/pic.jpeg', alt: 'Gallery photo 9' }
  ];

  const galleryGrid = document.getElementById('galleryGrid');
  const galleryEmpty = document.getElementById('galleryEmpty');
  let currentGalleryIndex = 0;

  if (galleryImages.length === 0) {
    galleryEmpty.hidden = false;
  } else {
    galleryGrid.innerHTML = galleryImages.map((img, i) => `
      <div class="gallery-item" data-index="${i}" tabindex="0" role="button" aria-label="View gallery photo ${i + 1}">
        <img src="${img.src}" alt="${img.alt}" loading="lazy">
        <div class="gallery-overlay"><i class="fa-solid fa-expand"></i></div>
      </div>
    `).join('');
  }

  const galleryLightbox = document.getElementById('galleryLightbox');
  const galleryLightboxImg = document.getElementById('galleryLightboxImg');

  function openGalleryLightbox(index) {
    currentGalleryIndex = index;
    updateGalleryLightbox();
    galleryLightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function updateGalleryLightbox() {
    const img = galleryImages[currentGalleryIndex];
    galleryLightboxImg.src = img.src;
    galleryLightboxImg.alt = img.alt;
  }
  function closeGalleryLightbox() {
    galleryLightbox.classList.remove('open');
    document.body.style.overflow = '';
  }
  function galleryNav(dir) {
    currentGalleryIndex = (currentGalleryIndex + dir + galleryImages.length) % galleryImages.length;
    updateGalleryLightbox();
  }

  galleryGrid.addEventListener('click', (e) => {
    const item = e.target.closest('.gallery-item');
    if (item) openGalleryLightbox(Number(item.dataset.index));
  });
  galleryGrid.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.gallery-item')) {
      e.preventDefault();
      openGalleryLightbox(Number(e.target.closest('.gallery-item').dataset.index));
    }
  });
  document.getElementById('galleryLightboxClose').addEventListener('click', closeGalleryLightbox);
  document.getElementById('galleryPrev').addEventListener('click', () => galleryNav(-1));
  document.getElementById('galleryNext').addEventListener('click', () => galleryNav(1));
  galleryLightbox.addEventListener('click', (e) => { if (e.target === galleryLightbox) closeGalleryLightbox(); });

  /* ------------------------------------------------------------------ */
  /* 13. PROFILE IMAGE LIGHTBOX                                          */
  /* ------------------------------------------------------------------ */
  const profileLightbox = document.getElementById('profileLightbox');
  document.getElementById('profileImgBtn').addEventListener('click', () => {
    profileLightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
  document.getElementById('profileLightboxClose').addEventListener('click', () => {
    profileLightbox.classList.remove('open');
    document.body.style.overflow = '';
  });
  profileLightbox.addEventListener('click', (e) => {
    if (e.target === profileLightbox) {
      profileLightbox.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  /* ------------------------------------------------------------------ */
  /* 14. GLOBAL KEYBOARD HANDLING (ESC + arrows) FOR ALL OVERLAYS        */
  /* ------------------------------------------------------------------ */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (profileLightbox.classList.contains('open')) {
        profileLightbox.classList.remove('open');
        document.body.style.overflow = '';
      }
      if (galleryLightbox.classList.contains('open')) closeGalleryLightbox();
      if (certLightbox.classList.contains('open')) closeCertLightbox();
      if (projectModal.classList.contains('open')) closeProjectModal();
    }
    if (galleryLightbox.classList.contains('open')) {
      if (e.key === 'ArrowLeft') galleryNav(-1);
      if (e.key === 'ArrowRight') galleryNav(1);
    }
    if (certLightbox.classList.contains('open')) {
      if (e.key === 'ArrowLeft') certNav(-1);
      if (e.key === 'ArrowRight') certNav(1);
    }
  });

  /* ------------------------------------------------------------------ */
  /* 15. CONTACT FORM VALIDATION                                        */
  /* ------------------------------------------------------------------ */
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  function setFieldError(fieldId, errorId, message) {
    const field = document.getElementById(fieldId);
    const errorEl = document.getElementById(errorId);
    field.closest('.form-group').classList.toggle('invalid', !!message);
    errorEl.textContent = message || '';
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    formStatus.textContent = '';
    formStatus.className = 'form-status';

    const name = document.getElementById('fname').value.trim();
    const email = document.getElementById('femail').value.trim();
    const subject = document.getElementById('fsubject').value.trim();
    const message = document.getElementById('fmessage').value.trim();

    let valid = true;

    if (!name) { setFieldError('fname', 'err-name', 'Please enter your name.'); valid = false; }
    else setFieldError('fname', 'err-name', '');

    if (!email) { setFieldError('femail', 'err-email', 'Please enter your email.'); valid = false; }
    else if (!validateEmail(email)) { setFieldError('femail', 'err-email', 'Please enter a valid email address.'); valid = false; }
    else setFieldError('femail', 'err-email', '');

    if (!subject) { setFieldError('fsubject', 'err-subject', 'Please enter a subject.'); valid = false; }
    else setFieldError('fsubject', 'err-subject', '');

    if (!message) { setFieldError('fmessage', 'err-message', 'Please enter a message.'); valid = false; }
    else if (message.length < 20) { setFieldError('fmessage', 'err-message', `Message should be at least 20 characters (currently ${message.length}).`); valid = false; }
    else setFieldError('fmessage', 'err-message', '');

    if (!valid) {
      formStatus.textContent = 'Please fix the highlighted fields before sending.';
      formStatus.classList.add('error');
      return;
    }

    // Open the user's email client with the composed message.
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    const mailto = `mailto:nazminnahar524@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;
    window.location.href = mailto;

    formStatus.textContent = 'Your email client should now open with this message ready to send.';
    formStatus.classList.add('success');
  });

  /* ------------------------------------------------------------------ */
  /* 16. LOCATION — LEAFLET MAP (approximate West Nakhalpara area)       */
  /* ------------------------------------------------------------------ */
  (function initMap() {
    const APPROX_LAT = 23.7629;
    const APPROX_LNG = 90.3927;

    const map = L.map('map', { scrollWheelZoom: false }).setView([APPROX_LAT, APPROX_LNG], 14);
    window.__nnMap = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    const pulseIcon = L.divIcon({
      className: 'custom-map-marker',
      html: `<div class="marker-pulse"></div><div class="marker-pin"><i class="fa-solid fa-location-dot"></i></div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 32]
    });

    const marker = L.marker([APPROX_LAT, APPROX_LNG], { icon: pulseIcon }).addTo(map);
    marker.bindPopup(`<strong>Nazmin Nahar</strong><br>West Nakhalpara<br>Dhaka, Bangladesh`);
    marker.openPopup();

    // Enable scroll-wheel zoom only once the user clicks into the map
    // (avoids trapping the page's scroll when the user is just scrolling past it).
    // All other controls (zoom buttons, dragging, touch, marker popup) remain active by default.
    const mapContainer = document.getElementById('map');
    mapContainer.addEventListener('click', () => map.scrollWheelZoom.enable());
    mapContainer.addEventListener('mouseleave', () => map.scrollWheelZoom.disable());

    setTimeout(() => map.invalidateSize(), 300);
    window.addEventListener('resize', () => map.invalidateSize());
  })();

  document.getElementById('googleMapsBtn').addEventListener('click', () => {
    const query = encodeURIComponent('West Nakhalpara, Dhaka, Bangladesh');
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  });

  /* ------------------------------------------------------------------ */
  /* Kick off scroll-reveal observation for statically-present elements  */
  /* ------------------------------------------------------------------ */
  observeReveals();
});
