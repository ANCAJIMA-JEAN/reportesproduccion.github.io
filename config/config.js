/* Configuración central del frontend. Aquí NO van claves secretas. */
window.APP_CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfycbweIRKx1nLKnEV-uJ3qXaNMJXRKl2g6-L2koSmkGp7lLs0UxO6gsDT08x05hBiwXUjr/exec',
  GOOGLE_CLIENT_ID: '289103466110-9ghlcj0om9fbbe8s2cbl4vr6o9k5s5g3.apps.googleusercontent.com',
  TITULO: 'SEGUIMIENTO DE REPORTES - SUBGERENCIA DE PRODUCCIÓN',
  ESTADOS: { Pendiente: '🔵', 'En proceso': '🟡', Vencido: '🔴', Cerrado: '🟢' },
  ROLES: { ADMIN: 'ADMINISTRADOR', SUB: 'SUBGERENCIA', RESP: 'RESPONSABLE' },
  // fase = etapa del plan en que se habilita la sección
  NAV: [
    { id: 'inicio', t: 'INICIO' }, { id: 'reportes', t: 'REPORTES', fase: 6 },
    { id: 'areas', t: 'ÁREAS', fase: 5 }, { id: 'pendientes', t: 'PENDIENTES', fase: 7 },
    { id: 'buscador', t: 'BUSCADOR', fase: 9 }, { id: 'historial', t: 'HISTORIAL', fase: 5 },
    { id: 'administracion', t: 'ADMINISTRACIÓN', fase: 10, soloAdmin: true }
  ]
};
