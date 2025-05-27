import { renderLogin, renderRegister } from './components/auth.js';
import { render as rProfile }      from './components/profile.js';
import { render as rAppointments } from './components/appointments.js';
import { render as rOrders }       from './components/orders.js';

const routes = {
'/login':        { fn: renderLogin,    title: 'Đăng nhập'    },
'/register':     { fn: renderRegister, title: 'Đăng ký'      },
'/profile':      { fn: rProfile,       title: 'Trang cá nhân' },
'/appointments': { fn: rAppointments,  title: 'Lịch hẹn'      },
'/orders':       { fn: rOrders,        title: 'Đơn hàng'      },
'/logout':       { fn: handleLogout,   title: 'Đăng xuất'    }
};

function handleLogout() {
localStorage.removeItem('accessToken');
window.location.hash = '/login';
}

function setActiveLink(path) {
document.querySelectorAll('nav a').forEach(a => {
const linkPath = a.getAttribute('href').slice(1);
a.classList.toggle('active', linkPath === path);
});
}

function router() {
const path = location.hash.slice(1) || '/login';
const route = routes[path];
const loggedIn = !!localStorage.getItem('accessToken');
document.body.classList.toggle('logged-in', loggedIn);
setActiveLink(path);
document.title = route ? `Người dùng – ${route.title}` : 'Người dùng';
const app = document.getElementById('app'); app.innerHTML = '';
if (route) route.fn(); else app.innerHTML = 'Trang không tồn tại.';
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);