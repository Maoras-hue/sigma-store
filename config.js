// config.js - Store Configuration

const CONFIG = {
    // Backend API URL - Your live Render backend
    api_url: 'https://sigma-store-2.onrender.com',
    
    // Store Information
    store_name: 'Sigma Studio',
    store_email: 'hello@sigma.studio',
    
    // Shipping Settings
    free_shipping_threshold: 120,
    shipping_cost: 12,
    
    // Currency
    currency_symbol: '$',
    currency_code: 'USD'
};

// Make config available in browser
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}

// Make config available in Node.js (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}