// --- File: js/components/logout.js ---
export function render() {
    // Clear tokens and redirect to login
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.hash = '/login';
  }
  
  