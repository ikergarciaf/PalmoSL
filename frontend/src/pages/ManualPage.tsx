import React from 'react'
import {
  BookOpen, Mail, Package, Bell, LayoutDashboard,
  Play, RefreshCw, ExternalLink, CheckCircle,
  AlertTriangle, Info, ChevronDown,
} from 'lucide-react'
import { useState } from 'react'
import { Card } from '../components/ui'

const sections = [
  { id: 'que-es',        label: '¿Qué es Palmo IA?' },
  { id: 'panel-control', label: 'Panel de control' },
  { id: 'emails',        label: 'Emails IA' },
  { id: 'stock',         label: 'Stock y predicción' },
  { id: 'alertas',       label: 'Alertas' },
  { id: 'configuracion', label: 'Configuración' },
  { id: 'preguntas',     label: 'Preguntas frecuentes' },
]

export default function ManualPage() {
  const [activeSection, setActiveSection] = useState('que-es')

  return (
    <div className="max-w-[1000px] mx-auto">
      <div className="flex gap-6">
        {/* Sidebar index */}
        <nav className="w-48 flex-shrink-0 sticky top-[4.5rem] self-start">
          <div className="bg-white border border-stone-200 rounded-lg p-2">
            <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide px-3 py-1.5">Contenido</p>
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-[12px] font-medium transition-colors ${
                  activeSection === s.id
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-4">
          {activeSection === 'que-es'        && <QueEsSection />}
          {activeSection === 'panel-control' && <PanelControlSection />}
          {activeSection === 'emails'        && <EmailsSection />}
          {activeSection === 'stock'         && <StockSection />}
          {activeSection === 'alertas'       && <AlertasSection />}
          {activeSection === 'configuracion' && <ConfiguracionSection />}
          {activeSection === 'preguntas'     && <PreguntasSection />}
        </div>
      </div>
    </div>
  )
}

/* ── Shared primitives ─────────────────────────────────────────────── */

function SectionTitle({ children }: { children: string }) {
  return <h2 className="text-[15px] font-semibold text-stone-900 mb-3">{children}</h2>
}

function SubTitle({ children }: { children: string }) {
  return <h3 className="text-[13px] font-semibold text-stone-800 mt-5 mb-2">{children}</h3>
}

function Text({ children }: { children: React.ReactNode }) {
  return <p className="text-[12.5px] text-stone-600 leading-relaxed mb-3">{children}</p>
}

function HighlightBox({ icon: Icon, title, children }: {
  icon: React.ElementType; title: string; children: React.ReactNode
}) {
  return (
    <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 flex gap-3 mb-4">
      <div className="w-8 h-8 bg-white rounded-md border border-stone-200 flex items-center justify-center flex-shrink-0">
        <Icon size={15} className="text-stone-600" />
      </div>
      <div>
        <p className="text-[12px] font-semibold text-stone-800 mb-1">{title}</p>
        <div className="text-[12px] text-stone-600 leading-relaxed">{children}</div>
      </div>
    </div>
  )
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 items-start mb-2">
      <span className="w-5 h-5 bg-stone-900 text-white text-[10px] font-bold rounded flex items-center justify-center flex-shrink-0 mt-0.5">{n}</span>
      <p className="text-[12.5px] text-stone-600">{children}</p>
    </div>
  )
}

