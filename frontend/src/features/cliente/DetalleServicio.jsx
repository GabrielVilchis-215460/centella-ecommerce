import { useRef, useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import {
  IconArrowLeft, IconDots, IconFlag,
  IconStar, IconRosetteDiscountCheck,
  IconChevronLeft, IconChevronRight,
} from "@tabler/icons-react"
import { Header }             from "../../components/layout/Header"
import { Footer }             from "../../components/layout/Footer"
import { Icon }               from "../../components/common/Icon"
import { ResenaModal }        from "../../components/common/ResenaModal"
import { ResenasSection }     from "../../components/common/ResenasSection"
import { ServiceCard }        from "../../components/common/ServiceCard"
import { useDetalleServicio } from "../../hooks/useDetalleServicio"

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-md bg-bg-dark ${className}`} />
}

export function DetalleServicio() {
  const navigate    = useNavigate()
  const reportarRef = useRef(null)
  const carruselRef = useRef(null)
  const [reportarAbierto, setReportarAbierto] = useState(false)

  const {
    servicio, resenas, cargando, error,
    ordenResenas, setOrdenResenas,
    modalResena, setModalResena,
    promedioCalificacion,
    promedioEmprendedora,
    esCliente, yaReseno,
  } = useDetalleServicio()

  useEffect(() => {
    const handler = (e) => {
      if (reportarRef.current && !reportarRef.current.contains(e.target))
        setReportarAbierto(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

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

      <main className=" relative mx-auto max-w-5xl px-6 py-8 flex flex-col gap-10">

        {cargando ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <>
            {/* ── Encabezado ── */}
            <div className="flex flex-col gap-3">

              <div className="flex items-start justify-between gap-4">

                {/* Izquierda: flecha + nombre + estrellas + opciones */}
                <div className="flex items-center gap-4 flex-wrap">
                  <button
                    onClick={() => navigate(-1)}
                    className="absolute -left-20 top-10 text-text-light hover:text-text-dark transition-colors"
                  >
                    <IconArrowLeft size={28} stroke={1.5} />
                  </button>

                  <h1 className="font-heading text-xl text-text-dark">{servicio.nombre}</h1>

                  <div className="flex items-center pl-2 gap-1">
                    <IconStar size={20} color="var(--color-text-light)" />
                    <span className="font-body text-md text-text-light pt-0.5">{promedioCalificacion}</span>
                  </div>

                  <div className="relative" ref={reportarRef}>
                    <button
                      onClick={() => setReportarAbierto(!reportarAbierto)}
                      className="text-text-light hover:text-text-dark transition-colors align-sub"
                    >
                      <IconDots size={20} stroke={1.5} />
                    </button>
                    {reportarAbierto && (
                      <div className="absolute left-0 top-[calc(100%+4px)] bg-bg-light rounded-md shadow-lg z-50 w-36 overflow-hidden">
                        <button
                          onClick={() => setReportarAbierto(false)}
                          className="flex items-center gap-2 w-full px-4 py-3 font-body text-sm text-text-regular hover:bg-bg-dark transition-colors"
                        >
                          <IconFlag size={16} stroke={1.5} />
                          Reportar
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Derecha: botón agendar */}
                {servicio.enlace_reservacion && (
                <a
                    href={servicio.enlace_reservacion}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 px-10 py-2 bg-primary text-white font-body text-base rounded-xl hover:bg-aux transition-colors"
                  >
                    Agendar
                  </a>
                )}
              </div>

              <p className="font-body text-lg text-text-dark">${servicio.precio.toFixed(2)}</p>

              {servicio.descripcion && (
                <p className="font-body text-base text-text-regular leading-relaxed">
                  {servicio.descripcion}
                </p>
              )}

            </div>

            <div className="border-t border-text-light/20" />

            {/* ── Sobre la emprendedora ── */}
            {servicio.emprendedora && (
              <div className="flex flex-col gap-3">
                <h2 className="font-heading text-xl text-text-dark">Sobre la emprendedora</h2>

                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    to={`/catalogo/emprendedora/${servicio.emprendedora.id_emprendedora}`}
                    className="font-body text-base text-text-regular hover:text-primary transition-colors"
                  >
                    {servicio.emprendedora.nombre_negocio}
                  </Link>
                  <span className="text-text-light">•</span>
                  <span className="font-body text-base text-text-light">
                    {servicio.emprendedora.nombre_vendedora}
                  </span>
                  {servicio.emprendedora.verificada && (
                    <IconRosetteDiscountCheck size={18} color="var(--color-text-regular)" />
                  )}
                  <span className="text-text-light">•</span>
                  <div className="flex items-center gap-1">
                    <IconStar size={14} color="var(--color-text-light)" />
                    <span className="font-body text-sm text-text-light">{promedioEmprendedora}</span>
                  </div>
                </div>

                {servicio.emprendedora.descripcion_negocio && (
                  <p className="font-body text-base text-text-regular leading-relaxed">
                    {servicio.emprendedora.descripcion_negocio}
                  </p>
                )}
              </div>
            )}

            {/* ── Otros servicios ── */}
            {servicio.otros_servicios?.length > 0 && (
              <>
                <div className="border-t border-text-light/20" />
                <div className="flex flex-col gap-4">
                  <h2 className="font-heading text-xl text-text-dark">Otros servicios</h2>
                  <div className="relative">
                    <button
                      onClick={() => carruselRef.current?.scrollBy({ left: -240, behavior: "smooth" })}
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full p-1 hover:bg-bg-dark transition-colors"
                    >
                      <Icon icon={IconChevronLeft} size={20} color="var(--color-text-regular)" />
                    </button>

                    <div ref={carruselRef} className="flex gap-4 overflow-x-auto scrollbar-hide px-8 scroll-smooth">
                      {servicio.otros_servicios.map((s) => (
                        <div key={s.id_servicio} className="shrink-0 w-56">
                          <ServiceCard
                            nombre={s.nombre}
                            descripcion={s.descripcion}
                            precio={Number(s.precio)}
                            calificacion={0}
                            categoria=""
                            vendedora={servicio.emprendedora?.nombre_vendedora}
                            color={servicio.emprendedora?.color_hex}
                            onClick={() => navigate(`/catalogo/servicio/${s.id_servicio}`)}
                          />
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => carruselRef.current?.scrollBy({ left: 240, behavior: "smooth" })}
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full p-1 hover:bg-bg-dark transition-colors"
                    >
                      <Icon icon={IconChevronRight} size={20} color="var(--color-text-regular)" />
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="border-t border-text-light/20" />

            {/* ── Reseñas ── */}
            <ResenasSection
              resenas={resenas}
              promedio={promedioCalificacion}
              orden={ordenResenas}
              onOrdenChange={setOrdenResenas}
              onAgregarResena={() => setModalResena(true)}
              esCliente={esCliente() && !yaReseno}
            />
          </>
        )}

      </main>

      <Footer />

      {modalResena && servicio && (
        <ResenaModal
          tipo="servicio"
          idReferencia={Number(servicio.id_servicio)}
          idEmprendedora={servicio.emprendedora?.id_emprendedora}
          nombreItem={servicio.nombre}
          nombreEmprendedora={servicio.emprendedora?.nombre_vendedora}
          onClose={() => setModalResena(false)}
          onGuardada={() => window.location.reload()}
        />
      )}
    </>
  )
}