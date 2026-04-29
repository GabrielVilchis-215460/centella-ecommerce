import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  IconPackage,
  IconHeartHandshake,
  IconShoppingBag,
  IconCursorText,
  IconWallet,
  IconShoppingCart,
  IconEye,
  IconDots,
} from "@tabler/icons-react"

// Nuevas importaciones de Chart.js
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
  Filler
} from "chart.js"
import { Line, Doughnut } from "react-chartjs-2"

import { Icon }         from "../../components/common/Icon"
import { useDashboard } from "../../hooks/useEmprendedoraPanel"

// Registrar los elementos de ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
)

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(valor) {
  if (valor == null) return "$0.00"
  return Number(valor).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  })
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

function MetricCard({ icon, value, label, iconBg = "bg-primary/10" }) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-bg-light p-4 shadow-sm">
      <div className={`flex h-11 w-11 items-center justify-center rounded-full ${iconBg}`}>
        <Icon icon={icon} size={22} color="var(--color-primary)" />
      </div>
      <div>
        <p className="font-heading text-lg font-bold text-text-dark leading-none">{value}</p>
        <p className="mt-0.5 text-sm text-text-light">{label}</p>
      </div>
    </div>
  )
}

// ─── Tarjeta acción ───────────────────────────────────────────────────────────

function ActionCard({ icon, label, ruta }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(ruta)}
      className="flex flex-col items-start gap-3 rounded-xl bg-bg-light p-5 shadow-sm
                 transition-all duration-normal hover:shadow-md hover:-translate-y-0.5
                 focus:outline-none focus:ring-2 focus:ring-primary/40 w-full text-left"
    >
      <Icon icon={icon} size={24} color="var(--color-text-regular)" />
      <span className="text-sm font-medium text-text-regular">{label}</span>
    </button>
  )
}

// ─── Colores donut ────────────────────────────────────────────────────────────

const DONUT_COLORS = [
  "var(--color-primary)",
  "var(--color-aux)",
  "var(--color-secondary)",
  "var(--color-states-blue)",
  "var(--color-states-orange)",
]

// ─── Componente principal ─────────────────────────────────────────────────────

