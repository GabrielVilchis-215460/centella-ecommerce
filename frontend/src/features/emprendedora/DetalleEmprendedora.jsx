import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
  IconChevronLeft,
  IconChevronRight,
  IconRosette,
  IconShieldCheck,
  IconDots,
  IconArrowLeft,
  IconCarambola
} from "@tabler/icons-react"
import { Icon }                    from "../../components/common/Icon"
import { Header }                  from "../../components/layout/Header"
import { Footer }                  from "../../components/layout/Footer"
import { ProductCard }             from "../../components/common/ProductCard"
import { usePaginaEmprendimiento } from "../../hooks/usePaginaEmprendimiento"
import { ServiceCard } from "../../components/common/ServiceCard"

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-md bg-bg-dark ${className}`} />
}

// ─── Encabezado ───────────────────────────────────────────────────────────────

function EncabezadoEmprendedora({ logoUrl, nombreNegocio, etiquetas, rating, insignia, cargando }) {
  const navigate = useNavigate()

  if (cargando) {
    return (
      <div className="flex items-start gap-5 py-6 px-6">
        <Skeleton className="h-24 w-24 rounded-xl flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-5 py-6 px-6">
      {/* Flecha volver */}
      <button
        onClick={() => window.history.back()}
        className="flex-shrink-0 mt-2 hover:opacity-70 transition-opacity"
      >
        <Icon icon={IconArrowLeft} size={20} color="var(--color-text-regular)" />
      </button>

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
              <div className="flex items-center gap-1">
                <Icon icon={IconCarambola} size={14} color="var(--color-text-light)" />
                <span className="font-body text-sm text-text-light">
                  {Number(rating.promedio_vendedora ?? 0).toFixed(1)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Carrusel productos ───────────────────────────────────────────────────────

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

  if (!productos.length) return null

  return (
    <div className="relative">
      <button
        onClick={() => scroll(-1)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-bg-light shadow-md
                   rounded-full p-1 hover:bg-bg-dark transition-colors"
      >
        <Icon icon={IconChevronLeft} size={20} color="var(--color-text-regular)" />
      </button>
      <div ref={ref} className="flex gap-4 overflow-x-auto scrollbar-hide px-8 scroll-smooth">
        {productos.map((p) => (
          <div key={p.id_producto} className="flex-shrink-0 w-48">
            <ProductCard
              nombre={p.nombre}
              precio={Number(p.precio)}
              calificacion={Number(p.calificacion_promedio ?? 0)}
              imagen={p.imagen_url ?? null}
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

function CarruselServicios({ servicios, cargando, colorNegocio }) {
  const ref = useRef(null)
  const scroll = (dir) => {
    if (ref.current) ref.current.scrollBy({ left: dir * 220, behavior: "smooth" })
  }

  if (cargando) {
    return (
      <div className="flex gap-4 overflow-hidden px-6">
        {[1,2,3].map((i) => <Skeleton key={i} className="h-40 w-48 flex-shrink-0 rounded-xl" />)}
      </div>
    )
  }

  if (!servicios.length) return null

  return (
    <div className="relative">
      <button
        onClick={() => scroll(-1)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-bg-light shadow-md
                   rounded-full p-1 hover:bg-bg-dark transition-colors"
      >
        <Icon icon={IconChevronLeft} size={20} color="var(--color-text-regular)" />
      </button>
      <div ref={ref} className="flex gap-4 overflow-x-auto scrollbar-hide px-8 scroll-smooth">
        {servicios.map((s) => (
          <div key={s.id_servicio} className="flex-shrink-0 w-56">
            <ServiceCard
              nombre={s.nombre}
              descripcion={s.descripcion}
              precio={Number(s.precio)}
              calificacion={Number(s.calificacion_promedio ?? 0)}
              categoria={s.nombre_categoria}
              color={colorNegocio}
              onClick={() => {}}
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

export function DetalleEmprendedora() {
  const {
    cargando, error,
    nombreNegocio, logoUrl, insignia,
    etiquetas, rating, htmlContenido, productos, servicios
  } = usePaginaEmprendimiento()

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
      <main className="mx-auto max-w-7xl px-6 py-4 space-y-6">
        {/* Encabezado */}
        <EncabezadoEmprendedora
          logoUrl={logoUrl}
          nombreNegocio={nombreNegocio}
          etiquetas={etiquetas}
          rating={rating}
          insignia={insignia}
          cargando={cargando}
        />
        {/* Bloques */}
        {cargando ? (
          <div className="space-y-4 px-6">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ) : htmlContenido ? (
          <div
            className="px-6 prose prose-sm max-w-none font-body text-text-regular"
            dangerouslySetInnerHTML={{ __html: htmlContenido }}
          />
        ) : null}

        {/* Productos */}
        {(cargando || productos.length > 0) && (
          <div className="space-y-3">
            <h2 className="font-heading text-md font-semibold text-text-dark px-6">Productos</h2>
            <hr className="border-bg-dark mx-6" />
            <CarruselProductos productos={productos} cargando={cargando} />
          </div>
        )}

        {/* Servicios */}
        {(cargando || servicios.length > 0) && (
          <div className="space-y-3">
            <h2 className="font-heading text-md font-semibold text-text-dark px-6">Servicios</h2>
            <hr className="border-bg-dark mx-6" />
            <CarruselServicios servicios={servicios} cargando={cargando} />
          </div>
        )}
      </main>

      <Footer />
    </>
  )
}