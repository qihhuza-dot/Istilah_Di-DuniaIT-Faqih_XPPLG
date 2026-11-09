(() => {
  const daftar = document.getElementById('istilah');
  const grup = [...document.querySelectorAll('.letter-group')];
  const kartu = [...document.querySelectorAll('.term')];
  const linkHuruf = [...document.querySelectorAll('.alphabet a')];

  if (!daftar || !kartu.length) return;

  // ---------- Data kartu ----------
  const data = kartu.map((el) => ({
    el,
    teks: (el.querySelector('h3').textContent + ' ' + el.querySelector('p').textContent).toLowerCase(),
    kategori: el.querySelector('.tag').textContent.trim(),
  }));

  const kategoriUnik = ['Semua', ...new Set(data.map((d) => d.kategori))];

  // ---------- Buat toolbar (pencarian + filter) ----------
  const toolbar = document.createElement('div');
  toolbar.className = 'toolbar';
  toolbar.innerHTML = `
    <label class="search">
      <span class="visually-hidden">Cari istilah</span>
      <input type="search" id="cari" placeholder="Cari istilah… (tekan / untuk fokus)" autocomplete="off">
    </label>
    <div class="chips" role="group" aria-label="Filter kategori"></div>
    <p class="result-info" id="info" aria-live="polite"></p>
  `;
  daftar.prepend(toolbar);

  const input = toolbar.querySelector('#cari');
  const chips = toolbar.querySelector('.chips');
  const info = toolbar.querySelector('#info');

  kategoriUnik.forEach((nama, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (i === 0 ? ' active' : '');
    b.textContent = nama;
    b.setAttribute('aria-pressed', i === 0);
    b.addEventListener('click', () => {
      kategoriAktif = nama;
      chips.querySelectorAll('.chip').forEach((c) => {
        const aktif = c === b;
        c.classList.toggle('active', aktif);
        c.setAttribute('aria-pressed', aktif);
      });
      terapkanFilter();
    });
    chips.appendChild(b);
  });

  // Pesan jika tidak ada hasil
  const kosong = document.createElement('p');
  kosong.className = 'empty';
  kosong.hidden = true;
  kosong.textContent = 'Istilah tidak ditemukan. Coba kata kunci lain.';
  daftar.appendChild(kosong);

  // ---------- Filter ----------
  let kategoriAktif = 'Semua';

  function terapkanFilter() {
    const q = input.value.trim().toLowerCase();
    let jumlah = 0;

    data.forEach((d) => {
      const cocok =
        (kategoriAktif === 'Semua' || d.kategori === kategoriAktif) &&
        (q === '' || d.teks.includes(q));
      d.el.hidden = !cocok;
      if (cocok) jumlah++;
    });

    grup.forEach((g) => {
      const adaIsi = g.querySelector('.term:not([hidden])') !== null;
      g.hidden = !adaIsi;
      const link = document.querySelector(`.alphabet a[href="#${g.id}"]`);
      if (link) {
        link.classList.toggle('disabled', !adaIsi);
        link.setAttribute('aria-disabled', !adaIsi);
        link.tabIndex = adaIsi ? 0 : -1;
      }
    });

    kosong.hidden = jumlah !== 0;
    info.textContent =
      q === '' && kategoriAktif === 'Semua'
        ? `${data.length} istilah`
        : `${jumlah} dari ${data.length} istilah ditemukan`;
  }

  input.addEventListener('input', terapkanFilter);
  terapkanFilter();

  // Huruf yang kosong tidak bisa diklik
  linkHuruf.forEach((a) =>
    a.addEventListener('click', (e) => {
      if (a.classList.contains('disabled')) e.preventDefault();
    })
  );

  // ---------- Pintasan keyboard ----------
  document.addEventListener('keydown', (e) => {
    const sedangMengetik = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);
    if (e.key === '/' && !sedangMengetik) {
      e.preventDefault();
      input.focus();
    }
    if (e.key === 'Escape' && document.activeElement === input) {
      input.value = '';
      terapkanFilter();
      input.blur();
    }
  });

  // ---------- Huruf aktif saat scroll ----------
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          linkHuruf.forEach((a) =>
            a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id)
          );
        });
      },
      { rootMargin: '-30% 0px -60% 0px' }
    );
    grup.forEach((g) => observer.observe(g));
  }
})();
