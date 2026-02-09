const API = "https://fakestoreapi.com";

// Views
const views = {
  home: document.getElementById("view-home"),
  login: document.getElementById("view-login"),
  categories: document.getElementById("view-categories"),
  products: document.getElementById("view-products"),
  cart: document.getElementById("view-cart"),
};

// Nav route buttons
document.querySelectorAll("[data-route]").forEach(btn => {
  btn.addEventListener("click", () => route(btn.dataset.route));
});
document.getElementById("goHome").addEventListener("click", () => route("home"));

// Search
const searchInput = document.getElementById("searchInput");
document.getElementById("searchBtn").addEventListener("click", () => {
  const q = (searchInput.value || "").trim();
  route("products", { query: q, title: q ? `Search: ${q}` : "Products" });
});

// Home grids
const offersGrid = document.getElementById("offersGrid");
const homeGrid = document.getElementById("homeGrid");

// Categories
const categoryGrid = document.getElementById("categoryGrid");

// Products (reference)
const productsGrid = document.getElementById("productsGrid");
const productsTitle = document.getElementById("productsTitle");
const statusEl = document.getElementById("status");

// Reference UI
const crumbCategory = document.getElementById("crumbCategory");
const activeChips = document.getElementById("activeChips");
const sortSelect = document.getElementById("sortSelect");
const sideCategoryList = document.getElementById("sideCategoryList");
const minPriceEl = document.getElementById("minPrice");
const maxPriceEl = document.getElementById("maxPrice");
const applyFiltersBtn = document.getElementById("applyFiltersBtn");
const clearFiltersBtn = document.getElementById("clearFiltersBtn");

// Modal
const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");
const mImg = document.getElementById("mImg");
const mTitle = document.getElementById("mTitle");
const mCategory = document.getElementById("mCategory");
const mDesc = document.getElementById("mDesc");
const mPrice = document.getElementById("mPrice");
const mAdd = document.getElementById("mAdd");
const mLoginHint = document.getElementById("mLoginHint");
let activeProduct = null;

closeModal.addEventListener("click", () => modal.classList.add("hidden"));
modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.add("hidden"); });

// Cart UI
const cartCount = document.getElementById("cartCount");
const cartList = document.getElementById("cartList");
const savedList = document.getElementById("savedList");
const subtotalEl = document.getElementById("subtotal");
const itemCountEl = document.getElementById("itemCount");
document.getElementById("clearCartBtn").addEventListener("click", clearCart);
document.getElementById("checkoutBtn").addEventListener("click", () => {
  if (!isLoggedIn()) return alert("Please login to checkout.");
  alert("Checkout demo ✅ (No payment gateway)");
});

// Login
const loginNavBtn = document.getElementById("loginNavBtn");
const heroLoginBtn = document.getElementById("heroLoginBtn");
const loginForm = document.getElementById("loginForm");
const logoutBtn = document.getElementById("logoutBtn");
const loginStatus = document.getElementById("loginStatus");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const pass = document.getElementById("password").value.trim();
  if (!email || !pass) return;

  localStorage.setItem("bluelock_user", JSON.stringify({ email }));
  syncAuthUI();
  alert("Login successful ✅");
  route("home");
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("bluelock_user");
  syncAuthUI();
  alert("Logged out ✅");
});

// Storage keys
const CART_KEY = "bluelock_cart_v1";
const SAVED_KEY = "bluelock_saved_v1";

// Data cache
let ALL_PRODUCTS = [];
let ALL_CATEGORIES = [];

// Current state for products view
let currentCategory = null;
let currentQuery = null;

// Helpers
const INR = (usd) => `₹${Math.round(usd * 80)}`;

function isLoggedIn() {
  return !!localStorage.getItem("bluelock_user");
}

