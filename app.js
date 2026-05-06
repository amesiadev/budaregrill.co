/* ════════════════════════════════════════
   BUDARE GRILL — APP DE PEDIDOS v2.1
   Módulos: menú / carrito / UI / WhatsApp
   Corrección: checkout paso 2 siempre avanza si hay nombre + pago
════════════════════════════════════════ */

const MENU = [
  { id:'pc', cat:'top', name:'Personal Completo', price:32000, desc:'Res al barril + chorizo artesanal. El plato estrella de Budare.', img:'🥩', badges:['hot','star'] },
  { id:'p2', cat:'top', name:'Parrilla para 2', price:58000, desc:'Res + cerdo + 2 chorizos. Guarnición doble incluida.', img:'🥩', badges:['hot'] },
  { id:'lp', cat:'top', name:'La Patrona', price:32000, desc:'Res · Cheddar · Tocino caramelizado · Salsa Budare.', img:'🍔', badges:['star'] },
  { id:'br', cat:'top', name:'Las Braseras', price:27000, desc:'Papas cargadas con proteína al carbón + mozzarella fundida.', img:'🍟', badges:['new'] },
  { id:'bas', cat:'parrilla', name:'El Básico del Barril', price:25000, desc:'Res o cerdo al barril. Papa nevada + yuca + ají.', img:'🔥', badges:[] },
  { id:'pc2', cat:'parrilla', name:'Personal Completo', price:32000, desc:'Res 220g + chorizo artesanal + papa + yuca + guacamole + arepa.', img:'🥩', badges:['hot','star'] },
  { id:'cl', cat:'parrilla', name:'La Completa Llanera', price:42000, desc:'Res + cerdo + chorizo artesanal. Tres proteínas, un barril.', img:'🍖', badges:['new'] },
  { id:'pol', cat:'parrilla', name:'Pollo a la Llanera', price:28000, desc:'Muslo marinado en chimichurri. Jugoso por dentro, tostado por fuera.', img:'🍗', badges:[] },
  { id:'p22', cat:'parrilla', name:'Parrilla para 2', price:58000, desc:'~400g surtido + 2 chorizos artesanales. Guarnición doble.', img:'🥩', badges:['hot'] },
  { id:'p2p', cat:'parrilla', name:'Parrilla para 2 Premium', price:72000, desc:'Res + cerdo + pollo + chorizo + morcilla.', img:'🔥', badges:[] },
  { id:'fc', cat:'parrilla', name:'Familiar Clásica (4 pax)', price:110000, desc:'700g res + 200g cerdo + 3 chorizos + papa + yuca.', img:'👨‍👩‍👧‍👦', badges:[] },
  { id:'fco', cat:'parrilla', name:'Familiar Completa (4 pax)', price:140000, desc:'700g res + cerdo + 2 chorizos + 2 morcillas + costillas.', img:'🏆', badges:['star'] },
  { id:'fm', cat:'parrilla', name:'Familiar Mixta (4 pax)', price:130000, desc:'500g res + 300g cerdo + 200g pollo + 2 chorizos.', img:'🍖', badges:[] },
  { id:'eje', cat:'parrilla', name:'Ejecutivo Budare', price:22000, desc:'90g carne + sopa + arroz + ensalada + papa/yuca.', img:'🍱', badges:['star'] },
  { id:'pat', cat:'burger', name:'La Patrona', price:32000, desc:'Res 150g · Cheddar · Tocino caramelizado · Salsa Budare.', img:'🍔', badges:['hot','star'] },
  { id:'mes', cat:'burger', name:'La Mestiza', price:31000, desc:'Res 100g + Chorizo artesanal 100g · Mozzarella · Pesto.', img:'⚡', badges:['new'] },
  { id:'bra', cat:'burger', name:'Las Braseras', price:27000, desc:'Papas + proteína al carbón + tocino + mozzarella.', img:'🍟', badges:['new'] },
  { id:'lim', cat:'bebidas', name:'Limonada Natural', price:5000, desc:'Limón · agua · panela. 350ml.', img:'🍋', badges:[] },
  { id:'jug', cat:'bebidas', name:'Jugo Natural', price:5500, desc:'Maracuyá · lulo · naranja. 350ml.', img:'🍊', badges:[] },
  { id:'gas', cat:'bebidas', name:'Gaseosa', price:4000, desc:'Coca-Cola · Sprite · Colombiana. 350ml.', img:'🥤', badges:[] },
  { id:'agu', cat:'bebidas', name:'Agua', price:3000, desc:'Sin gas o con gas. 600ml.', img:'💧', badges:[] }
];

