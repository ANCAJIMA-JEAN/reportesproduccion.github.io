/* Login con Google Identity Services. El rol lo decide siempre el backend. */
const Auth = {
  token: () => sessionStorage.getItem('tk'),
  init() {
    google.accounts.id.initialize({
      client_id: APP_CONFIG.GOOGLE_CLIENT_ID, auto_select: false,
      callback: r => { sessionStorage.setItem('tk', r.credential); App.start(); }
    });
    this.token() ? App.start() : this.showLogin();
  },
  showLogin(msg) {
    $('#app').classList.add('hidden'); $('#login').classList.remove('hidden');
    $('#loginMsg').textContent = msg || '';
    $('#gbtn').innerHTML = '';
    google.accounts.id.renderButton($('#gbtn'), { theme: 'outline', size: 'large', locale: 'es' });
  },
  logout() {
    sessionStorage.removeItem('tk'); google.accounts.id.disableAutoSelect();
    location.hash = ''; this.showLogin();
  }
};
