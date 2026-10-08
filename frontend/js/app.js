/* Arranque, navegación y rutas por hash (#inicio, #area/AR007...). */
const App = {
  me: null,
  async start() {
    try { this.me = await api('me'); }
    catch (e) { sessionStorage.removeItem('tk'); return Auth.showLogin(e.message); }
    $('#login').classList.add('hidden'); $('#app').classList.remove('hidden');
    $('#userName').textContent = this.me.usuario.nombre + ' · ' + this.me.usuario.rol.toLowerCase();
    const admin = this.me.usuario.rol === APP_CONFIG.ROLES.ADMIN;
    $('#nav').innerHTML = APP_CONFIG.NAV.filter(n => !n.soloAdmin || admin)
      .map(n => `<a href="#${n.id}" data-id="${n.id}">${n.t}</a>`).join('');
    window.onhashchange = () => this.route();
    this.route();
  },
  route() {
    const [id] = (location.hash.slice(1) || 'inicio').split('/');
    const vista = id === 'area' ? 'areas' : id;
    document.querySelectorAll('#nav a').forEach(a => a.classList.toggle('on', a.dataset.id === vista));
    if (id === 'inicio') return Dashboard.render();
    const n = APP_CONFIG.NAV.find(x => x.id === vista);
    $('#view').innerHTML = `<section class="empty"><h2>${esc(n ? n.t : 'Sección')}</h2>
      <p>Esta sección se habilita en la Fase ${n ? n.fase : 5} del desarrollo.</p>
      <p><a href="#inicio">Volver al inicio</a></p></section>`;
  }
};
$('#appTitle').textContent = $('#loginTitle').textContent = APP_CONFIG.TITULO;
$('#logout').onclick = () => Auth.logout();
$('#searchForm').onsubmit = e => { e.preventDefault(); const q = $('#q').value.trim(); if (q) location.hash = 'buscador/' + encodeURIComponent(q); };
