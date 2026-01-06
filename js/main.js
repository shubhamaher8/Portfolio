document.addEventListener('DOMContentLoaded', () => {
  initMarquee();
  initProjects();
  initModal();
  initForm();
  initMobileMenu();
  initScrollHeader();
  initHeroAnimations();
});



/* Scroll Header */
function initScrollHeader() {
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

/* Mobile Menu */
function initMobileMenu() {
  const toggle = document.querySelector('.mobile-toggle');
  const menu = document.querySelector('.nav-menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', !isExpanded);
    menu.classList.toggle('active');
  });
}

/* Marquee */
function initMarquee() {
  const container = document.querySelector('.marquee-content');
  if (!container) return;

  // Clone items for infinite loop
  const items = Array.from(container.children);
  items.forEach(item => {
    const clone = item.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    container.appendChild(clone);
  });

  let scrollPos = 0;
  const speed = 1; // px per frame
  let reqId;

  function animate() {
    scrollPos -= speed;
    // Reset if scrolled half (since we doubled content)
    if (Math.abs(scrollPos) >= container.scrollWidth / 2) {
      scrollPos = 0;
    }
    container.style.transform = `translateX(${scrollPos}px)`;
    reqId = requestAnimationFrame(animate);
  }

  // PreferReducedMotion check
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!mediaQuery.matches) {
    reqId = requestAnimationFrame(animate);
  }
}

/* Projects Filter */
function initProjects() {
  const filters = document.querySelectorAll('.filter-btn');
  const projects = document.querySelectorAll('.project-card');

  if (!filters.length) return;

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle active state
      filters.forEach(f => f.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.getAttribute('data-filter');

      projects.forEach(project => {
        const categories = project.getAttribute('data-category').split(' ');
        if (category === 'all' || categories.includes(category)) {
          project.style.display = 'flex';
          // optional fade in
          project.style.opacity = '1';
        } else {
          project.style.display = 'none';
          project.style.opacity = '0';
        }
      });
    });
  });
}

/* Modal */
function initModal() {
  const modal = document.getElementById('project-modal');
  const closeBtn = document.querySelector('.close-modal');
  const triggers = document.querySelectorAll('.project-card');

  if (!modal) return;

  const contentTitle = modal.querySelector('#m-title');
  const contentDesc = modal.querySelector('#m-desc');
  const contentImg = modal.querySelector('#m-img');
  const contentTags = modal.querySelector('#m-tags');
  const linkRepo = modal.querySelector('#m-repo');
  const linkLive = modal.querySelector('#m-live');

  function openModal(card) {
    // Populate data
    contentTitle.textContent = card.querySelector('.project-title').textContent;
    contentDesc.textContent = card.dataset.fullDesc || "No details available.";
    contentImg.src = card.querySelector('img').src;

    // Tags
    contentTags.innerHTML = '';
    const tags = card.dataset.stack.split(',');
    tags.forEach(tag => {
      const span = document.createElement('span');
      span.className = 'tag';
      span.textContent = tag.trim();
      contentTags.appendChild(span);
    });

    // Links
    linkRepo.href = card.dataset.repo || '#';
    linkLive.href = card.dataset.live || '#';

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    closeBtn.focus();
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  triggers.forEach(card => {
    card.addEventListener('click', (e) => {
      // if clicked links inside card, don't open modal
      if (e.target.tagName === 'A') return;
      openModal(card);
    });

    // Keyboard enter
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') openModal(card);
    });
  });

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });
}

/* Form */
function initForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const status = document.getElementById('form-status');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const ogText = btn.textContent;

    btn.textContent = 'Sending...';
    btn.disabled = true;

    try {
      const formData = new FormData(form);
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });

      const json = await res.json();

      if (json.success) {
        status.textContent = '> Message transmitted successfully.';
        status.style.color = 'var(--accent)';
        form.reset();
      } else {
        throw new Error('Failed');
      }
    } catch (err) {
      status.textContent = '> Transmission failed. Please try again.';
      status.style.color = '#ff3333';
    } finally {
      status.style.display = 'block';
      btn.textContent = ogText;
      btn.disabled = false;
    }
  });
}

/* Hero Animations with GSAP */
function initHeroAnimations() {
  // 1. Text fade-in stagger on load
  gsap.from(".hero-title", { y: 100, opacity: 0, duration: 1.2, ease: "power3.out" });
  gsap.from(".hero-subtitle", { y: 80, opacity: 0, duration: 1, delay: 0.3, ease: "power3.out" });
  gsap.from(".cta-group .btn", { scale: 0.8, opacity: 0, duration: 0.8, stagger: 0.2, delay: 0.6, ease: "back.out(1.7)" });


  // 3. Subtle parallax on scroll (samurai moves slower)
  gsap.to(".hero-img-container", {
    y: "20%",  // Adjust for depth
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      scrub: true,  // Smooth with scroll
      start: "top top",
      end: "bottom top"
    }
  });

  // 5. Scroll-triggered fade out for smooth section transition
  gsap.to(".hero-content, .hero-image", {
    opacity: 0,
    y: -50,
    duration: 1,
    scrollTrigger: {
      trigger: ".marquee-container",
      start: "top bottom",
      end: "top top",
      scrub: true
    }
  });
}
