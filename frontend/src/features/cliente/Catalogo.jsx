import { useSearchParams } from "react-router-dom"
import { Header }          from "../../components/layout/Header"
import { Footer }          from "../../components/layout/Footer"
import { FilterSidebar }   from "../../components/layout/FilterSidebar"
import { CatalogTabs }     from "../../components/common/CatalogTabs"
import { ProductCard }     from "../../components/common/ProductCard"
import { ServiceCard }     from "../../components/common/ServiceCard"
import { SellerCard }      from "../../components/common/SellerCard"
import { Pagination }      from "../../components/common/Pagination"
import { OrderByDropdown } from "../../components/common/Dropdown"
import { useCatalogo }     from "../../hooks/useCatalogo"
import { useCart }         from "../../context/CartContext"
import { useAuth }         from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"

const ORDEN_PRODUCTOS = [
  { value: "newest",      label: "Más recientes"                      },
  { value: "az",          label: "Orden alfabético ascendente (A-Z)"   },
  { value: "price_asc",   label: "Precio (Menor a mayor)"              },
  { value: "price_desc",  label: "Precio (Mayor a menor)"              },
  { value: "rating_desc", label: "Mejor calificados"                   },
]

const ORDEN_VENDEDORAS = [
  { value: "newest",         label: "Más recientes"                    },
  { value: "az",             label: "Orden alfabético ascendente (A-Z)"},
  { value: "rating_desc",    label: "Mejor calificadas"                },
  { value: "nombre_negocio", label: "Nombre del negocio"               },
]

const TITULOS = {
  productos:     "Productos",
  servicios:     "Servicios",
  emprendedoras: "Emprendedoras",
}

