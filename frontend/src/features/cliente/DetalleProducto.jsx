import { useRef, useState, useEffect } from "react"
import { useNavigate, Link }           from "react-router-dom"
import {
  IconArrowLeft, IconDots, IconFlag,
  IconStar, IconRosetteDiscountCheck,
} from "@tabler/icons-react"
import { Header }              from "../../components/layout/Header"
import { Footer }              from "../../components/layout/Footer"
import { Button }              from "../../components/common/Button"
import { NumberInput }         from "../../components/common/NumberInput"
import { ResenaModal }         from "../../components/common/ResenaModal"
import { ResenasSection }      from "../../components/common/ResenasSection"
import { useDetalleProducto }  from "../../hooks/useDetalleProducto"

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-md bg-bg-dark ${className}`} />
}

const LABEL_ENTREGA = {
  envio:   "Envío a domicilio",
  fisica:  "Entrega en punto de venta",
}

export function DetalleProducto() {
  const navigate    = useNavigate()
  const reportarRef = useRef(null)
  const [reportarAbierto, setReportarAbierto] = useState(false)

  const {
    producto, resenas, cargando, error,
    imagenActiva, setImagenActiva,
    atributosSeleccionados, setAtributosSeleccionados,
    tipoEntrega, setTipoEntrega,
    cantidad, handleCantidad,
    tiposAtributos, opcionesTipoEntrega,
    ordenResenas, setOrdenResenas,
    modalResena, setModalResena,
    promedioCalificacion,
    promedioEmprendedora,
    handleAgregarCarrito,
    esCliente,yaReseno,
  } = useDetalleProducto()

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

      <main className="relative mx-auto max-w-5xl px-6 py-8 flex flex-col gap-10">

        {/* Flecha atrás */}
        <button
          onClick={() => navigate(-1)}
          className="absolute -left-20 top-10 text-text-light hover:text-text-dark transition-colors"
        >
          <IconArrowLeft size={28} stroke={1.5} />
        </button>

        {cargando ? (
          <div className="grid grid-cols-2 gap-10">
            <Skeleton className="h-80 w-full" />
            <div className="flex flex-col gap-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        ) : (
          <>
            {/* ── Sección superior: imagen + info ── */}
            <div className="grid grid-cols-2 gap-10 items-start">

              {/* Columna izquierda: carrusel */}
              <div className="flex flex-col gap-3">
                <div className="rounded-lg overflow-hidden bg-bg-dark aspect-square">
                  <img
                    src={producto.imagenes?.[imagenActiva]?.url || "https://placehold.co/600x600?text=sin+imagen"}
                    alt={producto.nombre}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Thumbnails */}
                {producto.imagenes?.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                    {producto.imagenes.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setImagenActiva(i)}
                        className={`shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                          i === imagenActiva
                            ? "border-primary"
                            : "border-transparent hover:border-text-light"
                        }`}
                      >
                        <img
                          src={img.url}
                          alt={`imagen ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Columna derecha: info */}
              <div className="flex flex-col gap-5">

                {/* Nombre + opciones */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="font-heading text-xl text-text-dark">{producto.nombre}</h1>
                    <div className="flex items-center gap-1">
                      <IconStar size={18} color="var(--color-text-light)" />
                      <span className="font-body text-md text-text-light pt-0.5">{promedioCalificacion}</span>
                    </div>
                  </div>

                  <div className="relative shrink-0" ref={reportarRef}>
                    <button
                      onClick={() => setReportarAbierto(!reportarAbierto)}
                      className="text-text-light hover:text-text-dark transition-colors"
                    >
                      <IconDots size={20} stroke={1.5} />
                    </button>
                    {reportarAbierto && (
                      <div className="absolute right-0 top-[calc(100%+4px)] bg-bg-light rounded-md shadow-lg z-50 w-36 overflow-hidden">
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

                {/* Precio + stock */}
                <div className="flex flex-col gap-1">
                  <p className="font-body text-lg text-text-dark">${producto.precio.toFixed(2)}</p>
                  <p className="font-body text-sm text-text-light">
                    {String(producto.cantidad_stock).padStart(2, "0")} disponibles
                  </p>
                </div>

                {/* Atributos */}
                {tiposAtributos.map((tipo) => (
                  <div key={tipo} className="flex flex-col gap-2">
                    <span className="font-body text-sm text-text-regular capitalize">{tipo}</span>
                    <div className="flex gap-2 flex-wrap">
                      {producto.atributos
                        .filter((a) => a.tipo === tipo)
                        .map((a) => (
                          <button
                            key={a.valor}
                            onClick={() => {
                                if (!a.atributo_activo) return
                                setAtributosSeleccionados((prev) => ({ ...prev, [tipo]: a.valor }))
                            }}
                            disabled={!a.atributo_activo}
                            className={`px-4 py-1.5 rounded-lg font-body text-sm border transition-colors ${
                                !a.atributo_activo
                                ? "bg-text-regular/10 text-text-light border-text-light/40 cursor-not-allowed"
                                : atributosSeleccionados[tipo] === a.valor
                                    ? "bg-secondary text-white"
                                    : "bg-transparent text-text-regular border-text-light hover:border-text-regular"
                            }`}
                          >
                            {a.valor}
                          </button>
                        ))}
                    </div>
                  </div>
                ))}

                {/* Tipo de entrega */}
                {opcionesTipoEntrega.length > 1 && (
                  <div className="flex flex-col gap-2">
                    <span className="font-body text-sm text-text-regular">Tipo de entrega</span>
                    <div className="flex gap-2 flex-wrap">
                      {opcionesTipoEntrega.map((op) => (
                        <button
                          key={op}
                          onClick={() => setTipoEntrega(op)}
                          className={`px-4 py-1.5 rounded-lg font-body text-sm border transition-colors ${
                            tipoEntrega === op
                              ? "bg-secondary text-white"
                              : "bg-transparent text-text-regular border-text-light hover:border-text-regular"
                          }`}
                        >
                          {LABEL_ENTREGA[op] ?? op}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cantidad + agregar */}
                <div className="flex items-center gap-4 mt-2">
                  <NumberInput
                    value={cantidad}
                    onChange={handleCantidad}
                    min={1}
                    max={producto.cantidad_stock}
                    className="w-28 h-10 shrink-0"
                  />
                  <Button
                    size="sm"
                    onClick={handleAgregarCarrito}
                    disabled={!esCliente()}
                    className="flex-1"
                  >
                    Agregar a carrito
                  </Button>
                </div>

              </div>
            </div>

            <div className="border-t border-text-light/20" />

            {/* ── Descripción ── */}
            {producto.descripcion && (
              <>
                <div className="flex flex-col gap-3">
                  <h2 className="font-heading text-xl text-text-dark">Descripción</h2>
                  <p className="font-body text-base text-text-regular leading-relaxed">
                    {producto.descripcion}
                  </p>
                </div>
                <div className="border-t border-text-light/20" />
              </>
            )}

            {/* ── Sobre la emprendedora ── */}
            {producto.emprendedora && (
              <>
                <div className="flex flex-col gap-3">
                  <h2 className="font-heading text-xl text-text-dark">Sobre la emprendedora</h2>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      to={`/catalogo/emprendedora/${producto.emprendedora.id_emprendedora}`}
                      className="font-body text-base text-text-regular hover:text-primary transition-colors"
                    >
                      {producto.emprendedora.nombre_negocio}
                    </Link>
                    <span className="text-text-light">•</span>
                    <span className="font-body text-base text-text-light">
                      {producto.emprendedora.nombre_vendedora}
                    </span>
                    {producto.emprendedora.verificada && (
                      <IconRosetteDiscountCheck size={18} color="var(--color-text-regular)" />
                    )}
                    <span className="text-text-light">•</span>
                    <div className="flex items-center gap-1">
                      <IconStar size={14} color="var(--color-text-light)" />
                      <span className="font-body text-sm text-text-light">{promedioEmprendedora}</span>
                    </div>
                  </div>

                  {producto.emprendedora.descripcion_negocio && (
                    <p className="font-body text-base text-text-regular leading-relaxed">
                      {producto.emprendedora.descripcion_negocio}
                    </p>
                  )}
                </div>
                <div className="border-t border-text-light/20" />
              </>
            )}

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

      {modalResena && producto && (
        <ResenaModal
          tipo="producto"
          idReferencia={Number(producto.id_producto)}
          idEmprendedora={producto.emprendedora?.id_emprendedora}
          nombreItem={producto.nombre}
          nombreEmprendedora={producto.emprendedora?.nombre_vendedora}
          onClose={() => setModalResena(false)}
          onGuardada={() => window.location.reload()}
        />
      )}
    </>
  )
}