/* ─── IMAGE GENERATION ──────────────── */
function createDummyImage(emoji) {
  const bgColors = { '🥩':'1a0900', '🍔':'1a0900', '🍟':'1a0900', '🔥':'1a0900', '🍖':'1a0900', '🍗':'1a0900', '👨‍👩‍👧‍👦':'1a0900', '🏆':'1a0900', '🍱':'1a0900', '⚡':'1a0900', '🍋':'0a1200', '🍊':'0a0800', '🥤':'000a14', '💧':'000a14' };
  const bg = bgColors[emoji] || '1a0900';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="%23${bg}"/><text x="100" y="115" font-size="80" text-anchor="middle" dominant-baseline="middle">${emoji}</text></svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

/* ─── CART STATE ────────────────────── */
let cart = {};
let cartStep = 1;

function saveCart() {
  try { localStorage.setItem('budare_cart', JSON.stringify(cart)); } catch(e) {}
}
function loadCart() {
  try {
    const saved = localStorage.getItem('budare_cart');
    if (saved) { const parsed = JSON.parse(saved); Object.keys(parsed).forEach(id => { if (!MENU.find(p => p.id === id)) delete parsed[id]; }); cart = parsed; }
    else cart = {};
  } catch(e) { cart = {}; }
}

function getProduct(id) { return MENU.find(p => p.id === id); }
function cartTotal() { return Object.entries(cart).reduce((sum, [id, qty]) => { const p = getProduct(id); return sum + (p ? p.price * qty : 0); }, 0); }
function cartCount() { return Object.values(cart).reduce((s, q) => s + q, 0); }

/* ─── ORDER NUMBERING ───────────────── */
function getNextOrderNumber() {
  const last = parseInt(localStorage.getItem('budare_order_number') || '99', 10);
  const next = last + 1;
  localStorage.setItem('budare_order_number', next);
  return next;
}

/* ─── TABLE FROM URL ────────────────── */
function getTableFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('mesa') || '';
}

/* ─── ADD / UPDATE CART ────────────── */
function addToCart(id) {
  if (!getProduct(id)) return;
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  updateUI(id);
  showToast('✅ Producto añadido');
  updateCartBar();
  pulseCartBadge();
}
function changeQty(id, delta) {
  if (!getProduct(id)) return;
  const newQty = (cart[id] || 0) + delta;
  if (newQty <= 0) delete cart[id]; else cart[id] = newQty;
  saveCart();
  updateUI(id);
  updateCartBar();
  if (document.getElementById('cart-panel').classList.contains('open')) renderCartBody();
}

/* ─── TOAST ─────────────────────────── */
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg || '✓ Agregado al pedido';
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
}

/* ─── CART BADGE PULSE ─────────────── */
function pulseCartBadge() {
  const badge = document.getElementById('cartCount');
  badge.classList.remove('pulse');
  void badge.offsetWidth;
  badge.classList.add('pulse');
}

/* ─── RENDER: single product control ── */
function updateUI(id) {
  const qty = cart[id] || 0;
  document.querySelectorAll(`[data-pid="${id}"]`).forEach(el => {
    el.innerHTML = qty === 0
      ? `<button class="add-btn" onclick="addToCart('${id}')">+</button>`
      : `<div class="qty-ctrl">
          <button class="qty-btn" onclick="changeQty('${id}',-1)">${qty===1?'🗑':'−'}</button>
          <span class="qty-num">${qty}</span>
          <button class="qty-btn" onclick="changeQty('${id}',1)">+</button>
        </div>`;
  });
}

function badgeHTML(badges) {
  const map = { hot:'<span class="badge b-hot">🔥 Más vendido</span>', star:'<span class="badge b-star">⭐ Recomendado</span>', new:'<span class="badge b-new">Nuevo</span>' };
  return badges.map(b => map[b] || '').filter(Boolean).join('');
}

function fmtPrice(p) { return '$' + p.toLocaleString('es-CO'); }

