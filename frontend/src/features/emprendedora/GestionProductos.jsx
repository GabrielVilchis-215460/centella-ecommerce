import { useState } from "react"
import { Navigate } from "react-router-dom"
import { IconPackage } from "@tabler/icons-react"
import { Icon } from "../../components/common/Icon"
import { Header } from "../../components/layout/Header"
import { Footer } from "../../components/layout/Footer"
import { Pagination } from "../../components/common/Pagination"
import { StatusBadge } from "../../components/common/StatusBadge"
import { DataTable } from "../../components/common/DataTable"
import { ProductoModal } from "../../components/common/ProductoModal"
import { Button } from "../../components/common/Button"
import { OrderByDropdown, FilterDropdown } from "../../components/common/Dropdown"
import { useAuth } from "../../context/AuthContext"
import { useGestionProductos } from "../../hooks/useGestionProductos"
import { emprendedoraService } from "../../services/emprendedoraService"

// Constantes
const ORDENAR_OPCIONES = [
  { value: "recientes", label: "Más recientes" },
  { value: "nombre",    label: "Nombre A-Z"    },
  { value: "precio",    label: "Precio"        },
  { value: "stock",     label: "Stock"         },
]

const FILTER_GRUPOS = [
  {
    label: "Estado",
    opciones: [
      { key: "activo",   label: "Activo"   },
      { key: "inactivo", label: "Inactivo" },
    ],
  },
  {
    label: "Tipo de entrega",
    opciones: [
      { key: "envio",  label: "Paquete"     },
      { key: "fisica", label: "Punto medio" },
      { key: "ambas",  label: "Ambas"       },
    ],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtFecha(iso) {
  if (!iso) return "—"
  const d = new Date(iso)
  return d.toLocaleDateString("es-MX", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

function fmtPrecio(valor) {
  return `$${Number(valor).toFixed(2)}`
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-md bg-bg-dark ${className}`} />
}

// ─── Columnas DataTable ───────────────────────────────────────────────────────

const COLUMNAS = [
  {
    key:   "imagen",
    label: "Imagen",
    width: "60px",
    render: (fila) => (
      fila.imagen_url ? (
        <img
          src={fila.imagen_url}
          alt={fila.nombre}
          className="w-10 h-10 rounded-md object-cover"
        />
      ) : (
        <div className="w-10 h-10 rounded-md bg-bg-dark flex items-center justify-center">
          <IconPackage size={16} color="var(--color-text-light)" />
        </div>
      )
    ),
  },
  {
    key:   "nombre",
    label: "Nombre",
    width: "2fr",
  },
  {
    key:   "precio",
    label: "Precio",
    width: "1fr",
    render: (fila) => (
      <span className="font-body text-sm text-text-regular">
        {fmtPrecio(fila.precio)}
      </span>
    ),
  },
  {
    key:   "activo",
    label: "Estado",
    width: "1fr",
    render: (fila) => (
      <StatusBadge
        texto={fila.activo ? "Activo" : "Inactivo"}
        color={fila.activo ? "green" : "gray"}
      />
    ),
  },
  {
    key:   "cantidad_stock",
    label: "Existencias",
    width: "1fr",
    render: (fila) => (
      <span className="font-body text-sm text-text-regular">
        {fila.cantidad_stock} existencias
      </span>
    ),
  },
  {
    key:   "fecha_creacion",
    label: "Última edición",
    width: "1fr",
    render: (fila) => (
      <span className="font-body text-sm text-text-light">
        {fmtFecha(fila.fecha_creacion)}
      </span>
    ),
  },
  {
    key:   "eliminar",
    label: "Eliminar",
    width: "80px",
  },
]

// ─── Componente principal ─────────────────────────────────────────────────────

export function GestionProductos() {
  const { usuario, cargando: cargandoAuth } = useAuth()
  const {
    productos, total, pagina, setPagina, totalPaginas,
    categorias, cargando, error,
    crearProducto, actualizarProducto, eliminarProducto, 
    obtenerImagenes, obtenerAtributos, crearAtributo, eliminarAtributo, eliminarImagen, reordenarImagenes, refrescar
  } = useGestionProductos()

  const [busqueda, setBusqueda]           = useState("")
  const [ordenar, setOrdenar]             = useState("")
  const [filtros, setFiltros]             = useState({ activo: true, inactivo: true, envio: true, fisica: true, ambas: true })
  const [modalAbierto, setModalAbierto]   = useState(false)
  const [productoEditar, setProductoEditar] = useState(null)
  const [cargandoImagenes, setCargandoImagenes] = useState(false)

  if (!cargandoAuth && usuario?.tipo_usuario !== "emprendedora") {
    return <Navigate to="/" replace />
  }

  // Filtrar y ordenar en frontend
  let datosFiltrados = productos.filter((p) => {
    const estadoOk   = p.activo ? filtros.activo : filtros.inactivo
    const tipoOk     = filtros[p.tipo_entrega] ?? true
    const busquedaOk = busqueda
      ? p.nombre.toLowerCase().includes(busqueda.toLowerCase())
      : true
    return estadoOk && tipoOk && busquedaOk
  })

  if (ordenar === "nombre") {
    datosFiltrados = [...datosFiltrados].sort((a, b) => a.nombre.localeCompare(b.nombre))
  } else if (ordenar === "precio") {
    datosFiltrados = [...datosFiltrados].sort((a, b) => Number(a.precio) - Number(b.precio))
  } else if (ordenar === "stock") {
    datosFiltrados = [...datosFiltrados].sort((a, b) => b.cantidad_stock - a.cantidad_stock)
  }

  const handleRowClick = async (fila) => {
    try {
      setCargandoImagenes(true)
      const [imgs, atrs] = await Promise.all([
        obtenerImagenes(fila.id_producto),
        obtenerAtributos(fila.id_producto),
      ])

      setProductoEditar({
        ...fila,
        categoria:  String(fila.id_categoria ?? ""),
        stock:      fila.cantidad_stock,
        paquete:    fila.tipo_entrega === "envio" || fila.tipo_entrega === "ambas",
        puntoMedio: fila.tipo_entrega === "fisica" || fila.tipo_entrega === "ambas",
        imagenes:   imgs.map((img) => ({ url: img.url, id_imagen: img.id_imagen, filename: img.filename })),
        atributos:  atrs.map((a) => ({ id_atributo: a.id_atributo, tipo: a.tipo, valor: a.valor })),
      })
      setModalAbierto(true)
    } finally {
      setCargandoImagenes(false)
    }
  }

  const handleEliminar = async (fila) => {
    if (!window.confirm(`¿Eliminar "${fila.nombre}"?`)) return
    await eliminarProducto(fila.id_producto)
  }

  const handleGuardar = async (datos) => {
    try {
      let tipo_entrega = "envio"; 
      if (datos.paquete && datos.puntoMedio) {
        tipo_entrega = "ambas";
      } else if (datos.puntoMedio) {
      } else if (datos.paquete) {
        tipo_entrega = "envio";
      } else {
        tipo_entrega = "envio"; 
      }

      // 1. Preparamos el cuerpo base, compatible con ProductoUpdate
      const body = {
        nombre:         datos.nombre,
        descripcion:    datos.descripcion || null,
        precio:         datos.precio,
        cantidad_stock: datos.stock,
        tipo_entrega: tipo_entrega,
        activo:         datos.activo,
        id_categoria:   Number(datos.categoria),
      }

      let idProducto

      if (productoEditar) {
        // Si editamos, usamos el body sin fecha_creacion
        await actualizarProducto(productoEditar.id_producto, body)
        idProducto = productoEditar.id_producto
      } else {
        // Solo si es un producto NUEVO le inyectamos la fecha
        body.fecha_creacion = new Date().toISOString()
        const nuevo = await crearProducto(body)
        idProducto = nuevo?.id_producto
      }

      // Subir imágenes nuevas
      const imagenesNuevas = (datos.imagenes ?? []).filter((img) => img.file)
      if (imagenesNuevas.length > 0 && idProducto) {
        await emprendedoraService.subirImagenesProducto(
          idProducto,
          imagenesNuevas.map((img) => img.file)
        )
      }

      const imgsEliminadas = datos.imagenesEliminadas || [];
      for (const idImg of imgsEliminadas) {
        await eliminarImagen(idImg);
      }

      const atrsEliminados = datos.atributosEliminados || [];
      for (const idAtr of atrsEliminados) {
        await eliminarAtributo(idProducto, idAtr);
      }

      const atributosNuevos = (datos.atributos ?? []).filter((a) => !a.id_atributo)
      for (const atr of atributosNuevos) {
        await crearAtributo(idProducto, atr.tipo, atr.valor)
      }

      const ordenImagenes = datos.imagenes
        .filter((img) => img.id_imagen) 
        .map((img) => img.id_imagen);

      if (ordenImagenes.length > 0) {
        await reordenarImagenes(ordenImagenes);
      }

      await refrescar()
      setModalAbierto(false)
      setProductoEditar(null)
      
    } catch (error) {
      console.error("Error en el guardado. Revisa el mensaje de error de la API.", error);
    }
  }

  const datosTabla = datosFiltrados.map((p) => ({ ...p, id: p.id_producto }))

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Header />

      <main className="flex-1 w-full mx-auto max-w-7xl px-6 py-8 space-y-6">

        {/* Título + botón agregar */}
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-xl font-bold text-text-regular">
            Gestión de Productos
          </h1>
          <Button
            size="sm"
            className="w-auto! px-6"
            onClick={() => { setProductoEditar(null); setModalAbierto(true) }}
          >
            Agregar producto
          </Button>
        </div>

        {/* Barra de controles */}
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-body text-sm text-text-light">
            {cargando ? "—" : `${total} productos`}
          </span>

          <span className="text-text-light text-sm">•</span>

          <OrderByDropdown
            opciones={ORDENAR_OPCIONES}
            valorActivo={ordenar}
            onChange={setOrdenar}
          />

          {/* Buscar */}
          <div className="flex items-center gap-2 bg-bg-light rounded-lg px-3 py-1.5 shadow-sm flex-1 max-w-56">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar..."
              className="bg-transparent font-body text-sm text-text-regular outline-none w-full
                         placeholder:text-text-light"
            />
          </div>
          <span className="text-text-light text-sm">•</span>
          <FilterDropdown
            label="Filtrar"
            grupos={FILTER_GRUPOS}
            valores={filtros}
            onChange={setFiltros}
          />
        </div>

        {/* Tabla */}
        {error ? (
          <p className="text-error text-sm text-center">{error}</p>
        ) : cargando ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        ) : datosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Icon icon={IconPackage} size={40} color="var(--color-text-light)" />
            <p className="font-body text-sm text-text-light">No hay productos que mostrar</p>
          </div>
        ) : (
          <DataTable
            columnas={COLUMNAS}
            datos={datosTabla}
            onRowClick={handleRowClick}
            onEliminar={handleEliminar}
          />
        )}

        {/* Paginación */}
        {!cargando && totalPaginas > 1 && (
          <div className="flex justify-center">
            <Pagination
              paginaActual={pagina}
              totalPaginas={totalPaginas}
              onChange={setPagina}
            />
          </div>
        )}
      </main>

      <Footer />

      {/* Modal */}
      {modalAbierto && (
        <ProductoModal
          producto={productoEditar}
          categorias={categorias}
          onClose={() => { setModalAbierto(false); setProductoEditar(null) }}
          onGuardar={handleGuardar}
        />
      )}

      {/* Loading overlay imágenes */}
      {cargandoImagenes && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-bg-light rounded-xl px-6 py-4 shadow-lg">
            <p className="font-body text-sm text-text-regular">Cargando producto...</p>
          </div>
        </div>
      )}
    </div>
  )
}