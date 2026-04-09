// script.js - Main frontend code
let products = [];
let currentFilter = 'all';
let searchTerm = '';
let currentSort = 'default';

const BACKEND_URL = 'http://127.0.0.1:3000';

async function loadProducts() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/products`);
        if (!response.ok) throw new Error('Failed');
        products = await response.json();
        renderProducts();
        renderRecentlyViewed();
    } catch (error) {
        document.getElementById('productsGrid').innerHTML = 
            '<p style="text-align:center; padding:40px;"> Backend not running. Open terminal and run: node server.js</p>';
    }
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.innerText = message;
    toast.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#111;color:white;padding:8px 16px;border-radius:30px;z-index:999;font-size:0.85rem;';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

function getCart() {
    return JSON.parse(localStorage.getItem('sigma_cart') || '[]');
}

function saveCart(cart) {
    localStorage.setItem('sigma_cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const cart = getCart();
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cartCount');
    if (badge) badge.innerText = total;
}

function addToCart(id, name, price) {
    const cart = getCart();
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }
    saveCart(cart);
    showToast(` ${name} added to cart`);
}

function getWishlist() {
    const saved = localStorage.getItem('sigma_wishlist');
    return saved ? JSON.parse(saved) : [];
}

function saveWishlist(wishlist) {
    localStorage.setItem('sigma_wishlist', JSON.stringify(wishlist));
}

function toggleWishlist(productId) {
    let wishlist = getWishlist();
    if (wishlist.includes(productId)) {
        wishlist = wishlist.filter(id => id !== productId);
        showToast(' Removed from wishlist');
    } else {
        wishlist.push(productId);
        showToast(' Added to wishlist');
    }
    saveWishlist(wishlist);
    renderProducts();
}

function isInWishlist(productId) {
    return getWishlist().includes(productId);
}

function getRecentlyViewed() {
    return JSON.parse(localStorage.getItem('sigma_recently_viewed') || '[]');
}

function addToRecentlyViewed(id) {
    let recent = getRecentlyViewed();
    recent = recent.filter(i => i !== id);
    recent.unshift(id);
    if (recent.length > 5) recent.pop();
    localStorage.setItem('sigma_recently_viewed', JSON.stringify(recent));
    renderRecentlyViewed();
}

function renderRecentlyViewed() {
    const container = document.getElementById('recentlyViewed');
    if (!container) return;
    
    const recentIds = getRecentlyViewed();
    if (recentIds.length === 0 || products.length === 0) {
        container.innerHTML = '<p style="color:#888;">no recent views</p>';
        return;
    }
    
    const recentProducts = products.filter(p => recentIds.includes(p.id));
    container.innerHTML = recentProducts.map(p => `
        <div style="display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px solid #eee;">
            <img src="${BACKEND_URL}/uploads/${p.image}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;">
            <div style="flex:1">
                <div style="font-size:0.85rem;">${p.name}</div>
                <div style="font-size:0.8rem;color:#e05a2a;">$${p.price}</div>
            </div>
            <button onclick="addToCart('${p.id}','${p.name}',${p.price})" style="background:#111;color:white;border:none;padding:4px 10px;border-radius:20px;cursor:pointer;">buy</button>
        </div>
    `).join('');
}

function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    if (products.length === 0) {
        grid.innerHTML = '<p style="text-align:center;padding:40px;">Loading...</p>';
        return;
    }
    
    let filtered = [...products];
    if (currentFilter !== 'all') filtered = filtered.filter(p => p.category === currentFilter);
    if (searchTerm.trim()) filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (currentSort === 'priceLow') filtered.sort((a,b) => a.price - b.price);
    if (currentSort === 'priceHigh') filtered.sort((a,b) => b.price - a.price);
    
    if (filtered.length === 0) {
        grid.innerHTML = '<p style="text-align:center;padding:40px;">nothing found</p>';
        return;
    }
    
    grid.innerHTML = filtered.map(p => {
        const heartColor = isInWishlist(p.id) ? '#e05a2a' : '#ccc';
        return `
            <div class="product-card">
                <div style="position:relative;">
                    <img src="${BACKEND_URL}/uploads/${p.image}" class="product-image" onclick="addToRecentlyViewed('${p.id}')">
                    <button onclick="toggleWishlist('${p.id}')" style="position:absolute;top:10px;right:10px;background:white;border:none;border-radius:50%;width:32px;height:32px;cursor:pointer;font-size:1.2rem;">
                        <span style="color:${heartColor};">♥</span>
                    </button>
                </div>
                <div class="product-info">
                    <div class="product-title">${p.name}</div>
                    <div class="product-price">$${p.price}</div>
                    <button class="add-btn" onclick="addToCart('${p.id}','${p.name}',${p.price})">add to cart</button>
                </div>
            </div>
        `;
    }).join('');
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchTerm = e.target.value;
            renderProducts();
        });
    }
    
    const clearBtn = document.getElementById('clearSearch');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            document.getElementById('searchInput').value = '';
            searchTerm = '';
            renderProducts();
        });
    }
    
    const sortSelect = document.getElementById('sortBy');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            renderProducts();
        });
    }
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderProducts();
        });
    });
    
    const darkToggle = document.getElementById('darkToggle');
    if (darkToggle) {
        darkToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark');
            darkToggle.innerText = document.body.classList.contains('dark') ? '☀️' : '🌙';
            localStorage.setItem('sigma_dark', document.body.classList.contains('dark'));
        });
        if (localStorage.getItem('sigma_dark') === 'true') {
            document.body.classList.add('dark');
            darkToggle.innerText = '☀️';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    updateCartCount();
    loadProducts();
});