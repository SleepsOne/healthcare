import { render as rLogin }    from './components/login.js';
import { render as rRegister } from './components/register.js';
import { render as rA }        from './components/appointments.js';
import { render as rD }        from './components/doctors.js';
import { render as rP }        from './components/patients.js';
import { render as rM }        from './components/medications.js';
import { render as rOI }       from './components/order-items.js';
import { render as rO }        from './components/orders.js';
import { render as rPR }       from './components/prescriptions.js';
import { render as rU }        from './components/users.js';

const routes = {
  '/login':       rLogin,
  '/register':    rRegister,
  '/appointments': rA,
  '/doctors':      rD,
  '/patients':     rP,
  '/medications':  rM,
  '/order-items':  rOI,
  '/orders':       rO,
  '/prescriptions':rPR,
  '/users':        rU,
};

function router() {
  const path = location.hash.slice(1) || '/login';
  const fn = routes[path];
  document.getElementById('app').innerHTML = '';
  if (fn) fn();
  else document.getElementById('app').innerHTML = '<h2>Not Found</h2>';
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
