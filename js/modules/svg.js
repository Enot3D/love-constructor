/* ============================================================
   МОДУЛЬ: SVG-ЭЛЕМЕНТЫ
   Загрузка SVG-файлов как декоративных элементов.
   ============================================================ */
const SvgModule = {
  init() {
    const dz = document.querySelector('#svgDropzone');
    const fi = document.querySelector('#svgInput');

    if (dz) {
      dz.addEventListener('click', () => fi && fi.click());
      dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('dragover'); });
      dz.addEventListener('dragleave', () => dz.classList.remove('dragover'));
      dz.addEventListener('drop', e => {
        e.preventDefault(); dz.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) this._load(file);
      });
    }
    if (fi) {
      fi.addEventListener('change', () => {
        if (fi.files[0]) this._load(fi.files[0]);
      });
    }
  },

  _load(file) {
    const reader = new FileReader();
    reader.onload = e => {
      AppState.svgItems.push({
        id: uid(),
        dataUrl: e.target.result,
        color: '#e91e63',
        size: 60,
        rotation: 0,
        x: 50,
        y: 50
      });
      setState('svgItems', [...AppState.svgItems]);
      this._renderList();
    };
    reader.readAsDataURL(file);
  },

  _renderList() {
    const list = document.querySelector('#svgList');
    if (!list) return;
    list.innerHTML = AppState.svgItems.map((s, i) => `
      <div class="svg-item">
        <img src="${s.dataUrl}" alt="SVG ${i + 1}">
        <span style="flex:1;font-size:12px;">SVG #${i + 1}</span>
        <button class="btn-remove" data-idx="${i}">×</button>
      </div>
    `).join('');

    list.querySelectorAll('.btn-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.idx);
        AppState.svgItems.splice(idx, 1);
        setState('svgItems', [...AppState.svgItems]);
        this._renderList();
      });
    });
  }
};
