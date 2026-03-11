/**
 * Load header and footer from html/core/ and inject into placeholders.
 * Loads app.js after injection so Vue mounts with header/footer in place.
 * Uses {{BASE}} in fragments as a "path to project root" helper.
 */
(function () {
  var path = window.location.pathname || '';
  var isTemplate = path.indexOf('template') !== -1;
  var isFrontend = path.indexOf('Frontend/') !== -1 || path.indexOf('Frontend\\') !== -1;
  var baseToRoot = isTemplate ? '../../' : (isFrontend ? '../' : '');
  var coreBase = baseToRoot + 'html/core/';
  var isNavigating = false;

  // Prepare fade-in on first paint after Vue mounts.
  document.body.classList.add('page-enter');

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

  function startPageLeave(nextHref) {
    if (isNavigating) return;
    isNavigating = true;
    document.body.classList.add('page-leave');
    window.setTimeout(function () {
      window.location.href = nextHref;
    }, 180);
  }

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
    if (isTemplate) s.src = '../../Frontend/app.js';
    else if (isFrontend) s.src = 'app.js';
    else s.src = 'Frontend/app.js';
    document.body.appendChild(s);
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a');
    if (!a) return;
    if (isModifiedClick(e)) return;
    if (!shouldHandleLink(a)) return;

    var url = toUrl(a.getAttribute('href'));
    if (!url) return;
    if (url.origin !== window.location.origin) return;

    // Let in-page hash scrolling be handled by app.js (smooth scroll).
    if (url.pathname === window.location.pathname && url.search === window.location.search) {
      return;
    }

    e.preventDefault();
    startPageLeave(url.href);
  });

  Promise.all([
    fetchText(coreBase + 'header.html'),
    fetchText(coreBase + 'footer.html')
  ]).then(function (results) {
    inject('header-placeholder', results[0].replace(/\{\{BASE\}\}/g, baseToRoot));
    inject('footer-placeholder', results[1].replace(/\{\{BASE\}\}/g, baseToRoot));
    loadApp();
  }).catch(function () {
    loadApp();
  });
})();
