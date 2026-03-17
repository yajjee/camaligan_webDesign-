/**
 * GOVPH Camaligan - CDN Vue 2 frontend
 * Mounts on #app; all data and logic live here.
 * Runs on DOMContentLoaded or immediately if script was loaded dynamically (e.g. by header_footer.js).
 */
function mountApp() {
  new Vue({
    el: '#app',
    data: {
      searchQuery: '',
      activeTab: (window.__ACTIVE_TAB || ''),
      contentTabs: [
        { id: 'news', label: 'NEWS AND UPDATE' },
        { id: 'events', label: 'EVENTS' },
        { id: 'tourism', label: 'TOURISM' },
        { id: 'gallery', label: 'GALLERY' }
      ],
      ordinanceCats: [
        'Administrative',
        'Development',
        'Environment',
        'Health',
        'Local Taxation',
        'Public Utilities',
        'Social'
      ],
      selectedOrdinanceCat: 'Administrative',
      ordinanceItems: [
        { title: 'Sample Ordinance 2024-001', date: 'Jan 15, 2024' },
        { title: 'Sample Ordinance 2024-002', date: 'Feb 20, 2024' },
        { title: 'Sample Ordinance 2023-012', date: 'Dec 1, 2023' }
      ],
      contact: {
        email: 'lgu.camaligan@gmail.com',
        fbPage: 'LGU Camaligan Official',
        website: 'https://www.camaligan.gov.ph'
      },
      emergencyHotlines: [
        { name: 'PHILIPPINE NATIONAL POLICE', number: '09XX-XXX-XXX' },
        { name: 'BUREAU OF FIRE PROTECTION', number: '09XX-XXX-XXX' },
        { name: 'PHILIPPINE COASTGUARD', number: '09XX-XXX-XXX' },
        { name: 'MUNICIPAL HEALTH OFFICE', number: '09XX-XXX-XXX' },
        { name: 'CAMSWD', number: '09XX-XXX-XXX' }
      ],
      currentTime: '--:--:--',
      currentDate: '',
      calendarYear: new Date().getFullYear(),
      calendarMonth: new Date().getMonth(),
      weather: {
        location: 'Camaligan Proper, Daraga, Albay',
        icon: 'fas fa-cloud',
        temp: '28',
        humidity: '100% Humidity',
        winds: 'SW Winds',
        days: [
          { label: 'Mon', icon: 'fas fa-sun' },
          { label: 'Tue', icon: 'fas fa-cloud-sun' },
          { label: 'Wed', icon: 'fas fa-cloud' },
          { label: 'Thu', icon: 'fas fa-cloud-rain' },
          { label: 'Fri', icon: 'fas fa-sun' }
        ]
      },
      latestNews: [],
      govLinks: [
        { name: 'Office of the President', url: 'https://op.gov.ph' },
        { name: 'Office of the Vice President', url: 'https://ovp.gov.ph' },
        { name: 'Senate of the Philippines', url: 'https://senate.gov.ph' },
        { name: 'House of Representatives', url: 'https://congress.gov.ph' },
        { name: 'Supreme Court', url: 'https://sc.judiciary.gov.ph' },
        { name: 'Court of Appeals', url: '#' },
        { name: 'Sandiganbayan', url: '#' }
      ]
    },
    computed: {
      // Filter ordinances by selected category; used on the main page.
      filteredOrdinanceItems: function () {
        var cat = this.selectedOrdinanceCat;
        if (!this.ordinanceItems || !this.ordinanceItems.length) return [];
        if (!cat) return this.ordinanceItems;
        // If items don't have category yet, just return all.
        return this.ordinanceItems.filter(function (it) {
          return !it.category || it.category === cat;
        });
      },
      calendarLabel: function () {
        var m = this.calendarMonth;
        var names = ['January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'];
        return names[m] + ' ' + this.calendarYear;
      },
      calendarDayLabels: function () {
        return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      },
      calendarDays: function () {
        var y = this.calendarYear;
        var m = this.calendarMonth;
        var first = new Date(y, m, 1);
        var last = new Date(y, m + 1, 0);
        var startDow = first.getDay();
        var daysInMonth = last.getDate();
        var today = new Date();
        var todayY = today.getFullYear();
        var todayM = today.getMonth();
        var todayD = today.getDate();

        var out = [];
        var prevMonth = new Date(y, m, 0);
        var prevDays = prevMonth.getDate();

        for (var i = 0; i < startDow; i++) {
          out.push({
            label: prevDays - startDow + i + 1,
            value: 'prev-' + i,
            other: true,
            today: false
          });
        }
        for (var d = 1; d <= daysInMonth; d++) {
          out.push({
            label: d,
            value: d,
            other: false,
            today: y === todayY && m === todayM && d === todayD
          });
        }
        var remaining = 42 - out.length;
        for (var r = 1; r <= remaining; r++) {
          out.push({
            label: r,
            value: 'next-' + r,
            other: true,
            today: false
          });
        }
        return out.slice(0, 42);
      }
    },
    methods: {
      updateTime: function () {
        var now = new Date();
        var h = now.getHours();
        var m = now.getMinutes();
        var s = now.getSeconds();
        var ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        this.currentTime =
          (h < 10 ? '0' : '') + h + ':' +
          (m < 10 ? '0' : '') + m + ':' +
          (s < 10 ? '0' : '') + s + ' ' + ampm;
        var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        this.currentDate = now.toLocaleDateString('en-PH', options);
      },
      openMap: function () {
        var url = 'https://www.google.com/maps/search/Camaligan,+Camarines+Sur,+Philippines';
        window.open(url, '_blank', 'noopener');
      },
      prevMonth: function () {
        if (this.calendarMonth === 0) {
          this.calendarMonth = 11;
          this.calendarYear--;
        } else {
          this.calendarMonth--;
        }
      },
      nextMonth: function () {
        if (this.calendarMonth === 11) {
          this.calendarMonth = 0;
          this.calendarYear++;
        } else {
          this.calendarMonth++;
        }
      },
      setupNavDropdown: function () {
        document.addEventListener('click', function (e) {
          var trigger = e.target.closest('.nav-dropdown-trigger');
          var dropdown = e.target.closest('.nav-dropdown');
          if (trigger) {
            var menu = trigger.closest('.nav-dropdown');
            if (menu) menu.classList.toggle('is-open');
            return;
          }
          if (!dropdown) {
            document.querySelectorAll('.nav-dropdown.is-open').forEach(function (el) {
              el.classList.remove('is-open');
            });
          }
        });
        document.addEventListener('keydown', function (e) {
          if (e.key === 'Escape') {
            document.querySelectorAll('.nav-dropdown.is-open').forEach(function (el) {
              el.classList.remove('is-open');
            });
          }
        });
      },
      setupSmoothAnchors: function () {
        document.addEventListener('click', function (e) {
          var a = e.target.closest && e.target.closest('a');
          if (!a) return;
          if (a.target && a.target !== '_self') return;
          if (a.hasAttribute('download')) return;
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

          var href = a.getAttribute('href') || '';
          if (!href || href === '#') return;

          var url;
          try {
            url = new URL(href, window.location.href);
          } catch (err) {
            return;
          }

          if (url.origin !== window.location.origin) return;

          // Same-page top link (e.g., Home while already on main page).
          if ((!url.hash || url.hash === '#') && url.pathname === window.location.pathname) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
          }

          if (!url.hash || url.hash === '#') return;
          if (url.pathname !== window.location.pathname) return;

          var id = url.hash.slice(1);
          var target = document.getElementById(id);
          if (!target) return;

          e.preventDefault();
          try {
            window.history.pushState(null, '', url.hash);
          } catch (err2) {
            // ignore
          }
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    },
    mounted: function () {
      document.body.classList.remove('loading');
      document.body.classList.add('app-ready');
      document.body.classList.remove('page-leave');

      // Allow CSS to animate from page-enter -> visible.
      window.requestAnimationFrame(function () {
        document.body.classList.remove('page-enter');
      });
      this.updateTime();
      setInterval(this.updateTime, 1000);
      this.setupNavDropdown();
      this.setupSmoothAnchors();
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}
