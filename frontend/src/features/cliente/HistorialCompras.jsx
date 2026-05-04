import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  IconSearch, IconFilter, IconPackage,
  IconTruck, IconMapPin,
  IconX,
} from "@tabler/icons-react"
import { Icon } from "../../components/common/Icon"
import { StatusBadge } from "../../components/common/StatusBadge"
import { Header } from "../../components/layout/Header"
import { Footer } from "../../components/layout/Footer"
import { usePedidos } from "../../hooks/usePedidos"

const ESTADOS = [
  { value: "",           label: "Todos los estados" },
  { value: "pendiente",  label: "Pendiente"         },
  { value: "confirmado", label: "Confirmado"        },
  { value: "enviado",    label: "Enviado"            },
  { value: "entregado",  label: "Entregado"         },
  { value: "cancelado",  label: "Cancelado"         },
]

const STATUS_MAP = {
  pendiente:  { texto: "Pendiente",  color: "gray"   },
  confirmado: { texto: "Confirmado", color: "orange" },
  enviado:    { texto: "Enviado",    color: "blue"   },
  entregado:  { texto: "Entregado",  color: "green"  },
  cancelado:  { texto: "Cancelado",  color: "red"    },
}

// Ícono y label según tipo de entrega del backend
const ENTREGA_MAP = {
  envio:   { icon: IconTruck,       label: "Envío a domicilio" },
  fisica:  { icon: IconMapPin,      label: "Recogida en punto" }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
const formatOrderId = (idPedido, fechaPedido) => {
  const date = fechaPedido ? new Date(fechaPedido) : new Date()
  const y  = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const dd = String(date.getDate()).padStart(2, "0")
  return `ORD-${y}-${mm}-${dd}-${String(idPedido).padStart(4, "0")}`
}

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("es-MX", {
    day: "numeric", month: "long", year: "numeric",
  })

const formatCurrency = (amount) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency", currency: "MXN", minimumFractionDigits: 2,
  }).format(amount ?? 0)

