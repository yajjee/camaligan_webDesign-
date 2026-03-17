/**
 * Load header, footer, and sidebar widgets from html/core/ and inject into placeholders.
 * Loads app.js after injection so Vue mounts with header/footer in place.
 * Uses {{BASE}} in fragments as a "path to project root" helper.
 */
(function () {
  // Assume the site is served from project root (e.g., http://localhost:8000/).
  // Use absolute paths so header/footer work from any page.
  var baseToRoot = '/';
  var coreBase = '/Frontend/html/core/';
  
    
  function fetchText(url) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) return;
        if (xhr.status === 200) resolve(xhr.responseText);
        else reject(new Error(url + ' ' + xhr.status));
      };
      xhr.send();
    });
  }

  function inject(id, html) {
    var el = document.getElementById(id);
    if (el && html) el.outerHTML = html;
  }

  function loadApp() {
    var s = document.createElement('script');
    s.src = '/Frontend/app.js';
    document.body.appendChild(s);
  }

  function isModifiedClick(e) {
    return e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;
  }

  function shouldHandleLink(a) {
    if (!a) return false;
    if (a.hasAttribute('download')) return false;
    if (a.target && a.target !== '_self') return false;
    var href = a.getAttribute('href') || '';
    if (!href || href === '#' || href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0) return false;
    return true;
  }

  function toUrl(href) {
    try {
      return new URL(href, window.location.href);
    } catch (e) {
      return null;
    }
  }

  // Simple cache-busting for core fragments so HTML changes (like menu items)
  // are always picked up even when the browser aggressively caches them.
  var cacheBust = '?v=3';

  // Smooth page transition for same-origin navigations (white fade).
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a');
    if (!a) return;
    if (isModifiedClick(e)) return;
    if (!shouldHandleLink(a)) return;

    var url = toUrl(a.getAttribute('href'));
    if (!url) return;
    if (url.origin !== window.location.origin) return;

    // Let in-page hash scrolling be handled by app.js.
    if (url.pathname === window.location.pathname && url.search === window.location.search) {
      return;
    }

    e.preventDefault();
    // Ensure fade transition is armed then start fade-in.
    document.documentElement.classList.add('is-fade-ready');
    window.requestAnimationFrame(function () {
      document.documentElement.classList.add('is-fading');
      window.setTimeout(function () {
        window.location.href = url.href;
      }, 320);
    });
  });

  Promise.all([
    fetchText(coreBase + 'header.html' + cacheBust),
    fetchText(coreBase + 'footer.html' + cacheBust),
    fetchText(coreBase + 'sidebar_widgets.html' + cacheBust)
  ]).then(function (results) {
    inject('header-placeholder', results[0].replace(/\{\{BASE\}\}/g, baseToRoot));
    inject('footer-placeholder', results[1].replace(/\{\{BASE\}\}/g, baseToRoot));
    inject('sidebar-widgets-placeholder', results[2].replace(/\{\{BASE\}\}/g, baseToRoot));
    loadApp();
  }).catch(function (err) {
    // If any core fragment fails to load, just load the app so pages still work.
    if (window.console && console.error) {
      console.error('Failed to load core fragments', err);
    }
    loadApp();
  });
})();