export function Dashboard() {
  const { cargando, error, summary, ventas30d, topCantidad, topIngresos } = useDashboard()
  const [modoDonut, setModoDonut] = useState("cantidad") 

  // Configuración de datos para la Gráfica de Línea
  const lineData = {
    labels: ventas30d?.map((v) => fmtFecha(v.fecha)) || [],
    datasets: [
      {
        label: "Total",
        data: ventas30d?.map((v) => Number(v.total ?? 0)) || [],
        borderColor: "var(--color-primary)",
        backgroundColor: "var(--color-primary)",
        borderWidth: 2,
        pointBackgroundColor: "var(--color-primary)",
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: 0.4, // Efecto "monotone"
      },
    ],
  }

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "var(--color-bg-light)",
        titleColor: "var(--color-text-light)",
        bodyColor: "var(--color-primary)",
        bodyFont: { weight: "bold" },
        borderColor: "var(--color-bg-dark)",
        borderWidth: 1,
        callbacks: {
          label: (context) => fmt(context.raw),
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 }, color: "var(--color-text-light)" },
        border: { display: false },
      },
      y: {
        grid: {
          color: "var(--color-bg-dark)",
          borderDash: [3, 3],
        },
        ticks: { font: { size: 10 }, color: "var(--color-text-light)" },
        border: { display: false },
      },
    },
  }

  // Configuración de datos para la Donut
  const donutRaw  = modoDonut === "cantidad" ? topCantidad : topIngresos
  const totalDonut = donutRaw?.reduce((s, p) => s + Number(p.total ?? 0), 0) || 0

  const donutDataConfig = {
    labels: donutRaw?.map((p) => p.nombre) || [],
    datasets: [
      {
        data: donutRaw?.map((p) => Number(p.total ?? 0)) || [],
        backgroundColor: DONUT_COLORS,
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
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
          boxWidth: 8,
          font: { size: 10 },
          color: "var(--color-text-regular)",
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const val = context.raw
            return modoDonut === "ingresos" ? ` ${fmt(val)}` : ` ${val} uds.`
          },
        },
      },
    },
  }

  if (error) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <p className="text-error text-sm">{error}</p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-8 space-y-8">

      {/* ── Encabezado ── */}
      <section className="flex items-center gap-4">
        {cargando ? (
          <>
            <Skeleton className="h-20 w-20 rounded-xl flex-shrink-0" />
            <Skeleton className="h-7 w-56" />
          </>
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-xl font-bold text-text-dark">
              Mi emprendimiento
            </h1>
            <button className="rounded-full p-1 hover:bg-bg-dark transition-colors">
              <Icon icon={IconDots} size={18} color="var(--color-text-light)" />
            </button>
          </div>
        )}
      </section>

      {/* ── Métricas ── */}
      <section>
        <h2 className="font-heading text-md font-semibold text-text-dark mb-1">Métricas</h2>
        <hr className="border-bg-dark mb-5" />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

          {/* Estado general */}
          <div className="space-y-3">
            <p className="text-sm text-text-light">Estado general</p>
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
                  iconBg="bg-primary/10"
                />
                <MetricCard
                  icon={IconShoppingCart}
                  value={summary?.pedidos_activos ?? 0}
                  label="Pedidos activos"
                  iconBg="bg-states-red/10"
                />
                <MetricCard
                  icon={IconEye}
                  value={(summary?.visitas_perfil ?? 0).toLocaleString()}
                  label="Visitas al perfil"
                  iconBg="bg-primary/10"
                />
              </>
            )}
          </div>

          {/* Gráfica ventas 30 días */}
          <div>
            <p className="text-sm text-text-light mb-3">Ventas en los últimos 30 días</p>
            <div className="rounded-xl bg-bg-light p-4 shadow-sm h-52">
              {cargando ? (
                <Skeleton className="h-full w-full rounded-lg" />
              ) : lineData.datasets[0].data.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-text-light">
                  Sin ventas en los últimos 30 días
                </div>
              ) : (
                <div className="h-full w-full">
                  <Line data={lineData} options={lineOptions} />
                </div>
              )}
            </div>
          </div>

          {/* Donut top productos */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-text-light">Top productos</p>
              <div className="flex rounded-lg overflow-hidden border border-bg-dark text-xs">
                <button
                  onClick={() => setModoDonut("cantidad")}
                  className={`px-2 py-1 transition-colors ${
                    modoDonut === "cantidad"
                      ? "bg-primary text-white"
                      : "bg-bg-light text-text-light hover:bg-bg-dark"
                  }`}
                >
                  Cantidad
                </button>
                <button
                  onClick={() => setModoDonut("ingresos")}
                  className={`px-2 py-1 transition-colors ${
                    modoDonut === "ingresos"
                      ? "bg-primary text-white"
                      : "bg-bg-light text-text-light hover:bg-bg-dark"
                  }`}
                >
                  Ingresos
                </button>
              </div>
            </div>

            <div className="rounded-xl bg-bg-light p-4 shadow-sm h-52">
              {cargando ? (
                <Skeleton className="h-full w-full rounded-lg" />
              ) : donutDataConfig.labels.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-text-light">Sin productos</p>
                </div>
              ) : (
                <div className="relative flex h-full w-full items-center justify-center">
                  {/* Contenedor central absoluto para simular las etiquetas SVG de Recharts */}
                  <div className="absolute top-[38%] flex flex-col items-center pointer-events-none">
                    <span className="text-[17px] font-bold text-text-dark leading-none">
                      {modoDonut === "ingresos" ? fmt(totalDonut) : totalDonut.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-text-light mt-1">
                      {modoDonut === "cantidad" ? "uds. vendidas" : "en ingresos"}
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
        <h2 className="font-heading text-md font-semibold text-text-dark mb-1">Acciones</h2>
        <hr className="border-bg-dark mb-5" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <ActionCard icon={IconPackage}        label="Gestión de productos"     ruta="/dashboard/productos" />
          <ActionCard icon={IconHeartHandshake} label="Gestión de servicios"     ruta="/dashboard/servicios" />
          <ActionCard icon={IconShoppingBag}    label="Gestión de pedidos"       ruta="/dashboard/pedidos"   />
          <ActionCard icon={IconCursorText}     label="Página de emprendimiento" ruta="/dashboard/pagina"    />
        </div>
      </section>

    </main>
  )
}