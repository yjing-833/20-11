(function () {
  'use strict';

  var data = window.NOI_DUNG_THIEP || {};
  var byId = function (id) { return document.getElementById(id); };

  var envelope = byId('envelope');
  var letter = byId('letter');
  var button = byId('open-btn');
  var reduceMotion = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : { matches: false };

  function clean(value) {
    return typeof value === 'string' ? value.trim() : '';
  }

  function setText(id, value) {
    var text = clean(value);
    if (text) byId(id).textContent = text;
  }

  /* ---------- Đổ nội dung từ content.js ---------- */
  function render() {
    var name = clean(data.tenNguoiNhan) || 'em';
    var title = 'Gửi ' + name;
    byId('cover-title').textContent = title;
    document.title = title + ', ngày 20/11';

    setText('cover-date', data.ngay);
    setText('letter-date', data.ngayTrongThu);
    setText('letter-closing', data.loiKet);
    setText('letter-name', data.chuKy);

    var message = clean(data.loiChuc).replace(/\r\n?/g, '\n');
    if (message) {
      var body = byId('letter-body');
      body.textContent = '';
      message.split(/\n\s*\n/).forEach(function (paragraph) {
        var p = document.createElement('p');
        paragraph.split('\n').forEach(function (line, i) {
          if (i > 0) p.appendChild(document.createElement('br'));
          p.appendChild(document.createTextNode(line.trim()));
        });
        body.appendChild(p);
      });
    }

    // Ảnh kỷ niệm: chỉ hiện khung khi ảnh tải được.
    var src = clean(data.anhKyNiem);
    if (src) {
      var frame = byId('letter-photo');
      var img = new Image();
      img.alt = clean(data.moTaAnh) || 'Ảnh kỷ niệm';
      img.decoding = 'async';
      img.onload = function () {
        frame.appendChild(img);
        frame.hidden = false;
        measure();
      };
      img.onerror = function () { frame.hidden = true; };
      img.src = src;
    }
  }

  /* ---------- Tính phần thư nhô lên khỏi phong bì ---------- */
  function measure() {
    var lift = parseFloat(getComputedStyle(envelope).getPropertyValue('--lift')) || 0;
    var rise = Math.max(0, letter.offsetHeight - envelope.offsetHeight + lift);
    envelope.style.setProperty('--rise', Math.ceil(rise) + 'px');
  }

  /* ---------- Mở thư ---------- */
  function openLetter() {
    if (envelope.classList.contains('is-open')) return;
    measure();
    envelope.classList.add('is-open');
    button.setAttribute('aria-expanded', 'true');

    // Chuyển tiêu điểm vào lá thư để người dùng bàn phím/trình đọc màn hình đọc tiếp.
    try { letter.focus({ preventScroll: true }); } catch (e) { letter.focus(); }
    button.hidden = true;

    var wait = reduceMotion.matches ? 0 : 420;
    window.setTimeout(function () {
      var top = letter.getBoundingClientRect().top;
      if (top < 0 || top > window.innerHeight * 0.5) {
        letter.scrollIntoView({ block: 'start', behavior: wait ? 'smooth' : 'auto' });
      }
    }, wait);
  }

  render();
  measure();

  if ('ResizeObserver' in window) {
    new ResizeObserver(measure).observe(letter);
  }
  window.addEventListener('resize', measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

  button.addEventListener('click', openLetter);
  button.hidden = false;
})();
