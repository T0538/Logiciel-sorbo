(function () {
  var THEME_KEY = 'sorbo-theme';

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      btn.setAttribute('aria-label', theme === 'dark' ? 'Passer au thème clair' : 'Passer au thème sombre');
    }
  }

  function initThemeControls() {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    applyTheme(currentTheme());
    btn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
    });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      if (!localStorage.getItem(THEME_KEY)) applyTheme(e.matches ? 'dark' : 'light');
    });
  }

  initThemeControls();

  function initNavMenu() {
    var nav = document.getElementById('site-nav');
    var btn = document.getElementById('nav-burger');
    var links = document.getElementById('nav-links');
    if (!nav || !btn || !links) return;
    function setOpen(open) {
      nav.classList.toggle('is-nav-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
      document.body.classList.toggle('nav-open', open);
    }
    btn.addEventListener('click', function () {
      setOpen(!nav.classList.contains('is-nav-open'));
    });
    links.querySelectorAll('a[href]').forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1024) setOpen(false);
    });
  }

  initNavMenu();

  function formatCount(n) {
    var r = Math.round(n);
    if (r < 0) return '\u2212' + Math.abs(r);
    return String(r);
  }

  function animateCount(el, target, duration) {
    var startTime = null;
    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }
    function tick(now) {
      if (startTime === null) startTime = now;
      var p = Math.min((now - startTime) / duration, 1);
      var v = target * easeOutCubic(p);
      el.textContent = formatCount(v);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = formatCount(target);
    }
    requestAnimationFrame(tick);
  }

  function initNumberCounters() {
    var bar = document.querySelector('.numbers-bar');
    var nodes = document.querySelectorAll('.js-count');
    if (!bar || !nodes.length) return;
    var done = false;
    /* Même logique de vue que les .reveal : déclenché au défilement (haut ou bas) de la même façon */
    var scrollOpts = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || done) return;
        done = true;
        io.disconnect();
        var duration = 1600;
        nodes.forEach(function (el) {
          var raw = el.getAttribute('data-target');
          var target = raw === null || raw === '' ? 0 : parseInt(raw, 10);
          if (isNaN(target)) return;
          el.textContent = formatCount(0);
          animateCount(el, target, duration);
        });
      });
    }, scrollOpts);
    io.observe(bar);
  }

  initNumberCounters();

  function formatFrInt(n) {
    var r = Math.round(Math.abs(n));
    return String(r).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  function animateStrMetric(el, duration) {
    var raw = el.getAttribute('data-target');
    var target = raw === null || raw === '' ? NaN : parseFloat(raw, 10);
    if (isNaN(target)) return;
    var suffix = el.getAttribute('data-suffix');
    if (suffix === null) suffix = '';
    var fmt = el.getAttribute('data-format');
    var startTime = null;
    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }
    function tick(now) {
      if (startTime === null) startTime = now;
      var p = Math.min((now - startTime) / duration, 1);
      var v = target * easeOutCubic(p);
      if (fmt === 'space') el.textContent = formatFrInt(v);
      else el.textContent = Math.round(v) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else if (fmt === 'space') el.textContent = formatFrInt(target);
      else el.textContent = Math.round(target) + suffix;
    }
    requestAnimationFrame(tick);
  }

  function initStrStructurePanel() {
    var panel = document.getElementById('str-structure-panel');
    if (!panel) return;
    var done = false;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || done) return;
        done = true;
        io.disconnect();
        panel.classList.add('str-panel-done');
        var duration = 1500;
        panel.querySelectorAll('.js-str-metric').forEach(function (el) {
          animateStrMetric(el, duration);
        });
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            panel.querySelectorAll('.js-str-bar').forEach(function (bar) {
              var w = bar.getAttribute('data-width');
              if (w != null && w !== '') bar.style.width = w + '%';
            });
          });
        });
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    io.observe(panel);
  }

  initStrStructurePanel();

  function initHeroSlider() {
    var slides = document.querySelectorAll('.hero-slide');
    var indicators = document.querySelectorAll('.indicator');
    if (!slides.length) return;
    var current = 0;
    var timer = null;
    function show(index) {
      slides.forEach(function (s, i) {
        s.classList.toggle('active', i === index);
        if (indicators[i]) indicators[i].classList.toggle('active', i === index);
      });
      current = index;
    }
    function next() {
      show((current + 1) % slides.length);
    }
    function start() {
      stop();
      timer = setInterval(next, 6000);
    }
    function stop() {
      if (timer) clearInterval(timer);
    }
    indicators.forEach(function (ind) {
      ind.addEventListener('click', function () {
        var idx = parseInt(this.getAttribute('data-index'), 10);
        if (!isNaN(idx)) {
          show(idx);
          start();
        }
      });
    });
    start();
  }

  initHeroSlider();

  function initTabs() {
    var tabs = document.querySelectorAll('.tab-btn');
    if (!tabs.length) return;
    
    tabs.forEach(function(tab) {
      tab.addEventListener('click', function() {
        var targetId = this.getAttribute('data-target');
        if (!targetId) return;
        
        var section = this.closest('.premium-tabs-section');
        section.querySelectorAll('.tab-btn').forEach(function(btn) {
          btn.classList.remove('active');
        });
        section.querySelectorAll('.tab-pane').forEach(function(pane) {
          pane.classList.remove('active');
        });
        
        this.classList.add('active');
        document.getElementById(targetId).classList.add('active');
      });
    });
  }
  
  initTabs();

  function initROICalculator() {
    var slider = document.getElementById('roi-slider');
    if (!slider) return;
    
    var studiesVal = document.getElementById('roi-studies-val');
    var hoursVal = document.getElementById('roi-hours');
    var moneyVal = document.getElementById('roi-money');
    
    // Constants for calculation
    var HOURS_SAVED_PER_STUDY = 12; // 12h saved per study
    var COST_PER_HOUR = 25000; // 25 000 FCFA engineer hourly rate
    
    function formatNumber(num) {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }
    
    function updateROI() {
      var studies = parseInt(slider.value, 10);
      studiesVal.textContent = studies;
      
      var hours = studies * HOURS_SAVED_PER_STUDY;
      var money = hours * COST_PER_HOUR;
      
      hoursVal.innerHTML = formatNumber(hours) + " <span>Heures</span>";
      moneyVal.innerHTML = formatNumber(money) + " <span>FCFA</span>";
    }
    
    slider.addEventListener('input', updateROI);
    updateROI();
  }
  
  initROICalculator();

  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) e.target.classList.add('up');
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { obs.observe(el); });
})();