function OrderCard({ pedido }) {
  const navigate     = useNavigate()
  const visibleItems = pedido.items?.slice(0, 3) ?? []
  const extraCount   = (pedido.items?.length ?? 0) - visibleItems.length
  const orderId      = formatOrderId(pedido.id_pedido, pedido.fecha_pedido)
  const badge        = STATUS_MAP[pedido.estado] ?? { texto: pedido.estado, color: "gray" }
  const entrega      = ENTREGA_MAP[pedido.tipo_entrega]

  // URL de rastreo de Envia.com
  const trackUrl = pedido.numero_rastreo
    ? `https://dev.envia.com/es-MX/tracking?label=${pedido.numero_rastreo}`
    : null

  return (
    <article
      onClick={() => navigate(`/pedidos/${pedido.id_pedido}`)}
      className="bg-bg border border-bg-dark/10 rounded-xl p-4 cursor-pointer
                 transition-all duration-fast hover:border-bg-dark/25 hover:shadow-sm
                 active:scale-[0.995]"
    >
      {/* Cabecera: ID + estado + chevron */}
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-text-dark font-body">
            {orderId}
          </span>
          <StatusBadge {...badge} />
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <p className="text-base text-text-light mb-0.5">Total</p>
            <p className="text-sm font-semibold text-text-dark">
              {formatCurrency(pedido.total)}
            </p>
          </div>
          {/*<Icon icon={IconChevronRight} size={18} className="text-text-light" />*/}
        </div>
      </div>

      {/* Fecha + tipo de entrega */}
      <div className="flex items-center gap-3 mb-3">
        {pedido.fecha_pedido && (
          <p className="text-xs text-text-light">
            {formatDate(pedido.fecha_pedido)}
          </p>
        )}
        {entrega && (
          <span className="flex items-center gap-1 text-xs text-text-light">
            <Icon icon={entrega.icon} size={12} />
            {entrega.label}
          </span>
        )}
      </div>
      {/* Rastreo como link — solo si tiene número y es envío */}
      {trackUrl && (
        <div className="mt-3 pt-3 border-t border-bg-dark/10">
          <a
            href={trackUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 text-xs text-primary
                       underline underline-offset-2 hover:opacity-70 transition-opacity"
          >
            <Icon icon={IconTruck} size={13} />
            Rastrear envío · {pedido.numero_rastreo}
          </a>
        </div>
      )}
    </article>
  )
}

function CardSkeleton() {
  return (
    <div className="bg-bg border border-bg-dark/10 rounded-xl p-4 animate-pulse">
      <div className="flex justify-between mb-2">
        <div className="flex gap-2">
          <div className="h-4 w-40 rounded bg-bg-dark/10" />
          <div className="h-4 w-20 rounded-full bg-bg-dark/10" />
        </div>
        <div className="h-4 w-20 rounded bg-bg-dark/10" />
      </div>
      <div className="h-3 w-28 rounded bg-bg-dark/10 mb-3" />
      <div className="flex gap-2">
        <div className="w-14 h-14 rounded-md bg-bg-dark/10" />
        <div className="w-14 h-14 rounded-md bg-bg-dark/10" />
      </div>
    </div>
  )
}

export function HistorialCompras() {
  const {
    pedidos, cargando, error, refetch,
    estado, setEstado,
  } = usePedidos()

  const [busqueda, setBusqueda] = useState("")

  const hayFiltros = busqueda.trim() || estado

  const pedidosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return pedidos
    const q = busqueda.toLowerCase()
    return pedidos.filter((p) => {
      const idStr   = String(p.id_pedido)
      const rastreo = (p.numero_rastreo ?? "").toLowerCase()
      const nombres = (p.items ?? []).map((it) => it.nombre.toLowerCase()).join(" ")
      return idStr.includes(q) || rastreo.includes(q) || nombres.includes(q)
    })
  }, [pedidos, busqueda])

  const limpiarFiltros = () => {
    setBusqueda("")
    setEstado("")
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Header />
      <main className="bg-bg-light min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">

          {/* Encabezado */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-text-dark font-heading mb-1">
              Historial de compras
            </h1>
            <p className="text-base text-text-regular">
              Gestiona y revisa tus compras
            </p>
          </div>

          {/* Búsqueda + filtro */}
          <div className="flex gap-2 mb-2">
            <div className="relative flex-1">
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Icon icon={IconSearch} size={16} />
              </span>
              <input
                type="text"
                placeholder="Buscar por número de pedido o producto"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-bg-dark/15
                           bg-bg text-text-dark placeholder:text-text-light
                           focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                           transition-colors"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Icon icon={IconFilter} size={16} color="var(--color-aux)" />
              </span>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm rounded-lg border border-bg-dark/15
                           bg-bg text-text-dark appearance-none cursor-pointer
                           focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                           transition-colors"
              >
                {ESTADOS.map((e) => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Contador de resultados + limpiar filtros */}
          <div className="flex items-center justify-between mb-4 min-h-[20px]">
            {!cargando && !error && (
              <p className="text-xs text-text-light">
                {pedidosFiltrados.length}{" "}
                {pedidosFiltrados.length === 1 ? "pedido encontrado" : "pedidos encontrados"}
              </p>
            )}
            {hayFiltros && (
              <button
                onClick={limpiarFiltros}
                className="ml-auto flex items-center gap-1 text-xs text-text-light
                           hover:text-text-regular transition-colors"
              >
                <Icon icon={IconX} size={12} />
                Limpiar filtros
              </button>
            )}
          </div>
          {/* Loading */}
          {cargando && (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => <CardSkeleton key={n} />)}
            </div>
          )}
          {/* Error */}
          {error && !cargando && (
            <div className="text-center py-12">
              <p className="text-sm text-error mb-3">{error}</p>
              <button
                onClick={refetch}
                className="text-sm text-primary underline underline-offset-2"
              >
                Intentar de nuevo
              </button>
            </div>
          )}

          {/* Vacío */}
          {!cargando && !error && pedidosFiltrados.length === 0 && (
            <div className="text-center py-16">
              <Icon icon={IconPackage} size={40} className="mx-auto mb-3 text-text-light" />
              <p className="text-sm text-text-regular mb-4">
                {hayFiltros
                  ? "No se encontraron pedidos con ese criterio."
                  : "Aún no tienes pedidos."}
              </p>
              {!hayFiltros && (
                <a
                  href="/catalogo"
                  className="inline-flex items-center gap-1.5 text-sm text-primary
                             underline underline-offset-2 hover:opacity-70 transition-opacity"
                >
                  Explorar el catálogo
                </a>
              )}
              {hayFiltros && (
                <button
                  onClick={limpiarFiltros}
                  className="text-sm text-primary underline underline-offset-2"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          )}
          {/* Lista */}
          {!cargando && !error && pedidosFiltrados.length > 0 && (
            <div className="space-y-3">
              {pedidosFiltrados.map((pedido) => (
                <OrderCard key={pedido.id_pedido} pedido={pedido} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}