function ctrlHTML(id) {
  const qty = cart[id] || 0;
  return qty === 0
    ? `<button class="add-btn" onclick="addToCart('${id}')">+</button>`
    : `<div class="qty-ctrl">
        <button class="qty-btn" onclick="changeQty('${id}',-1)">${qty===1?'🗑':'−'}</button>
        <span class="qty-num">${qty}</span>
        <button class="qty-btn" onclick="changeQty('${id}',1)">+</button>
      </div>`;
}

function renderMenu() {
  const topItems = MENU.filter(p => p.cat === 'top');
  document.getElementById('strip-top').innerHTML = topItems.map(p => `
    <div class="pcard-feat">
      <img class="pcard-feat-img" src="${createDummyImage(p.img)}" alt="${p.name}" loading="lazy">
      <div class="pcard-feat-body">
        <div class="pcard-badges">${badgeHTML(p.badges)}</div>
        <p class="pcard-feat-name">${p.name}</p>
        <p class="pcard-feat-desc">${p.desc}</p>
        <div class="pcard-feat-foot">
          <span class="pcard-feat-price">${fmtPrice(p.price)}</span>
          <div data-pid="${p.id}">${ctrlHTML(p.id)}</div>
        </div>
      </div>
    </div>`).join('');

  [['parrilla','grid-parrilla'],['burger','grid-burger'],['bebidas','grid-bebidas']]
    .forEach(([cat, gridId]) => {
      document.getElementById(gridId).innerHTML = MENU.filter(p => p.cat === cat).map(p => `
        <div class="pcard">
          <img class="pcard-img" src="${createDummyImage(p.img)}" alt="${p.name}" loading="lazy">
          <div class="pcard-body">
            ${p.badges.length ? `<div class="pcard-badges">${badgeHTML(p.badges)}</div>` : ''}
            <p class="pcard-name">${p.name}</p>
            <p class="pcard-desc">${p.desc}</p>
            <div class="pcard-footer">
              <span class="pcard-price">${fmtPrice(p.price)}</span>
              <div data-pid="${p.id}">${ctrlHTML(p.id)}</div>
            </div>
          </div>
        </div>`).join('');
    });
}

function updateCartBar() {
  const count = cartCount();
  document.getElementById('cartCount').textContent = count;
  document.getElementById('cartBarTotal').textContent = fmtPrice(cartTotal());
  document.getElementById('cart-bar').classList.toggle('empty', count === 0);
}

