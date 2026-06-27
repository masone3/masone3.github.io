(function() {
  const STAR_COLORS = ['#ffffff', '#f8f1ff', '#fff5c7', '#ffdfe5'];
  let starfieldCanvas;
  let starCtx;
  let stars = [];

  function injectGlobalStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .starfield-canvas {
        position: fixed;
        inset: 0;
        z-index: -1;
        pointer-events: none;
      }

      .interactive-animate {
        transition: transform 220ms ease, box-shadow 220ms ease, background-color 220ms ease, color 220ms ease;
        will-change: transform, opacity;
      }

      .interactive-animate.interactive-hover {
        transform: translateY(-1px) scale(1.01);
      }

      .dropdown {
        position: relative;
      }

      .dropdown-menu {
        overflow: hidden;
        max-height: 0;
        opacity: 0;
        transform: translateY(-8px);
        transition: max-height 220ms ease, opacity 220ms ease, transform 220ms ease;
      }

      .dropdown.open .dropdown-menu {
        opacity: 1;
        transform: translateY(0);
      }
    `;
    document.head.appendChild(style);
  }

  function buildStarfield() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    stars = [];
    const count = Math.max(100, Math.round((width * height) / 14000));

    for (let i = 0; i < count; i += 1) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.6 + 0.4,
        baseAlpha: Math.random() * 0.6 + 0.3,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.0025 + 0.0008,
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      });
    }
  }

  function resizeStarfield() {
    const dpr = window.devicePixelRatio || 1;
    starfieldCanvas.width = window.innerWidth * dpr;
    starfieldCanvas.height = window.innerHeight * dpr;
    starfieldCanvas.style.width = `${window.innerWidth}px`;
    starfieldCanvas.style.height = `${window.innerHeight}px`;
    starCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildStarfield();
  }

  function drawStarfield(timestamp = 0) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    starCtx.clearRect(0, 0, width, height);

    stars.forEach((star) => {
      const alpha = star.baseAlpha + Math.sin(star.phase + timestamp * star.speed) * 0.25;
      const radius = star.radius * (0.8 + 0.3 * Math.sin(star.phase * 1.3));
      star.phase += star.speed;

      starCtx.beginPath();
      starCtx.arc(star.x, star.y, radius, 0, Math.PI * 2);
      starCtx.fillStyle = `rgba(255,255,255,${Math.max(0.18, Math.min(1, alpha))})`;
      starCtx.shadowBlur = 8;
      starCtx.shadowColor = star.color;
      starCtx.fill();
    });

    window.requestAnimationFrame(drawStarfield);
  }

  function createStarfieldCanvas() {
    starfieldCanvas = document.createElement('canvas');
    starfieldCanvas.className = 'starfield-canvas';
    document.body.prepend(starfieldCanvas);
    starCtx = starfieldCanvas.getContext('2d');
    resizeStarfield();
    window.addEventListener('resize', resizeStarfield);
    window.requestAnimationFrame(drawStarfield);
  }

  function enhanceInteractiveElements() {
    const selectors = ['a', 'button', 'input[type="submit"]', '.button', '.btn', '[role="button"]'];
    const interactive = Array.from(document.querySelectorAll(selectors.join(',')));

    interactive.forEach((element) => {
      element.classList.add('interactive-animate');

      element.addEventListener('pointerenter', () => {
        element.classList.add('interactive-hover');
      });

      element.addEventListener('pointerleave', () => {
        element.classList.remove('interactive-hover');
      });

      element.addEventListener('focus', () => {
        element.classList.add('interactive-hover');
      });

      element.addEventListener('blur', () => {
        element.classList.remove('interactive-hover');
      });
    });
  }

  function setupDropdownMenus() {
    const dropdowns = Array.from(document.querySelectorAll('.dropdown'));

    function closeDropdown(dropdown) {
      const menu = dropdown.querySelector('.dropdown-menu');
      const toggle = dropdown.querySelector('.dropdown-toggle, [data-dropdown-toggle]');
      if (!menu) return;
      dropdown.classList.remove('open');
      menu.style.maxHeight = '0px';
      menu.style.opacity = '0';
      menu.style.transform = 'translateY(-8px)';
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }

    function openDropdown(dropdown) {
      const menu = dropdown.querySelector('.dropdown-menu');
      const toggle = dropdown.querySelector('.dropdown-toggle, [data-dropdown-toggle]');
      if (!menu) return;
      dropdown.classList.add('open');
      menu.style.maxHeight = `${menu.scrollHeight}px`;
      menu.style.opacity = '1';
      menu.style.transform = 'translateY(0)';
      if (toggle) toggle.setAttribute('aria-expanded', 'true');
    }

    dropdowns.forEach((dropdown) => {
      const toggle = dropdown.querySelector('.dropdown-toggle, [data-dropdown-toggle]');
      const menu = dropdown.querySelector('.dropdown-menu');
      if (!toggle || !menu) return;

      menu.style.overflow = 'hidden';
      menu.style.maxHeight = '0px';
      menu.style.opacity = '0';
      menu.style.transform = 'translateY(-8px)';
      toggle.setAttribute('aria-expanded', 'false');

      toggle.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (dropdown.classList.contains('open')) {
          closeDropdown(dropdown);
        } else {
          dropdowns.forEach((otherDropdown) => {
            if (otherDropdown !== dropdown) closeDropdown(otherDropdown);
          });
          openDropdown(dropdown);
        }
      });
    });

    document.addEventListener('click', (event) => {
      dropdowns.forEach((dropdown) => {
        if (!dropdown.contains(event.target)) {
          closeDropdown(dropdown);
        }
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        dropdowns.forEach((dropdown) => closeDropdown(dropdown));
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    injectGlobalStyles();
    createStarfieldCanvas();
    enhanceInteractiveElements();
    setupDropdownMenus();
  });
})();