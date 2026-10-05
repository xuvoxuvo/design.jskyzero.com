// 仅实时计数和徽标图片均加载成功时显示；失败/超时隐藏，不重试计数。
(function () {
  'use strict';
  var img = document.getElementById('hits-badge');
  if (!img) return;

  function hide() {
    img.style.display = 'none';
    img.onload = img.onerror = null;
    img.removeAttribute('src');
  }
  hide();
  var callback = 'BusuanziCallback_' + Date.now() + '_' + Math.random().toString(36).slice(2);
  var script = document.createElement('script');
  var settled = false;
  var timer;
  function cleanup() {
    settled = true;
    clearTimeout(timer);
    script.remove();
    // 避免已进入执行队列的迟到 JSONP 响应重新显示徽标。
    window[callback] = function () {};
    setTimeout(function () { delete window[callback]; }, 60000);
  }
  window[callback] = function (data) {
    if (settled) return;
    cleanup();
    var pv = data && data.site_pv;
    if ((typeof pv !== 'number' && typeof pv !== 'string') || !/^\d+$/.test(String(pv))) {
      hide();
      return;
    }
    var imageTimer = setTimeout(hide, 8000);
    img.onload = function () {
      clearTimeout(imageTimer);
      img.onload = img.onerror = null;
      img.style.display = '';
    };
    img.onerror = function () { clearTimeout(imageTimer); hide(); };
    img.alt = 'hits: ' + pv;
    img.title = '站点访问量';
    img.src = 'https://img.shields.io/badge/hits-' + encodeURIComponent(pv) + '-blue';
  };
  script.async = true;
  script.referrerPolicy = 'origin';
  script.src = 'https://busuanzi.ibruce.info/busuanzi?jsonpCallback=' + callback;
  script.onerror = function () {
    if (settled) return;
    cleanup();
    hide();
  };
  timer = setTimeout(function () { cleanup(); hide(); }, 15000);
  document.body.appendChild(script);
})();
