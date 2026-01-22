document.addEventListener('DOMContentLoaded', () => {
  initMarquee();
  initModal();
  initForm();
  initMobileMenu();
  initScrollHeader();
  initHeroAnimations();
});

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

function initMobileMenu() {
  const toggle = document.querySelector('.mobile-toggle');
  const menu = document.querySelector('.nav-menu');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', () => {
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', !isExpanded);
    menu.classList.toggle('active');
    if (!isExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  });
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

function initMarquee() {
  const container = document.querySelector('.marquee-content');
  if (!container) return;
  const originalItems = Array.from(container.children);
  const itemCount = originalItems.length;
  for (let i = 0; i < 3; i++) {
    originalItems.forEach(item => {
      const clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      container.appendChild(clone);
    });
  }

  requestAnimationFrame(() => {
    const firstItem = originalItems[0];
    const secondSetFirstItem = container.children[itemCount];
    let oneSetWidth;
    if (secondSetFirstItem) {
      oneSetWidth = secondSetFirstItem.offsetLeft - firstItem.offsetLeft;
    } else {
      let totalWidth = 0;
      originalItems.forEach((item, index) => {
        totalWidth += item.offsetWidth;
        if (index < originalItems.length - 1) {
          totalWidth += 32;
        }
      });
      oneSetWidth = totalWidth;
    }
    let scrollPos = 0;
    const speed = 1;
    let reqId;

    function animate() {
      scrollPos -= speed;
      if (Math.abs(scrollPos) >= oneSetWidth) {
        scrollPos += oneSetWidth;
      }
      container.style.transform = `translateX(${scrollPos}px)`;
      const centerX = container.parentElement.offsetWidth / 2;
      let closestItem = null;
      let minDistance = Infinity;
      container.querySelectorAll('.marquee-item').forEach(item => {
        const itemLeft = item.offsetLeft + scrollPos;
        const distance = Math.abs(itemLeft + item.offsetWidth / 2 - centerX);
        if (distance < minDistance) {
          minDistance = distance;
          closestItem = item;
        }
      });
      container.querySelectorAll('.marquee-item').forEach(item => item.classList.remove('centered'));
      if (closestItem && minDistance < 50) {
        closestItem.classList.add('centered');
      }
      reqId = requestAnimationFrame(animate);
    }
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!mediaQuery.matches) {
      reqId = requestAnimationFrame(animate);
    }
  });
}

function initModal() {
  const modal = document.getElementById('project-modal');
  const closeBtn = document.querySelector('.close-modal');
  const triggers = document.querySelectorAll('.project-card');
  if (!modal) return;
  const contentTitle = modal.querySelector('#m-title');
  const contentDesc = modal.querySelector('#m-desc');
  const contentTags = modal.querySelector('#m-tags');
  const linkRepo = modal.querySelector('#m-repo');
  const linkLive = modal.querySelector('#m-live');
  function openModal(card) {
    contentTitle.textContent = card.querySelector('.project-title').textContent;
    contentDesc.textContent = card.dataset.fullDesc || "No details available.";

    contentTags.innerHTML = '';
    const tags = card.dataset.stack.split(',');
    tags.forEach(tag => {
      const span = document.createElement('span');
      span.className = 'tag';
      span.textContent = tag.trim();
      contentTags.appendChild(span);
    });

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
      if (e.target.tagName === 'A') return;
      openModal(card);
    });
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


function initHeroAnimations() {
  gsap.from(".hero-title", { y: 100, opacity: 0, duration: 1.2, ease: "power3.out" });
  gsap.from(".hero-subtitle", { y: 80, opacity: 0, duration: 1, delay: 0.3, ease: "power3.out" });

}