export function Catalogo() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { agregarItem } = useCart()
  const { esCliente, usuario }   = useAuth()
  const navigate = useNavigate()

  const {
    tab, items, totalPaginas, cargando, error,
    pagina, setPagina,
    orden, setOrden,
    busqueda, setBusqueda,
    categorias,
    categoriaActiva, setCategoriaActiva,
    precioMin, setPrecioMin,
    precioMax, setPrecioMax,
    buscarPrecio,
    hechosJuarez, setHechosJuarez,
    paquete, setPaquete,
    puntoMedio, setPuntoMedio,
    verificadas, setVerificadas,
    soloProductos, setSoloProductos,
    soloServicios, setSoloServicios,
  } = useCatalogo()

  const handleTabChange = (nuevoTab) => {
    setSearchParams({ tab: nuevoTab })
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-10 py-8">
        <div className="flex gap-0 items-start relative">
        {/* ── Sidebar izquierda ── */}
        <div className="shrink-0 sticky top-24 self-start border-r border-text-light/40 pr-8">
          {tab === "productos" && (
            <FilterSidebar
              categorias={categorias}
              categoriaActiva={categoriaActiva}
              onCategoriaChange={setCategoriaActiva}
              mostrarPrecio
              mostrarOrigen
              mostrarTipoEntrega
              precioMinValue={precioMin}
              precioMaxValue={precioMax}
              onPrecioMinChange={setPrecioMin}
              onPrecioMaxChange={setPrecioMax}
              onBuscarPrecio={buscarPrecio}
              hechosJuarezValue={hechosJuarez}
              onHechosJuarezChange={setHechosJuarez}
              paqueteValue={paquete}
              onPaqueteChange={setPaquete}
              puntoMedioValue={puntoMedio}
              onPuntoMedioChange={setPuntoMedio}
            />
          )}
          {tab === "servicios" && (
            <FilterSidebar
              categorias={categorias}
              categoriaActiva={categoriaActiva}
              onCategoriaChange={setCategoriaActiva}
              mostrarPrecio
              precioMinValue={precioMin}
              precioMaxValue={precioMax}
              onPrecioMinChange={setPrecioMin}
              onPrecioMaxChange={setPrecioMax}
              onBuscarPrecio={buscarPrecio}
            />
          )}
          {tab === "emprendedoras" && (
            <FilterSidebar
              mostrarVerificacion
              mostrarOrigen
              mostrarParticularidad
              verificadasValue={verificadas}
              onVerificadasChange={setVerificadas}
              hechosJuarezValue={hechosJuarez}
              onHechosJuarezChange={setHechosJuarez}
              soloProductosValue={soloProductos}
              onSoloProductosChange={setSoloProductos}
              soloServiciosValue={soloServicios}
              onSoloServiciosChange={setSoloServicios}
            />
          )}
        </div>

        {/* ── Contenido derecha ── */}
        <div className="flex flex-col gap-6 flex-1 min-w-0 pl-10">

          {/* Tabs */}
          <CatalogTabs activo={tab} onChange={handleTabChange} />

          {/* Título y ordenar */}
          <div className="flex items-center justify-between">
            <h1 className="font-heading text-3xl text-text-dark">
              {TITULOS[tab]}
            </h1>
            <OrderByDropdown
              opciones={tab === "emprendedoras" ? ORDEN_VENDEDORAS : ORDEN_PRODUCTOS}
              valorActivo={orden}
              onChange={setOrden}
            />
          </div>

          {/* Cargando */}
          {cargando && (
            <div className="flex justify-center py-12">
              <span className="font-body text-sm text-text-light">Cargando...</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="font-body text-sm text-error text-center">{error}</p>
          )}

          {/* Contenido */}
          {!cargando && !error && (
            <>
              {/* Productos */}
              {tab === "productos" && (
                <div className="grid grid-cols-3 gap-6">
                  {items.map((p) => (
                    <ProductCard
                      key={p.id_producto}
                      nombre={p.nombre}
                      precio={Number(p.precio)}
                      calificacion={p.calificacion_promedio ?? 0}
                      imagen={p.imagen_url}
                      onClick={() => navigate(`/catalogo/producto/${p.id_producto}`)}
                    />
                  ))}
                </div>
              )}

              {/* Servicios */}
              {tab === "servicios" && (
                <div className="grid grid-cols-2 gap-6">
                  {items.map((s) => (
                    <ServiceCard
                      key={s.id_servicio}
                      nombre={s.nombre}
                      descripcion={s.descripcion}
                      precio={Number(s.precio)}
                      calificacion={s.calificacion_promedio ?? 0}
                      categoria={s.nombre_categoria}
                      vendedora={s.nombre_vendedora}
                      verificada={s.verificada === "verificada"}
                      color={s.color_hex || undefined}
                      onClick={() => navigate(`/catalogo/servicio/${s.id_servicio}`)}
                    />
                  ))}
                </div>
              )}

              {/* Emprendedoras */}
              {tab === "emprendedoras" && (
                <div className="grid grid-cols-2 gap-6">
                  {items.map((v) => (
                    <SellerCard
                      key={v.id_emprendedora}
                      nombre={`${v.nombre} ${v.apellido}`}
                      emprendimiento={v.nombre_negocio}
                      calificacion={v.calificacion_promedio ?? 0}
                      descripcion={v.descripcion_negocio}
                      logo={v.logo_url}
                      etiquetas={v.etiquetas}
                      verificada={v.estado_verificacion === "verificada"}
                      color={v.color_emprendedora_hex || undefined}
                      onClick={() => navigate(`/catalogo/emprendedora/${v.id_emprendedora}`)}
                    />
                  ))}
                </div>
              )}

              {/* Sin resultados */}
              {items.length === 0 && (
                <div className="flex justify-center py-12">
                  <p className="font-body text-sm text-text-light">
                    No se encontraron resultados.
                  </p>
                </div>
              )}

              {/* Paginación */}
              {items.length > 0 && (
                <div className="flex justify-center mt-4">
                  <Pagination
                    paginaActual={pagina}
                    totalPaginas={totalPaginas}
                    onChange={setPagina}
                  />
                </div>
              )}
            </>
          )}

        </div>
       </div>
      </main>

      <Footer />
    </div>
  )
}