function syncAuthUI() {
  const logged = isLoggedIn();
  loginNavBtn.textContent = logged ? "Account" : "Login";
  if (heroLoginBtn) heroLoginBtn.style.display = logged ? "none" : "inline-flex";

  const u = JSON.parse(localStorage.getItem("bluelock_user") || "null");
  loginStatus.textContent = logged ? `Logged in as: ${u.email}` : "Not logged in";
}

function read(key) {
  return JSON.parse(localStorage.getItem(key) || "[]");
}
function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Routing
function route(name, params = {}) {
  Object.values(views).forEach(v => v.classList.add("hidden"));
  views[name].classList.remove("hidden");

  if (name === "home") renderHome();
  if (name === "categories") renderCategories();
  if (name === "products") renderProducts(params);
  if (name === "cart") renderCart();
  if (name === "login") syncAuthUI();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// API
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("API error");
  return res.json();
}

async function init() {
  syncAuthUI();
  updateCartCount();

  try {
    const [cats, prods] = await Promise.all([
      fetchJSON(`${API}/products/categories`),
      fetchJSON(`${API}/products`)
    ]);
    ALL_CATEGORIES = cats;
    ALL_PRODUCTS = prods;

    renderSideCategories();
    wireProductControls();
    route("home");
  } catch (e) {
    alert("Failed to load FakeStore API. Check internet.");
  }
}

/* UI builders  */

function homeCard(p) {
  const div = document.createElement("div");
  div.className = "card";
  div.innerHTML = `
    <img class="thumb" src="${p.image}" alt="${p.title}">
    <div class="title">${p.title}</div>
    <div class="priceRow">
      <div class="price">${INR(p.price)}</div>
      <button class="primary">Add</button>
    </div>
  `;

  div.onclick = (e) => {
    if (e.target.tagName.toLowerCase() === "button") return;
    openProductModal(p);
  };

  div.querySelector("button").onclick = (e) => {
    e.stopPropagation();
    guardedAddToCart(p);
  };

  return div;
}

function productCardRef(p) {
  const div = document.createElement("div");
  div.className = "pCard";
  div.innerHTML = `
    <div class="pTopRow">
      <span class="pBadge">NEW</span>
      <span class="muted">♡</span>
    </div>
    <img class="pImg" src="${p.image}" alt="${p.title}">
    <div class="pTitle">${p.title}</div>
    <div class="pBottom">
      <div class="price">${INR(p.price)}</div>
      <button class="pCartBtn" title="Add to cart">🛒</button>
    </div>
  `;

  div.onclick = (e) => {
    if (e.target.closest(".pCartBtn")) return;
    openProductModal(p);
  };

  div.querySelector(".pCartBtn").onclick = (e) => {
    e.stopPropagation();
    guardedAddToCart(p);
  };

  return div;
}

function openProductModal(p) {
  activeProduct = p;
  mImg.src = p.image;
  mTitle.textContent = p.title;
  mCategory.textContent = `Category: ${p.category}`;
  mDesc.textContent = p.description;
  mPrice.textContent = INR(p.price);

  const logged = isLoggedIn();
  mLoginHint.textContent = logged ? "" : "Login required to add this product to cart.";
  mAdd.textContent = logged ? "Add to Cart" : "Login to Add";

  modal.classList.remove("hidden");
}

mAdd.addEventListener("click", () => {
  if (!activeProduct) return;
  if (!isLoggedIn()) return route("login");
  addToCart(activeProduct);
  modal.classList.add("hidden");
});

/* Home  */
function renderHome() {
  offersGrid.innerHTML = "";
  homeGrid.innerHTML = "";

  ALL_PRODUCTS.slice(0, 4).forEach(p => offersGrid.appendChild(homeCard(p)));
  ALL_PRODUCTS.slice(4, 12).forEach(p => homeGrid.appendChild(homeCard(p)));
}

