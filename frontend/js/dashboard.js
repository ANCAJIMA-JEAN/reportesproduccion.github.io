/* Dashboard principal: semana, indicadores, reportes faltantes y cartillas por área. */
const Dashboard = {
  sel: null, area: '', data: null,
  async render() {
    $('#view').innerHTML = '<p class="muted pad">Cargando…</p>';
    try { this.data = await api('dashboard', this.sel || {}); }
    catch (e) { if (e.code === 'AUTH') return Auth.showLogin(e.message); $('#view').innerHTML = `<p class="err pad">${esc(e.message)}</p>`; return; }
    this.paint();
  },
  paint() {
    const d = this.data, k = d.kpis;
    if (!d.semana) { $('#view').innerHTML = '<section class="empty"><h2>Aún no hay reportes</h2><p>Registra el primer reporte semanal para ver el resumen aquí.</p></section>'; return; }
    const w = d.semana, val = w.anio + '-' + w.semana;
    const opts = d.semanasDisponibles.map(s => `<option value="${s.anio}-${s.semana}" ${s.anio + '-' + s.semana === val ? 'selected' : ''}>Semana ${s.semana} · ${s.anio}</option>`).join('');
    const areaOpts = '<option value="">Todas las áreas</option>' + d.cartillas.map(c => `<option value="${c.areaId}" ${c.areaId === this.area ? 'selected' : ''}>${esc(c.nombre)}</option>`).join('');
    const kp = [['Áreas', k.areas], ['Reportes recibidos', k.recibidos, 'ok'], ['Pendientes de entrega', k.faltantes, k.faltantes ? 'bad' : ''],
      ['Total de pendientes', k.total, '', `${k.pendiente} sin iniciar`], ['Vencidos', k.vencido, k.vencido ? 'bad' : ''],
      ['En proceso', k.enProceso, 'warn'], ['Cerrados', k.cerrado, 'ok'], ['Apoyos pendientes', k.apoyosPendientes, k.apoyosPendientes ? 'info' : '']];
    const falta = d.faltantes.length
      ? `<div class="alerta"><strong>⚠️ Reportes pendientes</strong><ul>${d.faltantes.map(f => `<li>${esc(f.nombre)}</li>`).join('')}</ul></div>`
      : '<div class="alerta okbox">🟢 Todas las áreas entregaron su reporte de esta semana.</div>';
    const cards = d.cartillas.filter(c => !this.area || c.areaId === this.area).map(c => `
      <article class="area ${c.recibido ? 'rec' : 'falta'}" data-id="${c.areaId}" tabindex="0">
        <h3>${esc(c.nombre)}</h3><p class="resp">${esc(c.responsable)}</p>
        <p class="estado">${c.recibido ? '🟢 Reportado' : '🔴 Pendiente de entrega'}</p>
        <p class="sem">${c.ultimaSemana ? 'Última semana reportada: ' + c.ultimaSemana.semana : 'Sin reportes registrados'}</p>
        <dl><div><dt>Avances</dt><dd>${c.avances}</dd></div><div><dt>Alertas</dt><dd>${c.alertas}</dd></div>
        <div><dt>Pendientes</dt><dd>${c.pendientes}</dd></div><div class="${c.vencidos ? 'bad' : ''}"><dt>Vencidos</dt><dd>${c.vencidos}</dd></div>
        <div><dt>Apoyo requerido</dt><dd>${c.apoyos}</dd></div></dl>
        <a class="btn" href="#area/${c.areaId}">VER SEGUIMIENTO</a>
      </article>`).join('');
    $('#view').innerHTML = `
      <section class="semana">
        <div><p class="muted">Semana en revisión</p><h2>SEMANA ${w.semana}</h2>
          <p class="prog">${k.recibidos} de ${k.areas} reportes recibidos</p></div>
        <div class="filtros"><label>Semana<select id="fSem">${opts}</select></label>
          <label>Área<select id="fArea">${areaOpts}</select></label></div>
      </section>
      <section class="kpis">${kp.map(([t, v, c, s]) => `<div class="kpi ${c || ''}"><b>${v}</b><span>${t}</span>${s ? `<small>${s}</small>` : ''}</div>`).join('')}</section>
      ${falta}<section class="areas">${cards}</section>`;
    $('#fSem').onchange = e => { const [a, s] = e.target.value.split('-'); this.sel = { anio: +a, semana: +s }; this.render(); };
    $('#fArea').onchange = e => { this.area = e.target.value; this.paint(); };
    document.querySelectorAll('.area').forEach(el => {
      el.onclick = () => location.hash = 'area/' + el.dataset.id;
      el.onkeydown = e => { if (e.key === 'Enter') el.onclick(); };
    });
  }
};