function openCart() {
  if (cartCount() === 0) { showToast('🛒 Agrega productos primero'); return; }
  renderCartBody();
  document.getElementById('cart-panel').classList.add('open');
  document.getElementById('cart-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  document.getElementById('cart-panel').classList.remove('open');
  document.getElementById('cart-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

function renderCartBody() {
  const entries = Object.entries(cart);
  if (entries.length === 0) {
    document.getElementById('cartBody').innerHTML = `<div class="cart-empty"><div class="cart-empty-icon">🛒</div><p class="cart-empty-text">Tu carrito está vacío.<br>Agrega productos del menú.</p></div>`;
    return;
  }
  document.getElementById('cartBody').innerHTML = entries.map(([id, qty]) => {
    const p = getProduct(id); if (!p) return '';
    return `<div class="cart-item">
      <img class="ci-img" src="${createDummyImage(p.img)}" alt="${p.name}">
      <div class="ci-info"><p class="ci-name">${p.name}</p><p class="ci-price">${fmtPrice(p.price * qty)}</p></div>
      <div class="ci-ctrl">
        <button class="ci-btn minus" onclick="changeQty('${id}',-1)">${qty===1?'🗑':'−'}</button>
        <span class="ci-qty">${qty}</span>
        <button class="ci-btn plus" onclick="changeQty('${id}',1)">+</button>
      </div>
    </div>`;
  }).join('') + `
    <div class="cart-total-row">
      <span class="cart-total-label">Total del pedido</span>
      <span class="cart-total-val">${fmtPrice(cartTotal())}</span>
    </div>
    <button class="checkout-btn" onclick="openCheckout()">Confirmar pedido →</button>
    <button class="clear-btn" onclick="clearCart()">Vaciar carrito</button>`;
}

function clearCart() {
  if (!confirm('¿Vaciar carrito?')) return;
  cart = {}; saveCart(); updateCartBar(); renderCartBody();
  document.querySelectorAll('[data-pid]').forEach(el => { el.innerHTML = `<button class="add-btn" onclick="addToCart('${el.getAttribute("data-pid")}')">+</button>`; });
  showToast('🗑 Carrito vaciado');
}

/* ─── CHECKOUT PANEL (2 steps) ──────── */
let selectedPay = 'Efectivo';

function selectPay(method) {
  selectedPay = method;
  document.getElementById('payEfectivo').classList.toggle('selected', method==='Efectivo');
  document.getElementById('payTransfer').classList.toggle('selected', method==='Transferencia');
  document.getElementById('payNequi').classList.toggle('selected', method==='Nequi / Daviplata');
  document.getElementById('errPay').classList.remove('show');
}

function openCheckout() {
  closeCart();
  cartStep = 1;
  selectedPay = 'Efectivo'; // reinicio seguro
  document.getElementById('payEfectivo').classList.add('selected');
  document.getElementById('payTransfer').classList.remove('selected');
  document.getElementById('payNequi').classList.remove('selected');

  const tableFromURL = getTableFromURL();
  const tableField = document.getElementById('fieldTable');
  const hintTable = document.getElementById('hintTable');
  if (tableFromURL) {
    tableField.value = tableFromURL;
    hintTable.textContent = 'Mesa detectada de la URL';
    hintTable.classList.add('show');
  } else {
    tableField.value = '';
    hintTable.classList.remove('show');
  }
  resetCheckoutUI();
  renderCheckoutSummary();
  document.getElementById('checkout-panel').classList.add('open');
  document.getElementById('checkout-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCheckout() {
  document.getElementById('checkout-panel').classList.remove('open');
  document.getElementById('checkout-overlay').classList.remove('open');
  document.body.style.overflow = '';
  cartStep = 1;
  resetCheckoutUI();
}

function resetCheckoutUI() {
  document.getElementById('stepDot1').className = 'step active';
  document.getElementById('stepDot2').className = 'step';
  document.getElementById('stepLine').className = 'step-line';
  document.getElementById('stepLabel1').className = 'step-label active';
  document.getElementById('stepLabel2').className = 'step-label';
  document.getElementById('checkoutStep1').style.display = 'block';
  document.getElementById('checkoutStep2').style.display = 'none';
  document.getElementById('checkoutBackBtn').style.visibility = 'hidden';
  document.getElementById('checkoutTitle').textContent = 'Confirmar Pedido';
  document.getElementById('errName').classList.remove('show');
  document.getElementById('errPay').classList.remove('show');
  document.getElementById('fieldName').classList.remove('error');
}

function checkoutGoStep2() {
  const name = document.getElementById('fieldName').value.trim();
  let valid = true;

  if (!name) {
    document.getElementById('errName').classList.add('show');
    document.getElementById('fieldName').classList.add('error');
    valid = false;
  } else {
    document.getElementById('errName').classList.remove('show');
    document.getElementById('fieldName').classList.remove('error');
  }

  if (!selectedPay) {
    document.getElementById('errPay').classList.add('show');
    valid = false;
  } else {
    document.getElementById('errPay').classList.remove('show');
  }

  if (!valid) return;

  cartStep = 2;
  document.getElementById('checkoutStep1').style.display = 'none';
  document.getElementById('checkoutStep2').style.display = 'block';
  document.getElementById('checkoutBackBtn').style.visibility = 'visible';
  document.getElementById('checkoutTitle').textContent = 'Confirma tu pedido';
  document.getElementById('stepDot1').className = 'step done';
  document.getElementById('stepDot2').className = 'step active';
  document.getElementById('stepLine').className = 'step-line done';
  document.getElementById('stepLabel1').className = 'step-label done';
  document.getElementById('stepLabel2').className = 'step-label active';
  renderCheckoutSummary();
}

function checkoutGoBack() {
  cartStep = 1;
  document.getElementById('checkoutStep1').style.display = 'block';
  document.getElementById('checkoutStep2').style.display = 'none';
  document.getElementById('checkoutBackBtn').style.visibility = 'hidden';
  document.getElementById('checkoutTitle').textContent = 'Confirmar Pedido';
  document.getElementById('stepDot1').className = 'step active';
  document.getElementById('stepDot2').className = 'step';
  document.getElementById('stepLine').className = 'step-line';
  document.getElementById('stepLabel1').className = 'step-label active';
  document.getElementById('stepLabel2').className = 'step-label';
}

function renderCheckoutSummary() {
  document.getElementById('checkoutSummary').innerHTML = `
    <p class="order-summary-title">🧾 Resumen del pedido</p>
    ${Object.entries(cart).map(([id, qty]) => {
      const p = getProduct(id); if (!p) return '';
      return `<div class="os-item"><span class="os-item-name">${p.name}</span><span class="os-item-qty">×${qty}</span><span class="os-item-price">${fmtPrice(p.price * qty)}</span></div>`;
    }).join('')}
    <div class="os-total"><span class="os-total-label">Total</span><span class="os-total-val">${fmtPrice(cartTotal())}</span></div>`;
}

/* ─── SEND ORDER → WHATSAPP ─────────── */
function sendOrder() {
  const name    = document.getElementById('fieldName').value.trim();
  const table   = document.getElementById('fieldTable').value.trim();
  const notes   = document.getElementById('fieldNotes').value.trim();

  if (!name) {
    document.getElementById('errName').classList.add('show');
    document.getElementById('fieldName').classList.add('error');
    checkoutGoBack();
    return;
  }
  if (cartCount() === 0) { showToast('❌ Agrega productos al carrito'); return; }

  const lines = Object.entries(cart).map(([id, qty]) => {
    const p = getProduct(id);
    return p ? `- ${p.name} ×${qty} — ${fmtPrice(p.price * qty)}` : '';
  }).filter(Boolean).join('\n');

  if (!lines) { showToast('❌ Error al procesar el pedido'); return; }

  const orderNumber = getNextOrderNumber();
  const now = new Date();
  const timeStr = now.toLocaleTimeString('es-CO', { hour:'2-digit', minute:'2-digit', hour12:true });

  const msg =
    `🧾 *PEDIDO #${orderNumber}*\n` +
    (table ? `📍 *Mesa: ${table}*\n\n` : `📍 *Mesa: No especificada*\n\n`) +
    `👤 *Nombre:* ${name}\n` +
    `💳 *Pago:* ${selectedPay}\n\n` +
    `🍔 *Pedido:*\n${lines}\n\n` +
    `💰 *Total: ${fmtPrice(cartTotal())}*\n\n` +
    `🕒 *Hora:* ${timeStr}` +
    (notes ? `\n\n📝 *Notas:* ${notes}` : '');

  // ⚠️ CAMBIAR POR NÚMERO REAL
  const WA_NUMBER = '573215290456';
  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');

  cart = {}; saveCart();
  closeCheckout();
  updateCartBar();
  document.querySelectorAll('[data-pid]').forEach(el => {
    el.innerHTML = `<button class="add-btn" onclick="addToCart('${el.getAttribute("data-pid")}')">+</button>`;
  });
  document.getElementById('fieldName').value = '';
  document.getElementById('fieldTable').value = '';
  document.getElementById('fieldNotes').value = '';
  cartStep = 1; resetCheckoutUI();
  showToast('✅ ¡Pedido #' + orderNumber + ' enviado!');
}

/* ─── CATEGORY TABS ─────────────────── */
function initTabs() {
  const tabs = document.querySelectorAll('.cat-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const sec = document.getElementById(`sec-${tab.dataset.cat}`);
      if (sec) sec.scrollIntoView({behavior:'smooth', block:'start'});
    });
  });
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        tabs.forEach(t => t.classList.toggle('active', t.dataset.cat === e.target.dataset.cat));
        const at = document.querySelector(`.cat-tab[data-cat="${e.target.dataset.cat}"]`);
        if (at) at.scrollIntoView({behavior:'smooth', block:'nearest', inline:'center'});
      }
    });
  }, {threshold:0.35, rootMargin:'-100px 0px -55% 0px'});
  document.querySelectorAll('section[data-cat]').forEach(s => obs.observe(s));
}

/* ─── INIT ──────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  loadCart();
  renderMenu();
  updateCartBar();
  initTabs();

  const tableFromURL = getTableFromURL();
  if (tableFromURL) {
    document.getElementById('fieldTable').value = tableFromURL;
  }
});