/** Local badge for documentation — distinct from the UI Badge component */
function DocBadge({ children, color }: {
  children: string
  color: 'emerald' | 'amber' | 'red' | 'blue' | 'stone'
}) {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-700',
    amber:   'bg-amber-50 text-amber-700',
    red:     'bg-red-50 text-red-700',
    blue:    'bg-blue-50 text-blue-700',
    stone:   'bg-stone-100 text-stone-700',
  }
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${colors[color]}`}>
      {children}
    </span>
  )
}

/* ── 1. Qué es ─────────────────────────────────────────────────── */

function QueEsSection() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 bg-stone-900 rounded-lg flex items-center justify-center flex-shrink-0">
          <BookOpen size={16} className="text-white" />
        </div>
        <SectionTitle>¿Qué es Palmo IA?</SectionTitle>
      </div>

      <Text>
        Palmo IA es un asistente inteligente que ayuda al equipo de <strong>Palmo Suministro Integral</strong> a
        automatizar dos tareas clave del día a día:
      </Text>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <HighlightBox icon={Mail} title="Gestión de emails">
          Lee y clasifica automáticamente los correos de los clientes,
          genera respuestas y avisa cuando hace falta que una persona intervenga.
        </HighlightBox>
        <HighlightBox icon={Package} title="Control de stock">
          Analiza las ventas de los últimos meses, predice cuándo se va a
          acabar cada producto y avisa con tiempo para hacer pedidos a proveedores.
        </HighlightBox>
      </div>

      <HighlightBox icon={Info} title="¿Cómo funciona?">
        <p className="mb-1">El sistema tiene dos partes que trabajan juntas:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>Backend</strong> — el cerebro. Procesa emails, calcula predicciones y genera alertas.</li>
          <li><strong>Panel web</strong> — la pantalla que estás viendo ahora. Muestra toda la información de forma clara para que puedas tomar decisiones.</li>
        </ul>
      </HighlightBox>

      <HighlightBox icon={CheckCircle} title="Modo demo vs. Modo real">
        Cuando no hay credenciales configuradas (API de Gmail, clave de Anthropic, etc.),
        el sistema trabaja con <strong>datos de ejemplo</strong> para que puedas probar todas las funciones
        sin riesgo. Cuando conectes los servicios reales, cambiará automáticamente.
      </HighlightBox>
    </Card>
  )
}

/* ── 2. Panel de control ──────────────────────────────────────── */

function PanelControlSection() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <LayoutDashboard size={18} className="text-stone-700" />
        <SectionTitle>Panel de control</SectionTitle>
      </div>

      <Text>
        Es la primera pantalla que ves al entrar. Te da un <strong>resumen rápido</strong> de lo más importante
        sin tener que buscar. Está dividida en varias zonas:
      </Text>

      <SubTitle>Indicadores principales (KPIs)</SubTitle>
      <Text>Arriba del todo ves 5 tarjetas con los números más importantes:</Text>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
        {[
          { label: 'Emails procesados', desc: 'Cuántos correos ha gestionado el sistema hoy.' },
          { label: 'Escalados',         desc: 'Cuántos necesitaron que una persona los revisara.' },
          { label: 'En riesgo',         desc: 'Productos cuyo stock puede agotarse pronto.' },
          { label: 'Precisión IA',      desc: 'Porcentaje de acierto del asistente.' },
          { label: 'Alertas activas',   desc: 'Avisos importantes pendientes de leer.' },
        ].map(k => (
          <div key={k.label} className="bg-stone-50 rounded-lg p-3 border border-stone-200">
            <p className="text-[10px] text-stone-400 font-medium uppercase mb-1">{k.label}</p>
            <p className="text-[11px] text-stone-600">{k.desc}</p>
          </div>
        ))}
      </div>

      <SubTitle>Botones de acción rápida</SubTitle>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-200 rounded-md text-[11px] text-stone-600">
          <Play size={11} /> Procesar emails
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 text-white rounded-md text-[11px]">
          <RefreshCw size={11} /> Calcular stock
        </div>
      </div>
      <Text>
        El botón <strong>"Procesar emails"</strong> lanza el ciclo de lectura y clasificación ahora mismo
        (sin esperar al programa automático). <strong>"Calcular stock"</strong> hace lo mismo con las predicciones
        de inventario. Al pulsarlos verás animación mientras trabajan. Si hay error, aparece un aviso en pantalla.
      </Text>
    </Card>
  )
}

/* ── 3. Emails IA ─────────────────────────────────────────────── */

function EmailsSection() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Mail size={18} className="text-stone-700" />
        <SectionTitle>Emails IA</SectionTitle>
      </div>

      <Text>
        Esta pantalla muestra <strong>todos los correos</strong> que el sistema ha procesado.
        Puedes consultar el histórico, buscar mensajes concretos y ver cómo los ha clasificado la IA.
      </Text>

      <SubTitle>¿Cómo se procesa un email?</SubTitle>
      <div className="mb-4">
        <Step n={1}>El sistema recoge los correos no leídos de Gmail (o carga los de ejemplo en modo demo).</Step>
        <Step n={2}>La IA clasifica el correo: <DocBadge color="blue">Stock</DocBadge>, <DocBadge color="stone">Precio</DocBadge>, <DocBadge color="stone">Compatibilidad</DocBadge>, <DocBadge color="stone">Estado pedido</DocBadge>, <DocBadge color="red">Reclamación</DocBadge> o <DocBadge color="amber">Consulta compleja</DocBadge>.</Step>
        <Step n={3}>Si la confianza es alta (≥85%) y no es una reclamación, el sistema genera y envía la respuesta.</Step>
        <Step n={4}>Si la confianza es baja, es ambigua o es una reclamación, se <strong>escala a un humano</strong>.</Step>
      </div>

      <SubTitle>Usar la pantalla de emails</SubTitle>
      <Text>
        Arriba hay un <strong>buscador</strong> para encontrar emails por cliente, empresa o ID.
        Junto al buscador están los filtros de estado (Todos / Respondidos / Escalados / Pendientes)
        y un desplegable para filtrar por tipo de consulta.
      </Text>
      <div className="bg-stone-50 rounded-lg p-4 mb-4 text-[12px] text-stone-600 space-y-1.5">
        <p><strong>Cliente:</strong> nombre, empresa, fecha y hora.</p>
        <p><strong>Asunto:</strong> el motivo del mensaje. Los emails ambiguos muestran un aviso ⚠.</p>
        <p><strong>Tipo consulta:</strong> cómo clasificó la IA el correo.</p>
        <p><strong>Confianza IA:</strong> barra de color — verde ≥90%, ámbar 80–89%, roja &lt;80%.</p>
        <p><strong>Estado:</strong> <DocBadge color="emerald">Respondido auto.</DocBadge>, <DocBadge color="amber">Escalado</DocBadge> o <DocBadge color="stone">Pendiente</DocBadge>.</p>
        <p><strong>Acción tomada:</strong> descripción de lo que hizo el sistema.</p>
      </div>
      <Text>
        El icono <ExternalLink size={12} className="inline" /> al final de cada fila abre una <strong>ventana de detalle</strong> con la información completa del email.
      </Text>
    </Card>
  )
}

/* ── 4. Stock y predicción ────────────────────────────────────── */

function StockSection() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Package size={18} className="text-stone-700" />
        <SectionTitle>Stock y predicción</SectionTitle>
      </div>

      <Text>
        Esta sección te ayuda a <strong>no quedarte sin stock</strong>. El sistema analiza las ventas
        de los últimos meses y calcula, para cada producto, cuántos días quedan antes de que se agote.
      </Text>

      <SubTitle>¿Cómo se calcula?</SubTitle>
      <Text>
        El sistema usa una <strong>media móvil ponderada</strong>: da más importancia a las ventas recientes.
        También detecta <strong>anomalías</strong> (picos de venta repentinos) para evitar falsas alarmas.
      </Text>

      <SubTitle>Entender la tabla</SubTitle>
      <div className="bg-stone-50 rounded-lg p-4 mb-4 text-[12px] text-stone-600 space-y-1.5">
        <p><strong>Referencia / Producto:</strong> código SKU y nombre del artículo.</p>
        <p><strong>Proveedor:</strong> quién nos suministra este producto.</p>
        <p><strong>Stock actual:</strong> unidades que hay ahora mismo.</p>
        <p><strong>Stk. mínimo:</strong> stock mínimo de seguridad.</p>
        <p><strong>Venta/día:</strong> media de unidades vendidas cada día.</p>
        <p><strong>Días restantes:</strong> cuántos días tardará en agotarse. La línea vertical en la barra es el <strong>lead time</strong> (días que tarda el proveedor en servir).</p>
        <p><strong>Riesgo:</strong> <DocBadge color="red">Crítica</DocBadge> (rotura antes del lead time), <DocBadge color="amber">Alta</DocBadge> (poco margen), <DocBadge color="blue">Media</DocBadge> (vigilancia), <DocBadge color="emerald">OK</DocBadge>.</p>
        <p><strong>Pedido sugerido:</strong> cuántas unidades recomienda comprar el sistema.</p>
        <p><strong>Notas:</strong> alertas de anomalías o stock bajo mínimo.</p>
      </div>

      <div className="flex flex-wrap items-center gap-5 mb-4 p-3 bg-stone-50 rounded-lg text-[11px]">
        <p className="text-stone-500 font-medium">Leyenda colores:</p>
        <div className="flex items-center gap-1.5"><div className="w-3 h-1.5 bg-red-400 rounded-sm" /><span className="text-stone-500">≤ lead time</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-1.5 bg-amber-400 rounded-sm" /><span className="text-stone-500">lead time + 5d</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-1.5 bg-emerald-500 rounded-sm" /><span className="text-stone-500">margen suficiente</span></div>
        <div className="flex items-center gap-1.5"><div className="w-px h-3 bg-stone-400" /><span className="text-stone-400">línea = lead time</span></div>
      </div>
    </Card>
  )
}

/* ── 5. Alertas ───────────────────────────────────────────────── */

function AlertasSection() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Bell size={18} className="text-stone-700" />
        <SectionTitle>Alertas</SectionTitle>
      </div>

      <Text>
        Esta página recoge <strong>todas las notificaciones</strong> del sistema: avisos de stock bajo,
        emails escalados, problemas de conexión y otros eventos importantes.
      </Text>

      <SubTitle>Tipos de alerta</SubTitle>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { icon: Package,        label: 'Stock',   desc: 'Productos que se van a agotar o con anomalías de demanda.' },
          { icon: Mail,           label: 'Email',   desc: 'Correos escalados a humanos o umbral de escalado superado.' },
          { icon: AlertTriangle,  label: 'API',     desc: 'Problemas de conexión con servicios externos.' },
          { icon: Info,           label: 'Sistema', desc: 'Avisos técnicos: retrasos en schedulers, errores internos.' },
        ].map(t => (
          <div key={t.label} className="bg-stone-50 rounded-lg p-3 border border-stone-200">
            <div className="flex items-center gap-2 mb-1">
              <t.icon size={13} className="text-stone-500" />
              <span className="text-[11px] font-semibold text-stone-700">{t.label}</span>
            </div>
            <p className="text-[11px] text-stone-500">{t.desc}</p>
          </div>
        ))}
      </div>

      <SubTitle>Prioridades</SubTitle>
      <div className="space-y-2 mb-4">
        {[
          { color: 'border-l-red-400',   bg: 'bg-red-50/50',   badge: 'red'   as const, label: 'Crítica', desc: 'Requiere atención inmediata. Por ejemplo, un producto que se agota antes de que llegue el pedido del proveedor.' },
          { color: 'border-l-amber-400', bg: 'bg-amber-50/50', badge: 'amber' as const, label: 'Alta',    desc: 'Requiere atención pronto. El margen de seguridad es estrecho.' },
          { color: 'border-l-blue-300',  bg: 'bg-blue-50/30',  badge: 'blue'  as const, label: 'Media',   desc: 'Informativa. Vigilancia preventiva o eventos que ya se resolvieron.' },
        ].map(p => (
          <div key={p.label} className={`flex items-start gap-3 p-3 ${p.bg} rounded-lg border-l-2 ${p.color}`}>
            <DocBadge color={p.badge}>{p.label}</DocBadge>
            <p className="text-[12px] text-stone-600">{p.desc}</p>
          </div>
        ))}
      </div>

      <SubTitle>Gestionar alertas</SubTitle>
      <Text>
        Puedes marcar alertas como leídas individualmente (<strong>"Marcar leída"</strong>)
        o todas de golpe con el botón <strong>"Marcar todas leídas"</strong>.
        Usa los filtros para ver solo las no leídas, por prioridad o por tipo.
      </Text>
    </Card>
  )
}

/* ── 6. Configuración ─────────────────────────────────────────── */

function ConfiguracionSection() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Info size={18} className="text-stone-700" />
        <SectionTitle>Configuración</SectionTitle>
      </div>

      <Text>
        El sistema se configura a través del archivo{' '}
        <code className="text-stone-800 bg-stone-100 px-1 rounded text-[11px]">backend/.env</code>.
        Cada línea es una opción con su valor — no se necesita ser informático para entenderlo.
      </Text>

      <SubTitle>Variables principales</SubTitle>
      <div className="bg-stone-50 rounded-lg p-4 mb-4 text-[12px] font-mono text-stone-600 space-y-2">
        {[
          ['ANTHROPIC_API_KEY',       'Clave para usar la IA de Claude. Sin ella se usan reglas básicas.'],
          ['GMAIL_CREDENTIALS_FILE',  'Credenciales Gmail OAuth2. Sin ellas, los emails son simulados.'],
          ['EMAIL_ATENCION_CLIENTE',  'Dirección desde la que se envían las respuestas a clientes.'],
          ['EMAIL_ESCALADO',          'Dirección a la que llegan los correos que requieren intervención humana.'],
          ['HORA_EJECUCION_STOCK',    'Hora diaria para calcular las predicciones de stock (ej. 07:30).'],
          ['DIAS_MARGEN_SEGURIDAD',   'Días extra de stock que quieres mantener como colchón de seguridad.'],
          ['SEMANAS_HISTORICO',       'Cuántas semanas atrás mira el sistema para calcular la demanda.'],
        ].map(([k, v]) => (
          <p key={k}><span className="text-stone-800">{k}</span> — {v}</p>
        ))}
      </div>

      <HighlightBox icon={CheckCircle} title="Para producción">
        <ol className="list-decimal pl-4 mt-1 space-y-0.5">
          <li>Copia <code className="text-stone-800 bg-stone-100 px-1 rounded text-[11px]">backend/.env.example</code> como <code className="text-stone-800 bg-stone-100 px-1 rounded text-[11px]">backend/.env</code>.</li>
          <li>Rellena las claves que te proporcione el equipo técnico.</li>
          <li>Coloca los CSV de ventas y productos en <code className="text-stone-800 bg-stone-100 px-1 rounded text-[11px]">backend/data/</code>.</li>
          <li>Reinicia el sistema y el modo demo se desactivará automáticamente.</li>
        </ol>
      </HighlightBox>
    </Card>
  )
}

/* ── 7. Preguntas frecuentes ──────────────────────────────────── */

const faqs = [
  {
    q: '¿Qué hago si veo que hay muchos emails escalados?',
    a: 'Revisa la sección de Emails IA para ver cuáles son. Si son reclamaciones o consultas complejas, es normal. Si ves muchas consultas simples escaladas, puede que la IA necesite ajustes — contacta con el equipo técnico.',
  },
  {
    q: '¿Cómo sé si un producto va a faltar?',
    a: 'Ve a "Stock y Predicción". Los productos con riesgo Crítica son los más urgentes. La columna "Días restantes" te dice cuánto tiempo queda antes de que se agoten.',
  },
  {
    q: '¿Cada cuánto se actualizan los datos?',
    a: 'Los emails se procesan cada 10 minutos automáticamente. Las predicciones de stock se calculan una vez al día a la hora configurada (por defecto 07:30). También puedes forzar la actualización desde el Panel de control.',
  },
  {
    q: '¿Puedo usar el sistema sin conexión a internet?',
    a: 'Sí. El panel web funciona en tu navegador local y el backend en tu máquina. Mientras no configures servicios externos (Gmail, Claude), todo funciona con datos de ejemplo.',
  },
  {
    q: '¿Qué significa el color de la barra de confianza en los emails?',
    a: 'Verde (≥90%): la IA está muy segura. Ámbar (80–89%): bastante segura. Roja (<80%): poca confianza, probablemente el email se haya escalado a humano.',
  },
  {
    q: '¿Dónde están los datos de los clientes y productos?',
    a: 'En modo demo se generan automáticamente datos ficticios. En producción, los datos se importan desde los CSV que exportas de SAP Business One. No se almacena nada en la nube: todo está en tu máquina o servidor.',
  },
]

function PreguntasSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle size={18} className="text-stone-700" />
        <SectionTitle>Preguntas frecuentes</SectionTitle>
      </div>

      <div className="space-y-2">
        {faqs.map((faq, i) => (
          <div key={i} className="border border-stone-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between px-4 py-3 text-left text-[12.5px] font-medium text-stone-800 hover:bg-stone-50 transition-colors"
            >
              {faq.q}
              <ChevronDown
                size={14}
                className={`text-stone-400 transition-transform flex-shrink-0 ml-2 ${openIndex === i ? 'rotate-180' : ''}`}
              />
            </button>
            {openIndex === i && (
              <div className="px-4 pb-3 pt-3 text-[12px] text-stone-600 leading-relaxed border-t border-stone-100">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}
