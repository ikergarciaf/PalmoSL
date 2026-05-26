export type EmailCategory = 'stock' | 'precio' | 'compatibilidad' | 'estado_pedido' | 'reclamacion' | 'consulta_compleja'
export type EmailStatus = 'respondido' | 'escalado' | 'pendiente'
export type AlertPriority = 'critica' | 'alta' | 'media'

export interface EmailRecord {
  id: string
  fecha: string
  hora: string
  cliente: string
  empresa: string
  tipo: EmailCategory
  confianza: number
  estado: EmailStatus
  accion: string
  ambigua: boolean
  asunto: string
  cuerpo?: string
}

export interface StockRecord {
  sku: string
  nombre: string
  proveedor: string
  stockActual: number
  stockMinimo: number
  ventasDiarias: number
  diasRestantes: number
  leadTime: number
  riesgo: AlertPriority | 'ok'
  reposicionSugerida: number
  anomalia: boolean
}

export interface AlertRecord {
  id: string
  timestamp: string
  tipo: 'stock' | 'email' | 'api' | 'sistema'
  prioridad: AlertPriority
  titulo: string
  descripcion: string
  sku?: string
  leida: boolean
}

function daysAgoDisplay(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function daysAgoISO(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

function timeStr(h: number, m: number): string {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export const dashboardMetrics = {
  emailsProcesadosHoy: 47,
  emailsEscaladosHoy: 6,
  productosEnRiesgo: 12,
  precisionIA: 94.2,
}

export const emailsData: EmailRecord[] = [
  { id: 'EM-2847', fecha: daysAgoDisplay(0), hora: timeStr(9, 12), cliente: 'Carlos Ruiz', empresa: 'Distribuciones Ruiz S.L.', tipo: 'stock', confianza: 0.94, estado: 'respondido', accion: 'Respuesta automática con disponibilidad', ambigua: false, asunto: 'Stock toner HP 415A', cuerpo: 'Necesitamos 20 unidades de toner compatible HP 415A negro. Confirmad stock y plazo.' },
  { id: 'EM-2846', fecha: daysAgoDisplay(0), hora: timeStr(8, 58), cliente: 'Ana García', empresa: 'Suministros García S.A.', tipo: 'precio', confianza: 0.91, estado: 'respondido', accion: 'Tarifa enviada automáticamente', ambigua: false, asunto: 'Precio para distribuidor', cuerpo: 'Buenos días, podéis indicarnos precio neto del tambor Brother DR2400 para 12 unidades?' },
  { id: 'EM-2845', fecha: daysAgoDisplay(0), hora: timeStr(8, 43), cliente: 'Javier Moreno', empresa: 'Moreno & Hijos S.C.', tipo: 'reclamacion', confianza: 0.96, estado: 'escalado', accion: 'Escalado a atención al cliente', ambigua: true, asunto: 'Reclamación material defectuoso', cuerpo: 'Hemos recibido varios toners con fuga de polvo. Necesitamos solución urgente.' },
  { id: 'EM-2844', fecha: daysAgoDisplay(0), hora: timeStr(8, 31), cliente: 'María López', empresa: 'Industrias López', tipo: 'compatibilidad', confianza: 0.88, estado: 'respondido', accion: 'Confirmación de compatibilidad enviada', ambigua: false, asunto: 'Compatibilidad Epson', cuerpo: 'El cartucho PAL-EP-TIN-0012 sirve para Epson Workforce 2760?' },
  { id: 'EM-2843', fecha: daysAgoDisplay(0), hora: timeStr(8, 15), cliente: 'Roberto Sanz', empresa: 'Comercial Sanz', tipo: 'estado_pedido', confianza: 0.92, estado: 'respondido', accion: 'Estado pedido #82471 enviado', ambigua: false, asunto: 'Estado pedido 45891', cuerpo: 'Solicito estado del pedido 45891 realizado la semana pasada.' },
  { id: 'EM-2842', fecha: daysAgoDisplay(0), hora: timeStr(7, 55), cliente: 'Elena Castro', empresa: 'Castro Materiales S.L.', tipo: 'consulta_compleja', confianza: 0.71, estado: 'escalado', accion: 'Escalado por baja confianza', ambigua: true, asunto: 'Consulta varias referencias', cuerpo: 'Necesito alternativa para equipos HP, Canon y Brother con entrega esta semana.' },
  { id: 'EM-2841', fecha: daysAgoDisplay(0), hora: timeStr(7, 40), cliente: 'Pedro Núñez', empresa: 'Núñez Distribución', tipo: 'stock', confianza: 0.93, estado: 'respondido', accion: 'Respuesta automática con disponibilidad', ambigua: false, asunto: 'Disponibilidad Canon', cuerpo: 'Tenéis stock de tinta Canon 545 negro? Necesito 35 unidades.' },
  { id: 'EM-2840', fecha: daysAgoDisplay(0), hora: timeStr(7, 22), cliente: 'Isabel Díaz', empresa: 'Grupo Díaz', tipo: 'precio', confianza: 0.89, estado: 'pendiente', accion: 'En cola de procesamiento', ambigua: false, asunto: 'Presupuesto mensual', cuerpo: 'Enviadnos presupuesto para 80 unidades de consumibles mixtos para oficina.' },
  { id: 'EM-2839', fecha: daysAgoDisplay(1), hora: timeStr(17, 48), cliente: 'Luis Fernández', empresa: 'Fernández & Cia', tipo: 'reclamacion', confianza: 0.97, estado: 'escalado', accion: 'Escalado urgente — reclamación calidad', ambigua: true, asunto: 'Incidencia factura', cuerpo: 'La factura del pedido 46210 no coincide con las unidades recibidas.' },
  { id: 'EM-2838', fecha: daysAgoDisplay(1), hora: timeStr(17, 30), cliente: 'Marta Vega', empresa: 'Vega Industrial', tipo: 'estado_pedido', confianza: 0.90, estado: 'respondido', accion: 'Estado pedido #81990 enviado', ambigua: false, asunto: 'Seguimiento pedido 81990', cuerpo: 'Necesito saber cuándo llegará el pedido 81990 de consumibles.' },
  { id: 'EM-2837', fecha: daysAgoDisplay(1), hora: timeStr(16, 55), cliente: 'Tomás Herrera', empresa: 'Herrera Suministros', tipo: 'compatibilidad', confianza: 0.85, estado: 'respondido', accion: 'Ficha técnica enviada', ambigua: false, asunto: 'Consulta compatibilidad', cuerpo: 'El toner PAL-BR-TON-0019 es compatible con Brother DCP-L5650DN?' },
  { id: 'EM-2836', fecha: daysAgoDisplay(1), hora: timeStr(16, 20), cliente: 'Cristina Molina', empresa: 'Molina & Partners', tipo: 'consulta_compleja', confianza: 0.68, estado: 'escalado', accion: 'Escalado por baja confianza', ambigua: true, asunto: 'Reposición urgente', cuerpo: 'Necesitamos toner Kyocera compatible antes del viernes. Indicad opciones disponibles.' },
]

export const stockData: StockRecord[] = [
  { sku: 'PAL-TN-CAR-0012', nombre: 'Toner Negro HP LaserJet 508A', proveedor: 'IberToner Mayoristas', stockActual: 8, stockMinimo: 15, ventasDiarias: 2.4, diasRestantes: 3.3, leadTime: 7, riesgo: 'critica', reposicionSugerida: 60, anomalia: false },
  { sku: 'PAL-TN-CAR-0031', nombre: 'Toner Cian Kyocera TK-5230', proveedor: 'PrintEuropa Distribucion', stockActual: 4, stockMinimo: 10, ventasDiarias: 1.1, diasRestantes: 3.6, leadTime: 5, riesgo: 'critica', reposicionSugerida: 30, anomalia: true },
  { sku: 'PAL-PP-A4-0001', nombre: 'Papel A4 80g Navigator', proveedor: 'Consumibles Levante', stockActual: 320, stockMinimo: 200, ventasDiarias: 48.2, diasRestantes: 6.6, leadTime: 3, riesgo: 'alta', reposicionSugerida: 500, anomalia: false },
  { sku: 'PAL-DO-TIN-0008', nombre: 'Cartucho Epson T0711 Negro', proveedor: 'LaserParts Iberia', stockActual: 22, stockMinimo: 20, ventasDiarias: 3.8, diasRestantes: 5.8, leadTime: 4, riesgo: 'alta', reposicionSugerida: 40, anomalia: false },
  { sku: 'PAL-TN-CAR-0019', nombre: 'Toner Brother TN-2420', proveedor: 'OfiInk Central', stockActual: 31, stockMinimo: 15, ventasDiarias: 2.2, diasRestantes: 14.1, leadTime: 5, riesgo: 'media', reposicionSugerida: 25, anomalia: false },
  { sku: 'PAL-PP-A3-0002', nombre: 'Papel A3 80g Nautilus', proveedor: 'TonerPro Canal', stockActual: 95, stockMinimo: 40, ventasDiarias: 8.5, diasRestantes: 11.2, leadTime: 3, riesgo: 'media', reposicionSugerida: 100, anomalia: false },
  { sku: 'PAL-DO-TIN-0015', nombre: 'Cartucho Canon PG-545 Negro', proveedor: 'Repuestos PrintMax', stockActual: 18, stockMinimo: 10, ventasDiarias: 1.6, diasRestantes: 11.3, leadTime: 4, riesgo: 'media', reposicionSugerida: 20, anomalia: false },
  { sku: 'PAL-TN-CAR-0044', nombre: 'Toner Samsung MLT-D116L', proveedor: 'Distribuciones Grafica Sur', stockActual: 12, stockMinimo: 8, ventasDiarias: 0.9, diasRestantes: 13.3, leadTime: 6, riesgo: 'media', reposicionSugerida: 15, anomalia: false },
  { sku: 'PAL-AC-GRF-0003', nombre: 'Grapas Novus 24/6 5000u', proveedor: 'IberToner Mayoristas', stockActual: 48, stockMinimo: 20, ventasDiarias: 2.1, diasRestantes: 22.9, leadTime: 2, riesgo: 'media', reposicionSugerida: 0, anomalia: false },
  { sku: 'PAL-PP-A4-0005', nombre: 'Papel A4 90g Clairefontaine', proveedor: 'PrintEuropa Distribucion', stockActual: 180, stockMinimo: 60, ventasDiarias: 9.4, diasRestantes: 19.1, leadTime: 5, riesgo: 'media', reposicionSugerida: 0, anomalia: false },
]

export const alertasData: AlertRecord[] = [
  { id: 'ALT-0891', timestamp: `${daysAgoISO(0)}T09:15:00`, tipo: 'stock', prioridad: 'critica', titulo: 'Rotura inminente: PAL-TN-CAR-0012', descripcion: 'Stock de Toner Negro HP LaserJet 508A caerá a 0 en aprox. 3 días. Lead time: 7 días.', sku: 'PAL-TN-CAR-0012', leida: false },
  { id: 'ALT-0890', timestamp: `${daysAgoISO(0)}T09:14:00`, tipo: 'stock', prioridad: 'critica', titulo: 'Anomalia de demanda: PAL-TN-CAR-0031', descripcion: 'Pico de demanda detectado en Toner Cian Kyocera TK-5230. Stock restante: 4 uds.', sku: 'PAL-TN-CAR-0031', leida: false },
  { id: 'ALT-0889', timestamp: `${daysAgoISO(0)}T08:55:00`, tipo: 'email', prioridad: 'alta', titulo: '6 emails escalados a humano hoy', descripcion: 'Porcentaje de escalado (12.8%) supera umbral configurado del 10%.', leida: false },
  { id: 'ALT-0888', timestamp: `${daysAgoISO(0)}T08:30:00`, tipo: 'stock', prioridad: 'alta', titulo: 'Stock bajo margen: PAL-PP-A4-0001', descripcion: 'Papel A4 80g Navigator con 6.6 días restantes. Lead time + margen: 8 días.', sku: 'PAL-PP-A4-0001', leida: false },
  { id: 'ALT-0887', timestamp: `${daysAgoISO(0)}T07:45:00`, tipo: 'api', prioridad: 'alta', titulo: 'Latencia elevada Gmail API', descripcion: 'Tiempo medio de respuesta: 2.4s (umbral: 2.0s). Monitorizar.', leida: true },
  { id: 'ALT-0886', timestamp: `${daysAgoISO(1)}T17:20:00`, tipo: 'sistema', prioridad: 'media', titulo: 'Sincronización SAP con retraso', descripcion: 'El scheduler de las 17:00 se ejecutó con 12 minutos de retraso.', leida: true },
  { id: 'ALT-0885', timestamp: `${daysAgoISO(1)}T15:10:00`, tipo: 'email', prioridad: 'media', titulo: 'Reclamación de alto impacto', descripcion: 'Email EM-2839 — Fernández & Cia. Reclamación de calidad escalada a atención al cliente.', leida: true },
]
