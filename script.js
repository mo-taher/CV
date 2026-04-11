/* =========================================================
   PORTFOLIO — JAVASCRIPT
   Author:  Mohammed Taher Abdullah
   Handles: Scroll reveal, nav state, hamburger menu,
            active link tracking, form submit
   ========================================================= */


(function () {
  'use strict';

  /* ---------------------------------------------------------
     DOM REFERENCES
     --------------------------------------------------------- */
  var navbar     = document.getElementById('navbar');
  var hamburger  = document.getElementById('hamburger');
  var navLinks   = document.getElementById('navLinks');
  var allLinks   = document.querySelectorAll('.nav-link');
  var sections   = document.querySelectorAll('section[id]');
  var formBtn    = document.getElementById('formSubmit');


  /* ---------------------------------------------------------
     HAMBURGER MENU TOGGLE
     Opens/closes mobile nav and manages aria state
     --------------------------------------------------------- */
  hamburger.addEventListener('click', function () {
    var isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);

    // Prevent body scroll when menu is open
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close menu when a link is tapped
  allLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });


  /* ---------------------------------------------------------
     NAVBAR SCROLL SHADOW
     Adds a subtle shadow once user scrolls past 40px
     --------------------------------------------------------- */
  var lastScroll = 0;

  function handleNavScroll() {
    var scrollY = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScroll = scrollY;
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });


  /* ---------------------------------------------------------
     ACTIVE NAV LINK TRACKING
     Highlights the nav link matching the current viewport
     section as the user scrolls
     --------------------------------------------------------- */
  function updateActiveLink() {
    var scrollPos = window.pageYOffset + 120;

    sections.forEach(function (section) {
      var top    = section.offsetTop;
      var height = section.offsetHeight;
      var id     = section.getAttribute('id');
      var link   = document.querySelector('.nav-link[href="#' + id + '"]');

      if (link) {
        if (scrollPos >= top && scrollPos < top + height) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });


  /* ---------------------------------------------------------
     SCROLL REVEAL
     Uses IntersectionObserver to fade-up elements as they
     enter the viewport. Falls back to showing everything
     immediately if the API is not supported.
     --------------------------------------------------------- */
  var revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Stop observing once revealed
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: show everything immediately
    revealElements.forEach(function (el) {
      el.classList.add('visible');
    });
  }


  /* ---------------------------------------------------------
     CONTACT FORM SUBMIT
     Simple front-end handler — shows a confirmation message.
     In production you would wire this to Formspree, Netlify
     Forms, or your own backend endpoint.
     --------------------------------------------------------- */
  if (formBtn) {
    formBtn.addEventListener('click', function () {
      var form   = document.getElementById('contactForm');
      var inputs = form.querySelectorAll('input, textarea');
      var filled = true;

      // Basic validation — check all fields have content
      inputs.forEach(function (input) {
        if (!input.value.trim()) {
          filled = false;
          input.style.borderColor = '#ef4444';
          // Reset border on focus
          input.addEventListener('focus', function handler() {
            input.style.borderColor = '';
            input.removeEventListener('focus', handler);
          });
        }
      });

      if (!filled) return;

      // Clear form and show confirmation
      inputs.forEach(function (input) { input.value = ''; });

      formBtn.textContent = 'Message sent!';
      formBtn.style.background = '#22c55e';

      setTimeout(function () {
        formBtn.textContent = 'Send Message';
        formBtn.style.background = '';
      }, 3000);
    });
  }


  /* ---------------------------------------------------------
     SMOOTH SCROLL POLYFILL CHECK
     CSS scroll-behavior handles most cases, but this ensures
     the scroll offset accounts for the fixed nav height on
     all browsers.
     --------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;

      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        var offset = target.offsetTop - 80; // Account for fixed nav
        window.scrollTo({
          top: offset,
          behavior: 'smooth'
        });
      }
    });
  });

})();
