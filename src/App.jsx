import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, AlertTriangle, Clock, Flag, Leaf, Droplets, FlaskConical, Sprout, Bug, Search, ArrowLeft, FileDown, LifeBuoy } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts'

const API = import.meta.env.VITE_API_URL
const AREAS = [
  ['SANIDAD', Leaf], ['RIEGO', Droplets], ['I+D', FlaskConical],
  ['PRODUCCIÓN OLMOS 1', Sprout], ['PRODUCCIÓN OLMOS 2', Sprout], ['PRODUCCIÓN OLMOS 3', Sprout], ['APICULTURA', Bug],
]
const PRIO = { alta: 'bg-red-100 text-red-700', media: 'bg-yellow-100 text-yellow-800', baja: 'bg-green-100 text-green-700' }
const cerrado = p => /cerrad|complet|hecho/i.test(p.estado)
const tot = r => ({ av: r.avances.length, al: r.alertas.length, pe: r.pendientes.length })

export default function App() {
  const [data, setData] = useState([]), [loading, setLoading] = useState(true), [err, setErr] = useState('')
  const [area, setArea] = useState(null), [sel, setSel] = useState(null)
  const [f, setF] = useState({ q: '', semana: '', resp: '', estado: '', anio: '' })

  useEffect(() => {
    const load = () => fetch(API).then(r => r.json()).then(d => { setData(d); setErr('') }).catch(e => setErr(String(e))).finally(() => setLoading(false))
    load(); const t = setInterval(load, 60000); return () => clearInterval(t)   // refresco automático cada 60 s
  }, [])

  const filtered = useMemo(() => data.filter(r =>
    (!area || r.area === area) &&
    (!f.semana || r.semana === +f.semana) && (!f.anio || r.anio === +f.anio) &&
    (!f.resp || r.responsable === f.resp) &&
    (!f.estado || r.pendientes.some(p => p.estado === f.estado)) &&
    (!f.q || JSON.stringify(r).toLowerCase().includes(f.q.toLowerCase()))
  ).sort((a, b) => b.anio - a.anio || b.semana - a.semana), [data, area, f])

  const uniq = k => [...new Set(data.map(r => r[k]))].filter(Boolean).sort()
  const estados = [...new Set(data.flatMap(r => r.pendientes.map(p => p.estado)))]
  const sum = k => filtered.reduce((s, r) => s + tot(r)[k], 0)

  const semanas = [...new Set(filtered.map(r => r.semana))].sort((a, b) => a - b)
  const tendencia = semanas.map(s => {
    const rs = filtered.filter(r => r.semana === s)
    return { semana: 'S' + s, Avances: rs.reduce((a, r) => a + tot(r).av, 0), Alertas: rs.reduce((a, r) => a + tot(r).al, 0), Pendientes: rs.reduce((a, r) => a + tot(r).pe, 0) }
  })
  const porArea = AREAS.map(([n]) => {
    const rs = filtered.filter(r => r.area === n)
    const pe = rs.flatMap(r => r.pendientes)
    return { area: n.replace('PRODUCCIÓN ', 'PROD. '), Reportes: rs.length, Pendientes: pe.length, cierre: pe.length ? Math.round(pe.filter(cerrado).length / pe.length * 100) : 0 }
  })
  const ranking = [...porArea].filter(a => a.Reportes).sort((a, b) => a.Pendientes - b.Pendientes)

  if (loading) return <p className="p-10 text-center">Cargando reportes…</p>

  return (
    <div className="min-h-screen">
      <header className="bg-verde text-white px-4 py-6 shadow">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold tracking-wide">SUB GERENCIA DE PRODUCCIÓN</h1>
          <p className="text-verdeclaro text-sm">Sistema de Reportes Semanales</p>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-4 space-y-6">
        {err && <div className="bg-red-50 text-red-700 p-3 rounded">No se pudo leer Google Sheets: {err}</div>}

        {sel ? <Detalle r={sel} back={() => setSel(null)} /> : <>
          {/* Áreas */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {AREAS.map(([n, Icon]) => (
              <button key={n} onClick={() => setArea(area === n ? null : n)}
                className={`rounded-xl p-4 text-left shadow-sm border transition hover:shadow-md ${area === n ? 'bg-verde text-white' : 'bg-white'}`}>
                <Icon className={area === n ? 'text-white' : 'text-verde'} />
                <div className="font-semibold mt-2 text-sm">{n}</div>
                <div className="text-xs opacity-80">{data.filter(r => r.area === n).length} reportes</div>
              </button>))}
          </section>

          {/* Filtros */}
          <section className="bg-white rounded-xl p-3 shadow-sm grid grid-cols-2 md:grid-cols-6 gap-2">
            <div className="col-span-2 flex items-center gap-2 border rounded px-2"><Search size={16} />
              <input className="w-full py-1.5 outline-none text-sm" placeholder="Buscar en todo…" value={f.q} onChange={e => setF({ ...f, q: e.target.value })} /></div>
            {[['semana', 'Semana', uniq('semana')], ['anio', 'Año', uniq('anio')], ['resp', 'Responsable', uniq('responsable')], ['estado', 'Estado', estados]].map(([k, l, opts]) => (
              <select key={k} className="border rounded px-2 py-1.5 text-sm" value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })}>
                <option value="">{l}: todos</option>{opts.map(o => <option key={o}>{o}</option>)}</select>))}
          </section>

          {/* KPIs */}
          <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[['Reportes', filtered.length, 'text-gris'], ['Áreas', new Set(filtered.map(r => r.area)).size, 'text-gris'],
              ['Avances', sum('av'), 'text-green-600'], ['Alertas', sum('al'), 'text-yellow-600'], ['Pendientes', sum('pe'), 'text-red-600']].map(([l, v, c]) => (
              <div key={l} className="bg-white rounded-xl p-4 shadow-sm"><div className="text-xs uppercase text-gray-500">{l}</div><div className={`text-3xl font-bold ${c}`}>{v}</div></div>))}
          </section>

          {/* Gráficos */}
          {!area && <section className="grid md:grid-cols-2 gap-4">
            <Chart t="Reportes por área"><BarChart data={porArea}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="area" fontSize={10} /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="Reportes" fill="#2E7D32" /></BarChart></Chart>
            <Chart t="Comparativo semanal por área"><BarChart data={porArea}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="area" fontSize={10} /><YAxis /><Tooltip /><Legend /><Bar dataKey="Reportes" fill="#81C784" /><Bar dataKey="Pendientes" fill="#ef4444" /></BarChart></Chart>
            <Chart t="Cumplimiento de cierre de pendientes (%)"><BarChart data={porArea}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="area" fontSize={10} /><YAxis domain={[0, 100]} /><Tooltip /><Bar dataKey="cierre" name="% cerrados" fill="#2E7D32" /></BarChart></Chart>
            <div className="bg-white rounded-xl p-4 shadow-sm"><h3 className="font-semibold mb-2">Ranking: menos pendientes</h3>
              <ol className="text-sm space-y-1">{ranking.map((a, i) => <li key={a.area} className="flex justify-between"><span>{i + 1}. {a.area}</span><b>{a.Pendientes}</b></li>)}</ol></div>
          </section>}
          <section className="grid md:grid-cols-3 gap-4">
            {[['Avances', '#2E7D32'], ['Alertas', '#eab308'], ['Pendientes', '#ef4444']].map(([k, c]) => (
              <Chart key={k} t={'Tendencia de ' + k}><LineChart data={tendencia}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="semana" /><YAxis allowDecimals={false} /><Tooltip /><Line dataKey={k} stroke={c} strokeWidth={2} /></LineChart></Chart>))}
          </section>

          {/* Tarjetas de reportes */}
          <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(r => { const t = tot(r); return (
              <article key={r.id} onClick={() => setSel(r)} className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-verde cursor-pointer hover:shadow-md">
                <div className="flex justify-between items-start"><h3 className="font-bold text-verde">SEMANA {r.semana} <span className="text-xs text-gray-400">{r.anio}</span></h3><span className="text-xs bg-fondo px-2 py-0.5 rounded">{r.area}</span></div>
                <p className="text-xs text-gray-500">{r.responsable} · {r.fecha}</p>
                <p className="text-sm mt-2 line-clamp-3"><b>Resumen Ejecutivo:</b> {r.resumen}</p>
                <div className="flex gap-3 mt-3 text-sm">
                  <span className="flex items-center gap-1 text-green-600"><CheckCircle2 size={16} />{t.av}</span>
                  <span className="flex items-center gap-1 text-yellow-600"><AlertTriangle size={16} />{t.al}</span>
                  <span className="flex items-center gap-1 text-red-600"><Clock size={16} />{t.pe}</span></div>
              </article>) })}
            {!filtered.length && <p className="text-gray-500">Sin reportes para los filtros seleccionados.</p>}
          </section>
        </>}
      </main>
    </div>
  )
}

