(function() {
  function injectGlobalStyles() {
    const style = document.createElement('style');
    style.textContent = `
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
    enhanceInteractiveElements();
    setupDropdownMenus();
  });

  const mobileToggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (mobileToggle && navLinks) {
    const closeMenu = () => {
      navLinks.classList.remove('active');
      mobileToggle.setAttribute('aria-expanded', 'false');
      mobileToggle.setAttribute('aria-label', 'Open menu');
    };

    const openMenu = () => {
      navLinks.classList.add('active');
      mobileToggle.setAttribute('aria-expanded', 'true');
      mobileToggle.setAttribute('aria-label', 'Close menu');
    };

    mobileToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.contains('active');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Close the menu after choosing a link, so it doesn't stay open
    // when the next page loads.
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    // Close on outside click and on Escape, and return focus to the toggle.
    document.addEventListener('click', (event) => {
      const clickedInsideNav = navLinks.contains(event.target) || mobileToggle.contains(event.target);
      if (!clickedInsideNav && navLinks.classList.contains('active')) {
        closeMenu();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && navLinks.classList.contains('active')) {
        closeMenu();
        mobileToggle.focus();
      }
    });
  }

  // Light/dark theme toggle, persisted in localStorage.
  const themeToggle = document.querySelector('.theme-toggle');

  if (themeToggle) {
    const getCurrentTheme = () =>
      document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';

    const applyTheme = (theme) => {
      if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      themeToggle.setAttribute(
        'aria-label',
        theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'
      );
    };

    // Sync the button's label with whatever the blocking head script
    // already applied, so it's correct even before any click.
    applyTheme(getCurrentTheme());

    themeToggle.addEventListener('click', () => {
      const next = getCurrentTheme() === 'light' ? 'dark' : 'light';
      applyTheme(next);
      try {
        localStorage.setItem('theme', next);
      } catch (e) {}
    });
  }
})();