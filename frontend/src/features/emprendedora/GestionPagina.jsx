import { useRef } from "react"
import { Navigate } from "react-router-dom"
import {
  IconChevronLeft,
  IconChevronRight,
  IconRosette,
  IconShieldCheck,
  IconPlus,
  IconTrash,
  IconDeviceFloppy,
} from "@tabler/icons-react"
import { Icon }            from "../../components/common/Icon"
import { Header }          from "../../components/layout/Header"
import { Footer }          from "../../components/layout/Footer"
import { ProductCard }     from "../../components/common/ProductCard"
import { useAuth }         from "../../context/AuthContext"
import { useGestionPagina } from "../../hooks/useGestionPagina"

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-md bg-bg-dark ${className}`} />
}

// ─── Encabezado ───────────────────────────────────────────────────────────────

function EncabezadoEmprendedora({ logoUrl, nombreNegocio, etiquetas, rating, insignia, cargando }) {
  if (cargando) {
    return (
      <div className="flex items-start gap-5 py-6 px-6">
        <Skeleton className="h-24 w-24 rounded-xl flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-5 py-6 px-6">
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={nombreNegocio}
          className="h-24 w-24 flex-shrink-0 rounded-xl object-contain bg-white shadow-sm p-1"
        />
      ) : (
        <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center
                        rounded-xl bg-bg-dark text-text-light text-sm font-bold uppercase">
          {(nombreNegocio ?? "?").slice(0, 2)}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="font-heading text-xl font-bold text-text-dark">{nombreNegocio}</h1>
          {insignia && <Icon icon={IconRosette} size={18} color="var(--color-primary)" />}
          {rating?.promedio_vendedora >= 4 && (
            <Icon icon={IconShieldCheck} size={18} color="var(--color-states-green)" />
          )}
        </div>

        {etiquetas.length > 0 && (
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {etiquetas.map((e, i) => (
              <span key={e} className="font-body text-sm text-text-light">
                {e}{i < etiquetas.length - 1 && <span className="ml-2">•</span>}
              </span>
            ))}
            {rating && (
              <>
                <span className="text-text-light text-sm">•</span>
                <span className="font-body text-sm text-text-light">
                  ☆ {Number(rating.promedio_vendedora ?? 0).toFixed(1)}
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Bloque de texto editable ─────────────────────────────────────────────────

function BloqueEditable({ bloqueKey, texto, onChange, onEliminar }) {
  return (
    <div className="rounded-xl bg-bg-light shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-bg-dark">
        <span className="font-body text-xs text-text-light uppercase tracking-wide">
          {bloqueKey}
        </span>
        <button
          onClick={() => onEliminar(bloqueKey)}
          className="flex items-center gap-1 text-xs text-error hover:opacity-70 transition-opacity"
        >
          <Icon icon={IconTrash} size={14} color="var(--color-error)" />
          Eliminar
        </button>
      </div>

      {/* Textarea */}
      <textarea
        value={texto}
        onChange={(e) => onChange(bloqueKey, e.target.value)}
        placeholder="Escribe tu texto aquí..."
        rows={4}
        className="w-full px-4 py-3 font-body text-sm text-text-regular bg-transparent
                   resize-none outline-none placeholder:text-text-light leading-relaxed"
      />
    </div>
  )
}

// ─── Carrusel de productos ────────────────────────────────────────────────────

function CarruselProductos({ productos, cargando }) {
  const ref = useRef(null)

  const scroll = (dir) => {
    if (ref.current) ref.current.scrollBy({ left: dir * 220, behavior: "smooth" })
  }

  if (cargando) {
    return (
      <div className="flex gap-4 overflow-hidden px-6">
        {[1,2,3,4].map((i) => <Skeleton key={i} className="h-56 w-48 flex-shrink-0 rounded-xl" />)}
      </div>
    )
  }

  if (!productos.length) {
    return (
      <p className="px-6 text-sm text-text-light">No tienes productos activos aún.</p>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => scroll(-1)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-bg-light shadow-md
                   rounded-full p-1 hover:bg-bg-dark transition-colors"
      >
        <Icon icon={IconChevronLeft} size={20} color="var(--color-text-regular)" />
      </button>

      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto scrollbar-hide px-8 scroll-smooth"
      >
        {productos.map((p) => (
          <div key={p.id_producto} className="flex-shrink-0 w-48">
            <ProductCard
              nombre={p.nombre}
              precio={Number(p.precio)}
              calificacion={Number(p.calificacion_promedio ?? 0).toFixed(1)}
              imagen={p.imagen_url ?? ""}
              onAgregar={() => {}}
            />
          </div>
        ))}
      </div>

      <button
        onClick={() => scroll(1)}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-bg-light shadow-md
                   rounded-full p-1 hover:bg-bg-dark transition-colors"
      >
        <Icon icon={IconChevronRight} size={20} color="var(--color-text-regular)" />
      </button>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function GestionPagina() {
  const { usuario, cargando: cargandoAuth } = useAuth()
  const {
    cargando, guardando, error,
    nombreNegocio, logoUrl, insignia,
    etiquetas, rating,
    bloques, productos,
    agregarBloque, actualizarBloque, eliminarBloque, guardarCambios,
  } = useGestionPagina()

  // Protección por rol
  if (!cargandoAuth && usuario?.tipo_usuario !== "emprendedora") {
    return <Navigate to="/" replace />
  }

  const listaBloques = Object.entries(bloques).sort(([a], [b]) => {
    const na = parseInt(a.replace("bloque", ""))
    const nb = parseInt(b.replace("bloque", ""))
    return na - nb
  })

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
    <>
      <Header />

      <main className="mx-auto max-w-3xl px-0 py-4 space-y-6 bg-bg">

        {/* Encabezado */}
        <EncabezadoEmprendedora
          logoUrl={logoUrl}
          nombreNegocio={nombreNegocio}
          etiquetas={etiquetas}
          rating={rating}
          insignia={insignia}
          cargando={cargando}
        />

        {/* Botón guardar cambios */}
        <div className="flex justify-end px-6">
          <button
            onClick={guardarCambios}
            disabled={guardando}
            className="flex items-center gap-2 bg-primary text-white font-body text-sm
                       px-4 py-2 rounded-lg hover:opacity-90 transition-opacity
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon icon={IconDeviceFloppy} size={16} color="white" />
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>

        {/* Bloques editables */}
        {cargando ? (
          <div className="space-y-4 px-6">
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
        ) : (
          <div className="space-y-4 px-6">
            {listaBloques.map(([key, texto]) => (
              <BloqueEditable
                key={key}
                bloqueKey={key}
                texto={texto}
                onChange={actualizarBloque}
                onEliminar={eliminarBloque}
              />
            ))}

            {/* Agregar bloque */}
            <button
              onClick={agregarBloque}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl
                         border-2 border-dashed border-bg-dark text-text-light text-sm
                         hover:border-primary hover:text-primary transition-colors font-body"
            >
              <Icon icon={IconPlus} size={16} color="currentColor" />
              Agregar bloque
            </button>
          </div>
        )}

        {/* Productos */}
        <div className="space-y-3">
          <h2 className="font-heading text-md font-semibold text-text-dark px-6">
            Productos
          </h2>
          <hr className="border-bg-dark mx-6" />
          <CarruselProductos productos={productos} cargando={cargando} />
        </div>

      </main>

      <Footer />
    </>
  )
}