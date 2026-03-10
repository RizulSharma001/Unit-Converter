// Conversion factors
const LENGTH_TO_M = { mm:0.001, cm:0.01, m:1, km:1000, in:0.0254, ft:0.3048, yd:0.9144, mi:1609.344 };
const WEIGHT_TO_G = { mg:0.001, g:1, kg:1000, oz:28.3495, lb:453.592 };

const UNIT_LABELS = {
  mm:'mm', cm:'cm', m:'m', km:'km', in:'in', ft:'ft', yd:'yd', mi:'mi',
  mg:'mg', g:'g', kg:'kg', oz:'oz', lb:'lb',
  C:'°C', F:'°F', K:'K'
};

function fmt(n) {
  if (Math.abs(n) >= 1e9 || (Math.abs(n) < 1e-4 && n !== 0)) return n.toExponential(4);
  const s = parseFloat(n.toPrecision(8));
  return s.toLocaleString('en-US', { maximumFractionDigits: 6 });
}

function convertLength(val, from, to) {
  return val * LENGTH_TO_M[from] / LENGTH_TO_M[to];
}

function convertWeight(val, from, to) {
  return val * WEIGHT_TO_G[from] / WEIGHT_TO_G[to];
}

function convertTemperature(val, from, to) {
  if (from === to) return val;
  let c;
  if (from === 'C') c = val;
  else if (from === 'F') c = (val - 32) * 5/9;
  else if (from === 'K') c = val - 273.15;

  if (to === 'C') return c;
  if (to === 'F') return c * 9/5 + 32;
  if (to === 'K') return c + 273.15;
}

window.convert = function(type) {
  const valInput = document.getElementById(`${type}-value`);
  const fromSel = document.getElementById(`${type}-from`);
  const toSel = document.getElementById(`${type}-to`);
  const resultBox = document.getElementById(`${type}-result`);
  const resultVal = document.getElementById(`${type}-result-value`);
  const resultSub = document.getElementById(`${type}-result-sub`);
  const errMsg = document.getElementById(`${type}-error`);

  const raw = valInput.value.trim();
  const val = parseFloat(raw);

  errMsg.classList.remove('visible');
  resultBox.classList.remove('visible');

  if (raw === '' || isNaN(val)) {
    errMsg.classList.add('visible');
    return;
  }

  let result;
  if (type === 'length') result = convertLength(val, fromSel.value, toSel.value);
  else if (type === 'weight') result = convertWeight(val, fromSel.value, toSel.value);
  else result = convertTemperature(val, fromSel.value, toSel.value);

  const fromLabel = UNIT_LABELS[fromSel.value];
  const toLabel = UNIT_LABELS[toSel.value];
  const fmtVal = fmt(val);
  const fmtRes = fmt(result);

  resultVal.innerHTML = `<span class="accent">${fmtVal} ${fromLabel}</span> = ${fmtRes} ${toLabel}`;
  resultSub.textContent = `${type.charAt(0).toUpperCase()+type.slice(1)} conversion`;
  resultBox.classList.add('visible');
  resultBox._rawResult = `${fmtVal} ${fromLabel} = ${fmtRes} ${toLabel}`;
};

window.swapUnits = function(type) {
  const from = document.getElementById(`${type}-from`);
  const to = document.getElementById(`${type}-to`);
  [from.value, to.value] = [to.value, from.value];
};

window.reset = function(type) {
  document.getElementById(`${type}-value`).value = '';
  document.getElementById(`${type}-result`).classList.remove('visible');
  document.getElementById(`${type}-error`).classList.remove('visible');
};

window.copyResult = function(type) {
  const box = document.getElementById(`${type}-result`);
  const text = box._rawResult || '';
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    const btn = box.querySelector('.action-btn');
    const orig = btn.textContent;
    btn.textContent = '✓ Copied!';
    setTimeout(() => btn.textContent = orig, 1500);
  });
};

window.switchTab = function(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.panel').forEach(p => p.classList.toggle('active', p.id === `panel-${tab}`));
};

document.querySelectorAll('input[type="number"]').forEach(inp => {
  const type = inp.id.split('-')[0];
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') window.convert(type); });
});