/* Categories */
function renderCategories() {
  categoryGrid.innerHTML = "";
  ALL_CATEGORIES.forEach(cat => {
    const div = document.createElement("div");
    div.className = "cat";
    div.innerHTML = `
      <b>${cat}</b>
      <div class="muted">Browse products in this category</div>
      <div class="pill mt8">View Products →</div>
    `;
    div.addEventListener("click", () => route("products", { category: cat, title: `Category: ${cat}` }));
    categoryGrid.appendChild(div);
  });
}

/*  Products (reference layout) */

function renderSideCategories() {
  if (!sideCategoryList) return;
  sideCategoryList.innerHTML = "";

  const mk = (label, catValue) => {
    const item = document.createElement("div");
    item.className = "sideItem";
    item.textContent = label;
    item.onclick = () => route("products", { category: catValue, title: catValue ? `Category: ${catValue}` : "Products" });
    return item;
  };

  sideCategoryList.appendChild(mk("All", null));
  ALL_CATEGORIES.forEach(cat => sideCategoryList.appendChild(mk(cat, cat)));
}

function wireProductControls() {
  if (!sortSelect) return;

  sortSelect.addEventListener("change", () => {
    // re-render with same filters
    renderProducts({ category: currentCategory, query: currentQuery, title: currentCategory ? `Category: ${currentCategory}` : (currentQuery ? `Search: ${currentQuery}` : "Products") });
  });

  applyFiltersBtn.addEventListener("click", () => {
    renderProducts({ category: currentCategory, query: currentQuery, title: currentCategory ? `Category: ${currentCategory}` : (currentQuery ? `Search: ${currentQuery}` : "Products") });
  });

  clearFiltersBtn.addEventListener("click", () => {
    minPriceEl.value = "";
    maxPriceEl.value = "";
    sortSelect.value = "popular";
    renderProducts({ category: currentCategory, query: currentQuery, title: currentCategory ? `Category: ${currentCategory}` : (currentQuery ? `Search: ${currentQuery}` : "Products") });
  });
}

function renderProducts({ category, query, title }) {
  currentCategory = category || null;
  currentQuery = query || null;

  statusEl.textContent = "Loading products...";
  productsTitle.textContent = title || "Products";

  // breadcrumb
  if (crumbCategory) crumbCategory.textContent = category || "All";

  // chips
  if (activeChips) {
    activeChips.innerHTML = "";
    if (category) activeChips.innerHTML += `<span class="chip">${category}</span>`;
    if (query) activeChips.innerHTML += `<span class="chip">Search: ${query}</span>`;
    const minV = minPriceEl?.value;
    const maxV = maxPriceEl?.value;
    if (minV) activeChips.innerHTML += `<span class="chip">Min: ${minV}</span>`;
    if (maxV) activeChips.innerHTML += `<span class="chip">Max: ${maxV}</span>`;
  }

  // highlighting active category in sidebar
  if (sideCategoryList) {
    [...sideCategoryList.querySelectorAll(".sideItem")].forEach(el => {
      const isAll = (el.textContent === "All" && !category);
      const isCat = (el.textContent === category);
      el.classList.toggle("active", isAll || isCat);
    });
  }

  let list = [...ALL_PRODUCTS];

  if (category) list = list.filter(p => p.category === category);
  if (query) {
    const q = query.toLowerCase();
    list = list.filter(p => p.title.toLowerCase().includes(q));
  }

  // price filter
  const minP = parseFloat(minPriceEl?.value || "");
  const maxP = parseFloat(maxPriceEl?.value || "");
  if (!Number.isNaN(minP)) list = list.filter(p => p.price >= minP);
  if (!Number.isNaN(maxP)) list = list.filter(p => p.price <= maxP);

  // sorting
  const sort = sortSelect?.value || "popular";
  if (sort === "priceLow") list.sort((a,b) => a.price - b.price);
  if (sort === "priceHigh") list.sort((a,b) => b.price - a.price);
  if (sort === "name") list.sort((a,b) => a.title.localeCompare(b.title));

  productsGrid.innerHTML = "";
  if (list.length === 0) {
    statusEl.textContent = "No products found.";
    return;
  }

  list.forEach(p => productsGrid.appendChild(productCardRef(p)));
  statusEl.textContent = "";
}

