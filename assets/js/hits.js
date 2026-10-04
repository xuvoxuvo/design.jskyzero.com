// 保留 busuanzi PV + Shields 徽标，先显示上次成功数据，再更新本次访问量。
(function () {
  'use strict';
  var img = document.getElementById('hits-badge');
  if (!img) return;
  var key = 'hits-pv:' + location.hostname;
  var cooldownKey = key + ':cooldown';
  var cooldownMs = 60000;
  var version = 0;
  function fallback() {
    if (img.style.display !== 'none') return;
    img.src = img.getAttribute('data-fallback');
    img.style.display = '';
    img.title = 'Hits unavailable';
  }

  function show(pv, cached) {
    var current = ++version;
    // 数字已通过校验，本地先绘制同样的蓝色徽标，不再等待第二个外部服务。
    var value = String(pv);
    var rightWidth = Math.max(28, value.length * 7 + 12);
    var width = 33 + rightWidth;
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="20">' +
      '<clipPath id="r"><rect width="' + width + '" height="20" rx="3"/></clipPath>' +
      '<g clip-path="url(#r)"><path fill="#555" d="M0 0h33v20H0z"/>' +
      '<path fill="#007ec6" d="M33 0h' + rightWidth + 'v20H33z"/></g>' +
      '<g fill="#fff" text-anchor="middle" font-family="Verdana,Arial,sans-serif" font-size="11">' +
      '<text x="16.5" y="14">hits</text><text x="' + (33 + rightWidth / 2) + '" y="14">' + value + '</text></g></svg>';
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    img.style.display = '';
    img.alt = 'hits: ' + value;
    img.title = cached ? '上次成功获取的访问量（缓存，非实时）' : '站点访问量';
    var src = 'https://img.shields.io/badge/hits-' + encodeURIComponent(pv) + '-blue';
    function load(retry) {
      var probe = new Image();
      probe.onload = function () {
        if (current !== version) return;
        img.src = probe.src;
        img.style.display = '';
      };
      probe.onerror = function () {
        if (!retry && current === version) {
          setTimeout(function () { load(true); }, 1500);
        } else if (current === version) fallback();
      };
      probe.src = src + (retry ? '?retry=' + Date.now() : '');
    }
    load(false);
  }

  function valid(value) {
    return (typeof value === 'number' || typeof value === 'string') &&
      /^\d+$/.test(String(value));
  }
  try {
    var cached = localStorage.getItem(key);
    if (valid(cached)) show(cached, true);
  } catch (_) { /* Safari 隐私模式可能禁止存储，仍请求实时数据。 */ }

  function failed() {
    try { localStorage.setItem(cooldownKey, String(Date.now() + cooldownMs)); } catch (_) {}
    fallback();
  }

  function request() {
    var callback = 'BusuanziCallback_' + Date.now() + '_' + Math.random().toString(36).slice(2);
    var script = document.createElement('script');
    var settled = false;
    var timer;
    function cleanup() {
      settled = true;
      clearTimeout(timer);
      script.remove();
      // 超时响应可能已经在执行队列中，保留空回调防止 ReferenceError。
      window[callback] = function () {};
      setTimeout(function () { delete window[callback]; }, 60000);
    }
    window[callback] = function (data) {
      if (settled) return;
      if (data && valid(data.site_pv)) {
        var pv = String(data.site_pv);
        try { localStorage.setItem(key, pv); } catch (_) {}
        try { localStorage.removeItem(cooldownKey); } catch (_) {}
        show(pv, false);
      } else failed();
      cleanup();
      fallback();
    };
    script.async = true;
    // 和官方脚本一致，只传 jsonpCallback；站点 PV 由回调中的 site_pv 获取。
    script.src = 'https://busuanzi.ibruce.info/busuanzi?jsonpCallback=' + callback;
    script.referrerPolicy = 'origin';
    script.onerror = function () {
      if (settled) return;
      cleanup();
      failed();
    };
    // 失败或超时都不重发计数请求；502 不能保证上游没有先完成累计。
    timer = setTimeout(function () { cleanup(); failed(); }, 15000);
    document.body.appendChild(script);
  }
  // 同一浏览器在故障期间切换页面时不持续重试；冷却结束后下次访问恢复请求。
  try {
    var until = Number(localStorage.getItem(cooldownKey));
    if (Number.isFinite(until) && until > Date.now() && until <= Date.now() + cooldownMs) {
      fallback();
      return;
    }
  } catch (_) {}
  request();
})();
