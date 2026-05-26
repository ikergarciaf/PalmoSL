import { BookOpen, Mail, Package, Bell, LayoutDashboard, Play, ExternalLink, CheckCircle, AlertTriangle, Info, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { Card } from '../components/ui'

const sections = [
  { id: 'que-es', label: '¿Qué es Palmo IA?' },
  { id: 'panel-control', label: 'Panel de control' },
  { id: 'emails', label: 'Emails IA' },
  { id: 'stock', label: 'Stock y predicción' },
  { id: 'alertas', label: 'Alertas' },
  { id: 'configuracion', label: 'Configuración' },
  { id: 'preguntas', label: 'Preguntas frecuentes' },
]

export default function ManualPage() {
  const [activeSection, setActiveSection] = useState('que-es')

  return (
    <div className="max-w-[1000px] mx-auto">
      <div className="mb-6">
        <h1 className="text-base font-semibold text-stone-900">Manual de uso</h1>
        <p className="text-[12px] text-stone-400 mt-0.5">Guía completa del sistema Palmo IA para todo el equipo</p>
      </div>

      <div className="flex gap-6">
        {/* Índice lateral */}
        <nav className="w-52 flex-shrink-0 sticky top-20 self-start">
          <div className="bg-white border border-stone-200 rounded-lg p-2">
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

        {/* Contenido */}
        <div className="flex-1 min-w-0 space-y-5">
          {activeSection === 'que-es' && <QueEsSection />}
          {activeSection === 'panel-control' && <PanelControlSection />}
          {activeSection === 'emails' && <EmailsSection />}
          {activeSection === 'stock' && <StockSection />}
          {activeSection === 'alertas' && <AlertasSection />}
          {activeSection === 'configuracion' && <ConfiguracionSection />}
          {activeSection === 'preguntas' && <PreguntasSection />}
        </div>
      </div>
    </div>
  )
}

/* ── Secciones ─────────────────────────────────────────────────── */

function SectionTitle({ children }: { children: string }) {
  return <h2 className="text-[15px] font-semibold text-stone-900 mb-3">{children}</h2>
}

function SubTitle({ children }: { children: string }) {
  return <h3 className="text-[13px] font-semibold text-stone-800 mt-5 mb-2">{children}</h3>
}

function Text({ children }: { children: React.ReactNode }) {
  return <p className="text-[12.5px] text-stone-600 leading-relaxed mb-3">{children}</p>
}

function HighlightBox({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
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

function Badge({ children, color }: { children: string; color: 'emerald' | 'amber' | 'red' | 'blue' | 'stone' }) {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
    blue: 'bg-blue-50 text-blue-700',
    stone: 'bg-stone-100 text-stone-700',
  }
  return <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${colors[color]}`}>{children}</span>
}

/* ── 1. Qué es ─────────────────────────────────────────────────── */

function QueEsSection() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-stone-900 rounded-lg flex items-center justify-center">
          <BookOpen size={18} className="text-white" />
        </div>
        <div>
          <SectionTitle>¿Qué es Palmo IA?</SectionTitle>
        </div>
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
          <li><strong>Backend</strong> — el cerebro. Procesa emails, calcula predicciones y genera alertas. Funciona aunque no tengas internet (modo demo con datos de ejemplo).</li>
          <li><strong>Panel web</strong> — la pantalla que estás viendo ahora. Muestra toda la información de forma clara para que puedas tomar decisiones.</li>
        </ul>
      </HighlightBox>

      <HighlightBox icon={CheckCircle} title="Modo demo vs. Modo real">
        <p>
          Cuando no hay credenciales configuradas (API de Gmail, clave de Anthropic, etc.), 
          el sistema trabaja con <strong>datos de ejemplo</strong> para que puedas probar todas las funciones 
          sin riesgo. En el Panel de control se indica si estás en modo demo o producción. 
          Cuando conectes los servicios reales, cambiará automáticamente.
        </p>
      </HighlightBox>
    </Card>
  )
}

/* ── 2. Panel de control ──────────────────────────────────────── */

function PanelControlSection() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <LayoutDashboard size={20} className="text-stone-700" />
        <SectionTitle>Panel de control</SectionTitle>
      </div>

      <Text>
        Es la primera pantalla que ves al entrar. Te da un <strong>resumen rápido</strong> de lo más importante 
        sin tener que buscar. Está dividida en varias zonas:
      </Text>

      <SubTitle>Indicadores principales (KPIs)</SubTitle>
      <Text>
        Arriba del todo ves 5 tarjetas con los números más importantes:
      </Text>
      <div className="grid grid-cols-5 gap-2 mb-4">
        {[
          { label: 'Email procesados', desc: 'Cuántos correos ha gestionado el sistema hoy.' },
          { label: 'Escalados', desc: 'Cuántos necesitaron que una persona los revisara.' },
          { label: 'En riesgo', desc: 'Productos cuyo stock puede agotarse pronto.' },
          { label: 'Precisión IA', desc: 'Porcentaje de acierto del asistente.' },
          { label: 'Alertas activas', desc: 'Avisos importantes pendientes de leer.' },
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
        El botón <strong>"Procesar emails"</strong> lanza el ciclo de lectura y clasificación de correos ahora mismo 
        (sin esperar al programa automático). <strong>"Calcular stock"</strong> hace lo mismo con las predicciones 
        de inventario. Al pulsarlos verás animación mientras trabajan.
      </Text>

      <SubTitle>Resumen por secciones</SubTitle>
      <Text>
        Más abajo encuentras:
      </Text>
      <div className="space-y-2 mb-4">
        <HighlightBox icon={Mail} title="Últimos emails">
          Muestra los 4 correos más recientes. Cada fila indica la hora, el cliente, 
          el tipo de consulta, el nivel de confianza de la IA y si se respondió automáticamente 
          o se escaló a una persona.
        </HighlightBox>
        <HighlightBox icon={Bell} title="Alertas activas">
          Las notificaciones más urgentes que requieren atención.
        </HighlightBox>
        <HighlightBox icon={Package} title="Tarjetas inferiores">
          Cuatro tarjetas con datos generales: total de productos, emails del día, 
          alertas pendientes y versión del sistema.
        </HighlightBox>
      </div>
    </Card>
  )
}

/* ── 3. Emails IA ─────────────────────────────────────────────── */

function EmailsSection() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Mail size={20} className="text-stone-700" />
        <SectionTitle>Emails IA</SectionTitle>
      </div>

      <Text>
        Esta pantalla muestra <strong>todos los correos</strong> que el sistema ha procesado. 
        Puedes consultar el histórico, buscar mensajes concretos y ver cómo los ha clasificado la IA.
      </Text>

      <SubTitle>¿Cómo se procesa un email?</SubTitle>
      <div className="mb-4">
        <Step n={1}>El sistema recoge los correos no leídos de la bandeja de entrada (o carga los de ejemplo en modo demo).</Step>
        <Step n={2}>La IA clasifica el correo en una categoría: <Badge color="blue">Stock</Badge>, <Badge color="stone">Precio</Badge>, <Badge color="stone">Compatibilidad</Badge>, <Badge color="stone">Estado pedido</Badge>, <Badge color="red">Reclamación</Badge> o <Badge color="amber">Consulta compleja</Badge>.</Step>
        <Step n={3}>Si la confianza es alta (&ge;85%) y no es una reclamación, el sistema genera y envía una respuesta automática.</Step>
        <Step n={4}>Si la confianza es baja, es ambigua o es una reclamación, se <strong>escala a un humano</strong> para que la revise.</Step>
      </div>

      <SubTitle>Usar la pantalla de emails</SubTitle>
      <Text>
        Arriba tienes un <strong>buscador</strong> para encontrar emails por cliente, empresa o ID. 
        Junto al buscador hay filtros para ver solo los respondidos, escalados o pendientes, 
        y un desplegable para filtrar por tipo de consulta.
      </Text>
      <Text>
        Cada fila de la tabla te muestra:
      </Text>
      <div className="bg-stone-50 rounded-lg p-4 mb-4 text-[12px] text-stone-600 space-y-1.5">
        <p><strong>Cliente:</strong> nombre, empresa, fecha, hora y referencia del correo.</p>
        <p><strong>Asunto:</strong> el motivo del mensaje (nueva columna). Los emails ambiguos muestran un aviso.</p>
        <p><strong>Tipo consulta:</strong> cómo clasificó la IA el correo.</p>
        <p><strong>Confianza IA:</strong> barra de color que indica cuán segura está la IA (verde &ge;90%, ámbar 80-89%, roja &lt;80%).</p>
        <p><strong>Estado:</strong> <Badge color="emerald">Respondido auto.</Badge>, <Badge color="amber">Escalado</Badge> o <Badge color="stone">Pendiente</Badge>.</p>
        <p><strong>Acción tomada:</strong> breve descripción de lo que hizo el sistema.</p>
      </div>
      <Text>
        El icono <ExternalLink size={12} className="inline" /> al final de cada fila abre una <strong>ventana de detalle</strong> 
        con la información completa del email: asunto, cuerpo del mensaje, clasificación y acción realizada.
      </Text>
    </Card>
  )
}

/* ── 4. Stock y predicción ────────────────────────────────────── */

function StockSection() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Package size={20} className="text-stone-700" />
        <SectionTitle>Stock y predicción</SectionTitle>
      </div>

      <Text>
        Esta sección te ayuda a <strong>no quedarte sin stock</strong>. El sistema analiza las ventas 
        de los últimos meses y calcula, para cada producto, cuántos días quedan antes de que se agote.
      </Text>

      <SubTitle>¿Cómo se calcula?</SubTitle>
      <Text>
        El sistema usa un método llamado <strong>media móvil ponderada</strong>: da más importancia 
        a las ventas recientes que a las de hace meses. Así se adapta mejor a la demanda actual.
        También detecta <strong>anomalías</strong> (picos de venta repentinos) para evitar falsas alarmas.
      </Text>

      <SubTitle>Entender la tabla</SubTitle>
      <div className="bg-stone-50 rounded-lg p-4 mb-4 text-[12px] text-stone-600 space-y-1.5">
        <p><strong>Referencia / Producto:</strong> código SKU y nombre del artículo.</p>
        <p><strong>Proveedor:</strong> quién nos suministra este producto.</p>
        <p><strong>Stock actual:</strong> unidades que hay ahora mismo.</p>
        <p><strong>Stk. mínimo:</strong> stock mínimo de seguridad.</p>
        <p><strong>Venta/día:</strong> media de unidades que se venden cada día.</p>
        <p><strong>Días restantes:</strong> cuántos días tardará en agotarse si seguimos vendiendo al mismo ritmo. La barra visual y la línea vertical marcan el <strong>lead time</strong> (días que tarda el proveedor en servir).</p>
        <p><strong>Riesgo:</strong> <Badge color="red">Crítica</Badge> (se agota antes del lead time), <Badge color="amber">Alta</Badge> (poco margen), <Badge color="blue">Media</Badge> (vigilancia), <Badge color="emerald">OK</Badge>.</p>
        <p><strong>Pedido sugerido:</strong> cuántas unidades recomienda comprar el sistema.</p>
        <p><strong>Notas:</strong> alertas de anomalías o stock por debajo del mínimo.</p>
      </div>

      <div className="flex items-center gap-6 mb-4 p-3 bg-stone-50 rounded-lg text-[11px]">
        <p className="text-stone-500 font-medium">Leyenda colores:</p>
        <div className="flex items-center gap-1.5"><div className="w-3 h-1.5 bg-red-400 rounded-sm" /><span className="text-stone-500">≤ lead time (urge comprar)</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-1.5 bg-amber-400 rounded-sm" /><span className="text-stone-500">lead time + 5d (precaución)</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-1.5 bg-emerald-500 rounded-sm" /><span className="text-stone-500">margen suficiente</span></div>
        <div className="flex items-center gap-1.5"><div className="w-px h-3 bg-stone-400" /><span className="text-stone-400">línea vertical = lead time</span></div>
      </div>

      <SubTitle>Filtrar y buscar</SubTitle>
      <Text>
        Puedes filtrar por nivel de riesgo (Crítico, Alto, Medio) o buscar un producto concreto 
        escribiendo su SKU, nombre o proveedor en el campo de búsqueda.
      </Text>
    </Card>
  )
}

/* ── 5. Alertas ───────────────────────────────────────────────── */

function AlertasSection() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Bell size={20} className="text-stone-700" />
        <SectionTitle>Alertas</SectionTitle>
      </div>

      <Text>
        Esta página recoge <strong>todas las notificaciones</strong> del sistema. Aquí verás avisos 
        de stock bajo, emails escalados, problemas de conexión y otros eventos importantes.
      </Text>

      <SubTitle>Tipos de alerta</SubTitle>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { icon: Package, label: 'Stock', desc: 'Productos que se van a agotar o tienen anomalías de demanda.' },
          { icon: Mail, label: 'Email', desc: 'Correos escalados a humanos o umbrales de escalado superados.' },
          { icon: AlertTriangle, label: 'API', desc: 'Problemas de conexión con servicios externos (Gmail, Claude, etc.).' },
          { icon: Info, label: 'Sistema', desc: 'Avisos técnicos: retrasos en schedulers, errores internos, etc.' },
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
        <div className="flex items-start gap-3 p-3 bg-red-50/50 rounded-lg border-l-2 border-l-red-400">
          <Badge color="red">Crítica</Badge>
          <p className="text-[12px] text-stone-600">Requiere atención inmediata. Por ejemplo, un producto que se agota en menos días del que tarda el proveedor en servir.</p>
        </div>
        <div className="flex items-start gap-3 p-3 bg-amber-50/50 rounded-lg border-l-2 border-l-amber-400">
          <Badge color="amber">Alta</Badge>
          <p className="text-[12px] text-stone-600">Requiere atención pronto. El margen de seguridad es estrecho.</p>
        </div>
        <div className="flex items-start gap-3 p-3 bg-blue-50/30 rounded-lg border-l-2 border-l-blue-300">
          <Badge color="blue">Media</Badge>
          <p className="text-[12px] text-stone-600">Informativa. Vigilancia preventiva o eventos que ya se resolvieron.</p>
        </div>
      </div>

      <SubTitle>Gestionar alertas</SubTitle>
      <Text>
        Puedes marcar alertas como leídas individualmente (botón <strong>"Marcar leída"</strong>) 
        o todas de golpe con el botón <strong>"Marcar todas como leídas"</strong> de la parte superior.
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
        <Info size={20} className="text-stone-700" />
        <SectionTitle>Configuración</SectionTitle>
      </div>

      <Text>
        El sistema se configura a través del archivo <code className="text-stone-800 bg-stone-100 px-1 rounded text-[11px]">backend/.env</code>. 
        No necesitas ser informático para entenderlo: cada línea es una opción con su valor.
      </Text>

      <SubTitle>Variables principales</SubTitle>
      <div className="bg-stone-50 rounded-lg p-4 mb-4 text-[12px] font-mono text-stone-600 space-y-2">
        <p><span className="text-stone-800">ANTHROPIC_API_KEY</span> — Clave para usar la IA de Claude. Sin ella, el sistema usa el modo automático con reglas básicas.</p>
        <p><span className="text-stone-800">GMAIL_CREDENTIALS_FILE</span> — Archivo de credenciales para conectar Gmail. Sin él, los emails se simulan con datos de ejemplo.</p>
        <p><span className="text-stone-800">EMAIL_ATENCION_CLIENTE</span> — Dirección desde la que se envían las respuestas a clientes.</p>
        <p><span className="text-stone-800">EMAIL_ESCALADO</span> — Dirección a la que llegan los correos que requieren intervención humana.</p>
        <p><span className="text-stone-800">HORA_EJECUCION_STOCK</span> — Hora a la que el sistema calcula las predicciones de stock cada día.</p>
        <p><span className="text-stone-800">DIAS_MARGEN_SEGURIDAD</span> — Días extra de stock que quieres mantener como colchón.</p>
        <p><span className="text-stone-800">SEMANAS_HISTORICO</span> — Cuántas semanas atrás mira el sistema para calcular la demanda.</p>
      </div>

      <HighlightBox icon={CheckCircle} title="¿Cómo empezar?">
        <p>Para probar el sistema no necesitas configurar nada. Simplemente:</p>
        <ol className="list-decimal pl-4 mt-1 space-y-0.5">
          <li>Abre una terminal en la carpeta del proyecto.</li>
          <li>Ejecuta <code className="text-stone-800 bg-stone-100 px-1 rounded text-[11px]">.\run.ps1</code> (Windows) o los comandos del README.</li>
          <li>El sistema arrancará solo con datos de ejemplo.</li>
        </ol>
      </HighlightBox>

      <HighlightBox icon={Info} title="Para producción">
        <p>Cuando tengas los datos reales de la empresa:</p>
        <ol className="list-decimal pl-4 mt-1 space-y-0.5">
          <li>Copia <code className="text-stone-800 bg-stone-100 px-1 rounded text-[11px]">backend/.env.example</code> como <code className="text-stone-800 bg-stone-100 px-1 rounded text-[11px]">backend/.env</code>.</li>
          <li>Rellena las claves y rutas que te proporcione el equipo técnico.</li>
          <li>Coloca los archivos CSV de ventas y productos de SAP en la carpeta <code className="text-stone-800 bg-stone-100 px-1 rounded text-[11px]">backend/data/</code>.</li>
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
    a: 'Revisa la sección de Emails IA para ver cuáles son. Si son reclamaciones o consultas complejas, es normal. Si ves muchas consultas simples escaladas, puede que la IA necesite ajustes. Contacta con el equipo técnico.'
  },
  {
    q: '¿Cómo sé si un producto va a faltar?',
    a: 'Ve a la sección "Stock y Predicción". Los productos con riesgo <Badge color="red">Crítica</Badge> son los más urgentes. La columna "Días restantes" te dice cuánto tiempo queda antes de que se agoten.'
  },
  {
    q: '¿Cada cuánto se actualizan los datos?',
    a: 'Los emails se procesan cada 10 minutos automáticamente. Las predicciones de stock se calculan una vez al día a la hora configurada (por defecto 07:30). También puedes forzar la actualización desde el Panel de control.'
  },
  {
    q: '¿Puedo usar el sistema sin conexión a internet?',
    a: 'Sí. El panel web funciona en tu navegador local y el backend en tu máquina. Mientras no configures servicios externos (Gmail, Claude), todo funciona con datos de ejemplo.'
  },
  {
    q: '¿Qué significa el color de la barra de confianza en los emails?',
    a: '<Badge color="emerald">Verde</Badge> (&ge;90%): la IA está muy segura. <Badge color="amber">Ámbar</Badge> (80-89%): bastante segura. <Badge color="red">Roja</Badge> (&lt;80%): poca confianza, probablemente se haya escalado a humano.'
  },
  {
    q: '¿Dónde están los datos de los clientes y productos?',
    a: 'En modo demo se generan automáticamente datos ficticios. En producción, los datos se importan desde los CSV que exportas de SAP Business One. No se almacena nada en la nube: todo está en tu máquina o servidor.'
  },
]

function PreguntasSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle size={20} className="text-stone-700" />
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
              <ChevronDown size={14} className={`text-stone-400 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} />
            </button>
            {openIndex === i && (
              <div className="px-4 pb-3 text-[12px] text-stone-600 leading-relaxed border-t border-stone-100 pt-3">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}