const Chart = ({ t, children }) => (
  <div className="bg-white rounded-xl p-4 shadow-sm"><h3 className="font-semibold mb-2 text-sm">{t}</h3><ResponsiveContainer width="100%" height={220}>{children}</ResponsiveContainer></div>)

const Lista = ({ titulo, items, Icon, color }) => (
  <section className="bg-white rounded-xl p-4 shadow-sm"><h3 className={`font-semibold mb-2 flex items-center gap-2 ${color}`}><Icon size={18} />{titulo}</h3>
    {items.length ? <ul className="list-disc ml-6 text-sm space-y-1">{items.map((x, i) => <li key={i}>{x}</li>)}</ul> : <p className="text-sm text-gray-400">Sin registros</p>}</section>)

function Detalle({ r, back }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between print:hidden">
        <button onClick={back} className="flex items-center gap-1 text-verde font-medium"><ArrowLeft size={18} />Volver</button>
        <button onClick={() => window.print()} className="flex items-center gap-1 bg-verde text-white px-3 py-1.5 rounded text-sm"><FileDown size={16} />Exportar PDF</button>
      </div>
      <section className="bg-white rounded-xl p-4 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        {[['Área', r.area], ['Semana', `${r.semana} / ${r.anio}`], ['Responsable', r.responsable], ['Fecha', r.fecha]].map(([l, v]) => (
          <div key={l}><div className="text-xs text-gray-500 uppercase">{l}</div><b>{v}</b></div>))}
      </section>
      <section className="bg-white rounded-xl p-4 shadow-sm"><h3 className="font-semibold text-verde mb-1">Resumen Ejecutivo</h3><p className="text-sm whitespace-pre-line">{r.resumen}</p></section>
      <div className="grid md:grid-cols-2 gap-4">
        <Lista titulo="Avances" items={r.avances} Icon={CheckCircle2} color="text-green-600" />
        <Lista titulo="Alertas" items={r.alertas} Icon={AlertTriangle} color="text-yellow-600" />
      </div>
      <section className="bg-white rounded-xl p-4 shadow-sm overflow-x-auto"><h3 className="font-semibold text-red-600 mb-2 flex items-center gap-2"><Clock size={18} />Pendientes críticos</h3>
        <table className="w-full text-sm"><thead><tr className="text-left text-xs uppercase text-gray-500">
          {['Pendiente', 'Responsable', 'Fecha compromiso', 'Prioridad', 'Estado', 'Observaciones'].map(h => <th key={h} className="p-2">{h}</th>)}</tr></thead>
          <tbody>{r.pendientes.map((p, i) => <tr key={i} className="border-t">
            <td className="p-2">{p.titulo}</td><td className="p-2">{p.responsable}</td><td className="p-2">{p.fecha}</td>
            <td className="p-2"><span className={`px-2 py-0.5 rounded text-xs ${PRIO[p.prioridad.toLowerCase()] || PRIO.media}`}>{p.prioridad}</span></td>
            <td className="p-2">{p.estado}</td><td className="p-2">{p.obs}</td></tr>)}</tbody></table></section>
      <section><h3 className="font-semibold text-verde mb-2 flex items-center gap-2"><Flag size={18} />Focos de la próxima semana</h3>
        <div className="grid md:grid-cols-3 gap-3">{r.focos.map((x, i) => <div key={i} className="bg-verdeclaro/30 border border-verdeclaro rounded-xl p-3 text-sm">{x}</div>)}</div></section>
      <section className="bg-yellow-50 border border-yellow-300 rounded-xl p-4"><h3 className="font-semibold flex items-center gap-2 mb-1"><LifeBuoy size={18} />Apoyo requerido</h3><p className="text-sm whitespace-pre-line">{r.apoyo || 'Sin apoyo solicitado'}</p></section>
    </div>)
}
