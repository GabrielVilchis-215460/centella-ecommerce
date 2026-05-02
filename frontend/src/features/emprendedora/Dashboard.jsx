//import { Navigate } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import { useRef, useState, useEffect } from "react"
// import de iconos
import {
  IconBrandAsana,
  IconHeartHandshake,
  IconPackage,
  IconPointer,
  IconWallet,
  IconShoppingCart,
  IconHandFinger,
  IconDots,
  IconSettings,
  IconAward,
  IconRosetteDiscountCheck
} from "@tabler/icons-react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from "chart.js"
import { Line, Doughnut } from "react-chartjs-2"
// import de componentes generales y archivos de apoyo
import { Icon }          from "../../components/common/Icon"
import { DashboardCard } from "../../components/common/DashboardCard"
import { Header }        from "../../components/layout/Header"
import { Footer }        from "../../components/layout/Footer"
import { useAuth }       from "../../context/AuthContext"
import { useDashboard }  from "../../hooks/useEmprendedoraPanel"
import { emprendedoraService } from "../../services/emprendedoraService"

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, ArcElement, Filler
)

// ─── Colores canvas ───────────────────────────────────────────────────────────
const C = {
  line:       "#1F2937",          // negro/gris oscuro para la línea
  lineBg:     "rgba(31,41,55,0.06)",
  donutSold:  "#6366F1",
  donutRest:  "#EDE9FE",
  gridLine:   "#E5E7EB",
  textLight:  "#9CA3AF",
  tooltip: {
    bg:     "#FFFFFF",
    title:  "#9CA3AF",
    body:   "#1F2937",
    border: "#E5E7EB",
  },
}