/* Cart */

function updateCartCount() {
  const cart = read(CART_KEY);
  const count = cart.reduce((sum, i) => sum + i.qty, 0);
  cartCount.textContent = count;
}

function guardedAddToCart(product) {
  if (!isLoggedIn()) {
    alert("Please login to add items to cart.");
    route("login");
    return;
  }
  addToCart(product);
}

function addToCart(product) {
  const cart = read(CART_KEY);
  const found = cart.find(i => i.id === product.id);
  if (found) found.qty += 1;
  else cart.push({ id: product.id, title: product.title, price: product.price, image: product.image, qty: 1 });

  write(CART_KEY, cart);
  updateCartCount();
  alert("Added to cart ✅");
}

function clearCart() {
  write(CART_KEY, []);
  renderCart();
  updateCartCount();
}

function renderCart() {
  const cart = read(CART_KEY);
  const saved = read(SAVED_KEY);

  cartList.innerHTML = "";
  savedList.innerHTML = "";

  if (cart.length === 0) {
    cartList.innerHTML = `<div class="muted">Your cart is empty.</div>`;
  } else {
    cart.forEach(item => cartList.appendChild(cartItemRow(item, "cart")));
  }

  if (saved.length === 0) {
    savedList.innerHTML = `<div class="muted">No items saved for later.</div>`;
  } else {
    saved.forEach(item => savedList.appendChild(cartItemRow(item, "saved")));
  }

  const subtotal = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
  const items = cart.reduce((sum, i) => sum + i.qty, 0);

  subtotalEl.textContent = INR(subtotal);
  itemCountEl.textContent = String(items);

  updateCartCount();
}

function cartItemRow(item, listType) {
  const row = document.createElement("div");
  row.className = "cartItem";
  row.innerHTML = `
    <img src="${item.image}" alt="${item.title}">
    <div>
      <div class="title">${item.title}</div>
      <div class="muted">${INR(item.price)} each</div>
    </div>
    <div class="actions">
      <div class="qty">
        <button data-dec="${item.id}">−</button>
        <b>${item.qty}</b>
        <button data-inc="${item.id}">+</button>
      </div>
      <button class="linkBtn" data-toggle="${item.id}">
        ${listType === "cart" ? "Save for later" : "Move to cart"}
      </button>
      <button class="linkBtn danger" data-remove="${item.id}">Remove</button>
    </div>
  `;

  row.querySelector(`[data-inc="${item.id}"]`).onclick = () => changeQty(item.id, +1, listType);
  row.querySelector(`[data-dec="${item.id}"]`).onclick = () => changeQty(item.id, -1, listType);
  row.querySelector(`[data-remove="${item.id}"]`).onclick = () => removeItem(item.id, listType);
  row.querySelector(`[data-toggle="${item.id}"]`).onclick = () => toggleSaved(item.id, listType);

  return row;
}

function changeQty(id, delta, listType) {
  const key = listType === "cart" ? CART_KEY : SAVED_KEY;
  const list = read(key);
  const item = list.find(i => i.id === id);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    write(key, list.filter(i => i.id !== id));
  } else {
    write(key, list);
  }
  renderCart();
}

function removeItem(id, listType) {
  const key = listType === "cart" ? CART_KEY : SAVED_KEY;
  write(key, read(key).filter(i => i.id !== id));
  renderCart();
}

function toggleSaved(id, listType) {
  const fromKey = listType === "cart" ? CART_KEY : SAVED_KEY;
  const toKey = listType === "cart" ? SAVED_KEY : CART_KEY;

  const from = read(fromKey);
  const to = read(toKey);

  const item = from.find(i => i.id === id);
  if (!item) return;

  write(fromKey, from.filter(i => i.id !== id));
  to.push(item);
  write(toKey, to);

  renderCart();
}

init();
