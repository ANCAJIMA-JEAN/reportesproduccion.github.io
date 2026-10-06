# Sistema de Reportes Semanales – Sub Gerencia de Producción
1. Google Sheets: crea la pestaña `REPORTES` con las 12 columnas. Extensiones > Apps Script > pega `apps-script/Code.gs` > Implementar como aplicación web (acceso: cualquiera con el enlace) y copia la URL `/exec`.
2. Copia `.env.example` a `.env` y pega la URL en `VITE_API_URL`.
3. `npm install` · `npm run dev` · `npm run build`.
4. GitHub Pages: ajusta `base` en `vite.config.js` al nombre de tu repo; sube el proyecto y publica `dist/` (o usa la acción oficial de Pages). En Settings > Secrets > Variables agrega `VITE_API_URL` si compilas con Actions.
Las filas nuevas en la hoja aparecen solas (refresco cada 60 s). Formato de celdas: un ítem por línea; PENDIENTES: `Pendiente | Responsable | Fecha | Prioridad | Estado | Observaciones`.
