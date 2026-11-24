/* Calcutta AI Lab — small, dependency-free enhancements. The page works without this file. */
(function () {
  'use strict';

  var WHATSAPP = '919831810983';
  // Optional: paste a Google Apps Script / Zapier / Make webhook URL here to also log
  // form requests somewhere you can see them. Left empty, nothing leaves the browser
  // except the WhatsApp hand-off.
  var LEAD_WEBHOOK_URL = '';

  /* Reveal on scroll */
  var items = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el, i) {
      var sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.transitionDelay = Math.min(sib, 4) * 80 + 'ms';
      io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Live "open now" badge, computed in Kolkata time */
  var status = document.querySelector('[data-open-status]');
  if (status) {
    try {
      var parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kolkata', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false
      }).formatToParts(new Date()).reduce(function (a, p) { a[p.type] = p.value; return a; }, {});
      var mins = parseInt(parts.hour, 10) * 60 + parseInt(parts.minute, 10);
      var open = parts.weekday !== 'Sun' && mins >= 600 && mins < 1080;
      var text = status.querySelector('.status__text');
      if (open) {
        status.classList.add('is-open');
        text.textContent = 'Open now · until 6 PM';
      } else {
        var next = parts.weekday === 'Sat' && mins >= 1080 ? 'Monday' : (mins < 600 && parts.weekday !== 'Sun' ? 'today' : (parts.weekday === 'Sun' ? 'Monday' : 'tomorrow'));
        text.textContent = 'Closed now · opens 10 AM ' + next;
      }
    } catch (_) { /* keep the static hours */ }
  }

  /* Visit form → WhatsApp with the message ready to send */
  var form = document.getElementById('visit-form');
  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var name = (form.elements.name.value || '').trim();
      var biz = (form.elements.business.value || '').trim();
      var jobs = Array.prototype.slice.call(form.querySelectorAll('input[name="job[]"]:checked')).map(function (i) { return i.value; });

      var msg = 'Hi Calcutta AI Lab, ';
      msg += name ? "I'm " + name + (biz ? ' (' + biz + ')' : '') + '. ' : (biz ? 'I run ' + biz + '. ' : '');
      msg += "I'd like a free 30-minute visit";
      msg += jobs.length ? ' about: ' + jobs.join(', ') + '.' : '.';

      if (LEAD_WEBHOOK_URL) {
        try {
          var body = JSON.stringify({ name: name, business: biz, jobs: jobs, page: location.href, at: new Date().toISOString() });
          if (navigator.sendBeacon) navigator.sendBeacon(LEAD_WEBHOOK_URL, new Blob([body], { type: 'text/plain' }));
        } catch (_) { /* never block the hand-off */ }
      }

      var url = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(msg);
      // window.open with 'noopener' always returns null, so detach the opener by hand
      // and only fall back to same-tab navigation when a popup blocker stops us.
      var win = window.open(url, '_blank');
      if (win) { try { win.opener = null; } catch (_) {} } else { window.location.href = url; }
    });
  }
})();