// ─── Colores iconos métricas ──────────────────────────────────────────────────
const METRIC_STYLES = {
  saldo: {
    bg:    "#FEF2F2",
    color: "#EF4444",
  },
  pedidos: {
    bg:    "#FEF2F2",
    color: "#B91C1C",
  },
  visitas: {
    bg:    "#FFF1F2",
    color: "#E11D48",
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(valor) {
  if (valor == null) return "$0.00"
  return Number(valor).toLocaleString("es-MX", { style: "currency", currency: "MXN" })
}

function fmtFecha(iso) {
  if (!iso) return ""
  const [, m, d] = iso.split("-")
  const meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"]
  return `${parseInt(d)} ${meses[parseInt(m) - 1]}`
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-md bg-bg-dark ${className}`} />
}

// ─── Tarjeta métrica ──────────────────────────────────────────────────────────

function MetricCard({ icon, value, label, iconBg, iconColor }) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-bg-light p-4 shadow-sm">
      <div
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: iconBg }}
      >
        <Icon icon={icon} size={22} color={iconColor} />
      </div>
      <div>
        <p className="font-body text-lg font-bold text-text-dark leading-none">{value}</p>
        <p className="mt-0.5 text-sm text-text-light">{label}</p>
      </div>
    </div>
  )
}
function MenuEmprendimiento() {
  const [abierto, setAbierto] = useState(false)
  const [cargando, setCargando] = useState(null) // "insignia" | "verificacion" | null
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handlePagina = async () => {
    setCargando("pagina")
    try {
      await emprendedoraService.actualizarPagina()
    } finally {
      setCargando(null)
      setAbierto(false)
    }
  }

  const handleInsignia = async () => {
    setCargando("insignia")
    try {
      await emprendedoraService.solicitarInsignia()
    } finally {
      setCargando(null)
      setAbierto(false)
    }
  }

  const handleVerificacion = async () => {
    setCargando("verificacion")
    try {
      await emprendedoraService.solicitarVerificacion()
      alert("Solicitud de verificación enviada exitosamente")
    } catch (err) {
      alert(err?.response?.data?.detail || "Error al solicitar verificación")
    } finally {
      setCargando(null)
      setAbierto(false)
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setAbierto(!abierto)}
        className="rounded-full p-1 hover:bg-bg-dark transition-colors"
      >
        <Icon icon={IconDots} size={18} color="var(--color-text-light)" />
      </button>

      {abierto && (
        <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-72 rounded-xl
                        bg-bg-light shadow-lg p-2 flex flex-col">
          {/* CAMBIAR ESTO CUANDO HAYA UNA PAGINA DE LA EDICION DE PAGINA */}
          <button
            onClick={() => { navigate("/dashboard/GestionPagina"); setAbierto(false) }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-text-regular
                      hover:bg-bg-dark transition-colors text-left"
          >
            <Icon icon={IconSettings} size={18} color="var(--color-text-regular)" />
            Editar perfil de emprendimiento
          </button>

          <button
            onClick={handleInsignia}
            disabled={cargando === "insignia"}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-text-regular
                       hover:bg-bg-dark transition-colors text-left disabled:opacity-50"
          >
            <Icon icon={IconAward} size={18} color="var(--color-text-regular)" />
            {cargando === "insignia" ? "Solicitando..." : 'Solicitar insignia "Hecho en Juárez"'}
          </button>

          <button
            onClick={handleVerificacion}
            disabled={cargando === "verificacion"}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-text-regular
                       hover:bg-bg-dark transition-colors text-left disabled:opacity-50"
          >
            <Icon icon={IconRosetteDiscountCheck} size={18} color="var(--color-text-regular)" />
            {cargando === "verificacion" ? "Solicitando..." : "Solicitar verificación"}
          </button>
        </div>
      )}
    </div>
  )
}


// ─── Componente principal ─────────────────────────────────────────────────────

export function Dashboard() {
  const { usuario, cargando: cargandoAuth } = useAuth()
  const { cargando, error, emprendimiento, summary, ventas30d, topCantidad, topIngresos } = useDashboard()

  // Protección por rol
  if (!cargandoAuth && usuario?.tipo_usuario !== "emprendedora") {
    return <Navigate to="/" replace />
  }

  // ── Gráfica de línea ──────────────────────────────────────────────────────
  const lineData = {
    labels: ventas30d?.map((v) => fmtFecha(v.fecha)) || [],
    datasets: [{
      data:                 ventas30d?.map((v) => Number(v.total ?? 0)) || [],
      borderColor:          C.line,
      backgroundColor:      C.lineBg,
      borderWidth:          2,
      pointBackgroundColor: C.line,
      pointRadius:          4,
      pointHoverRadius:     6,
      tension:              0.4,
      fill:                 true,
    }],
  }

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: C.tooltip.bg,
        titleColor:      C.tooltip.title,
        bodyColor:       C.tooltip.body,
        bodyFont:        { weight: "bold" },
        borderColor:     C.tooltip.border,
        borderWidth:     1,
        callbacks: { label: (ctx) => fmt(ctx.raw) },
      },
    },
    scales: {
      x: {
        grid:   { display: false },
        ticks:  { font: { size: 10 }, color: C.textLight },
        border: { display: false },
      },
      y: {
        grid:   { color: C.gridLine, borderDash: [3, 3] },
        ticks:  { font: { size: 10 }, color: C.textLight },
        border: { display: false },
      },
    },
  }

  // ── Donut ─────────────────────────────────────────────────────────────────
  /*const totalCantidad = topCantidad?.reduce((s, p) => s + Number(p.total ?? 0), 0) || 0
  const totalIngresos = topIngresos?.reduce((s, p) => s + Number(p.total ?? 0), 0) || 0

  const donutDataConfig = {
    labels: ["Vendidos", "Ingresos"],
    datasets: [{
      data:            [totalCantidad, totalIngresos],
      backgroundColor: [C.donutSold, C.donutRest],
      borderWidth:     0,
      hoverOffset:     4,
    }],
  }*/
  const totalCantidad = topCantidad?.reduce((s, p) => s + Number(p.total ?? 0), 0) || 0
  const totalIngresos = topIngresos?.reduce((s, p) => s + Number(p.total ?? 0), 0) || 0

  const donutDataConfig = {
    labels: topCantidad?.map((p) => p.nombre) || [],
    datasets: [{
      data:            topCantidad?.map((p) => Number(p.total ?? 0)) || [],
      backgroundColor: [C.donutSold, C.donutRest, "#A5B4FC", "#818CF8", "#4F46E5"],
      borderWidth:     0,
      hoverOffset:     4,
    }],
  }

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "75%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          pointStyle:    "circle",
          boxWidth:      8,
          font:          { size: 10 },
          color:         "#6B7280",
          padding:       16,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.raw} uds. vendidas`,
        },
      },
    },
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="flex min-h-[60vh] items-center justify-center">
          <p className="text-error text-sm">{error}</p>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <Header />

       <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-10">

        {/* ── Encabezado ── */}
        <section className="flex items-center gap-4">
          {cargando ? (
            <>
              <Skeleton className="h-20 w-20 rounded-xl flex-shrink-0" />
              <Skeleton className="h-7 w-56" />
            </>
          ) : (
            <>
              {emprendimiento.logo_url ? (
                <img
                  src={emprendimiento.logo_url}
                  alt={emprendimiento.nombre}
                  className="h-20 w-20 flex-shrink-0 rounded-xl object-contain shadow-sm bg-white"
                />
              ) : (
                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center
                                rounded-xl bg-bg-dark text-text-light text-xs font-bold uppercase">
                  {(emprendimiento.nombre ?? "?").slice(0, 2)}
                </div>
              )}
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-xl font-bold text-text-dark">
                  {emprendimiento.nombre || "Mi emprendimiento"}
                </h1>
                <MenuEmprendimiento />
              </div>
            </>
          )}
        </section>

        {/* ── Métricas ── */}
        <section>
          <h2 className="text-md font-heading font-regular text-text-dark pb-2 border-b border-text-dark mb-5">Métricas</h2>

          {/* Labels de columna */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:items-start">
            <p className="text-sm font-body font-regular text-text-regular">Estado general</p>
            <p className="text-sm font-body font-regular text-text-regular">Ventas en los últimos 30 días</p>
            <p className="text-sm font-body font-regular text-text-regular">Top productos</p>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-6 md:grid-cols-3 md:items-stretch font-body">

            {/* Estado general */}
            <div className="space-y-3">
              {cargando ? (
                <>
                  <Skeleton className="h-16 rounded-xl" />
                  <Skeleton className="h-16 rounded-xl" />
                  <Skeleton className="h-16 rounded-xl" />
                </>
              ) : (
                <>
                  <MetricCard
                    icon={IconWallet}
                    value={fmt(summary?.saldo_actual)}
                    label="Saldo actual"
                    iconBg="var(--color-secondary)"
                    iconColor="white"
                  />
                  <MetricCard
                    icon={IconShoppingCart}
                    value={summary?.pedidos_activos ?? 0}
                    label="Pedidos activos"
                    iconBg="var(--color-primary)"
                    iconColor="white"
                  />
                  <MetricCard
                    icon={IconHandFinger}
                    value={(summary?.visitas_perfil ?? 0).toLocaleString()}
                    label="Visitas al perfil"
                    iconBg="var(--color-secondary)"
                    iconColor="white"
                  />
                </>
              )}
            </div>

            <div className="flex flex-col">
              <p className="text-sm text-text-light mb-3 md:hidden">Ventas en los últimos 30 días</p>
              <div className="flex-1 rounded-xl bg-bg-light p-4 shadow-sm min-h-[208px]">
                {cargando ? (
                  <Skeleton className="h-full w-full rounded-lg" />
                ) : lineData.datasets[0].data.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-text-light">
                    Sin ventas en los últimos 30 días
                  </div>
                ) : (
                  <div className="h-full w-full min-h-[176px]">
                    <Line data={lineData} options={lineOptions} />
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <p className="text-sm text-text-light mb-3 md:hidden">Top productos</p>
              <div className="flex-1 rounded-xl bg-bg-light p-4 shadow-sm min-h-[208px]">
                {cargando ? (
                  <Skeleton className="h-full w-full rounded-lg" />
                ) : totalCantidad === 0 && totalIngresos === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-sm text-text-light">Sin productos</p>
                  </div>
                ) : (
                  <div className="relative flex h-full w-full min-h-[176px] items-center justify-center">
                    <div className="absolute top-[30%] flex flex-col items-center pointer-events-none z-10">
                      <span className="text-[17px] font-bold text-text-dark leading-none">
                        {totalCantidad.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-text-light mt-1">
                        ventas totales
                      </span>
                    </div>
                    <Doughnut data={donutDataConfig} options={donutOptions} />
                  </div>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* ── Acciones ── */}
        <section>
          <h2 className="text-md font-heading font-regular text-text-dark pb-2 border-b border-text-dark mb-5">Acciones</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <DashboardCard icon={IconBrandAsana}     label="Gestión de productos"     to="/dashboard/productos" />
            <DashboardCard icon={IconHeartHandshake} label="Gestión de servicios"     to="/dashboard/servicios" />
            <DashboardCard icon={IconPackage}        label="Gestión de pedidos"       to="/dashboard/pedidos"   />
            <DashboardCard icon={IconPointer}        label="Página de emprendimiento" to="/dashboard/pagina"    />
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}