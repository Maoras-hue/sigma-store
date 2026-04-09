const API_URL = 'http://localhost:3000';

async function updateAuthLink() {
    try {
        const response = await fetch(`${API_URL}/api/me`, {
            credentials: 'include'
        });
        const authLink = document.getElementById('authLink');
        if (authLink) {
            if (response.ok) {
                authLink.innerHTML = ' logout';
                authLink.onclick = async (e) => {
                    e.preventDefault();
                    await fetch(`${API_URL}/api/logout`, {
                        method: 'POST',
                        credentials: 'include'
                    });
                    localStorage.removeItem('sigma_user');
                    window.location.href = 'index.html';
                };
            } else {
                authLink.innerHTML = ' login';
                authLink.href = 'login.html';
                authLink.onclick = null;
            }
        }
    } catch(e) {
        console.log('Error:', e);
    }
}

updateAuthLink();