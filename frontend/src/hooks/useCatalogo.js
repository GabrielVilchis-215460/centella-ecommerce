import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import { catalogoService } from "../services/catalogoService"

const LIMIT_PRODUCTOS = 18
const LIMIT_2COL      = 12

const ORDEN_MAP = {
  newest:        "recientes",
  az:            "nombre",
  price_asc:     "precio_asc",
  price_desc:    "precio_desc",
  rating_desc:   "calificacion",
  nombre_negocio:"nombre_negocio",
}

export function useCatalogo() {
  const [searchParams] = useSearchParams()
  const tab = searchParams.get("tab") || "productos"

  // Datos
  const [items,         setItems]         = useState([])
  const [total,         setTotal]         = useState(0)
  const [cargando,      setCargando]      = useState(false)
  const [error,         setError]         = useState("")

  // Paginación y orden
  const [pagina,        setPagina]        = useState(1)
  const [orden,         setOrden]         = useState("newest")

  // Búsqueda
  const [busqueda,      setBusqueda]      = useState("")

  // Filtros comunes
  const [categorias, setCategorias] = useState([])
  const [categoriaActiva,  setCategoriaActiva]  = useState(null)
  const [hechosJuarez,     setHechosJuarez]     = useState(false)

  // Filtros productos
  const [precioMin,        setPrecioMin]        = useState(0)
  const [precioMax,        setPrecioMax]        = useState(0)
  const [precioMinConfirmado, setPrecioMinConfirmado] = useState(0)
  const [precioMaxConfirmado, setPrecioMaxConfirmado] = useState(0)
  const [paquete,          setPaquete]          = useState(false)
  const [puntoMedio,       setPuntoMedio]        = useState(false)

  // Filtros emprendedoras
  const [verificadas,      setVerificadas]      = useState(false)
  const [soloProductos,    setSoloProductos]    = useState(true)
  const [soloServicios,    setSoloServicios]    = useState(true)

  const limit = tab === "productos" ? LIMIT_PRODUCTOS : LIMIT_2COL
  const skip  = (pagina - 1) * limit
  const totalPaginas = Math.max(1, Math.ceil(total / limit))

  const fetchData = useCallback(async () => {
    try {
      setCargando(true)
      setError("")

      const ordenBackend = ORDEN_MAP[orden] ?? undefined

      let tipo_entrega = undefined
      if (paquete && !puntoMedio)  tipo_entrega = "envio"
      if (!paquete && puntoMedio)  tipo_entrega = "fisica"

      if (tab === "productos") {
        const data = await catalogoService.getProductos({
          skip, limit,
          id_categoria: categoriaActiva         || undefined,
          nombre:       busqueda                || undefined,
          precio_min:   precioMinConfirmado > 0  ? precioMinConfirmado : undefined,
          precio_max:   precioMaxConfirmado > 0  ? precioMaxConfirmado : undefined,
          hecho_juarez: hechosJuarez             || undefined,
          tipo_entrega,
          ordenar_por:  ordenBackend,
        })
        setItems(data.items)
        setTotal(data.total)

      } else if (tab === "servicios") {
        const data = await catalogoService.getServicios({
          skip, limit,
          id_categoria: categoriaActiva        || undefined,
          nombre:       busqueda               || undefined,
          precio_min:   precioMinConfirmado > 0 ? precioMinConfirmado : undefined,
          precio_max:   precioMaxConfirmado > 0 ? precioMaxConfirmado : undefined,
          ordenar_por:  ordenBackend,
        })
        setItems(data.items)
        setTotal(data.total)

      } else {
        const data = await catalogoService.getEmprendedoras({
          skip, limit,
          nombre:      busqueda         || undefined,
          ordenar_por: ordenBackend,
          verificadas: verificadas      ? true : undefined,
          solo_productos: soloProductos ? true : undefined,
          solo_servicios: soloServicios ? true : undefined,
        })
        setItems(data.items)
        setTotal(data.total)
      }

    } catch (err) {
      setError("Error al cargar el catálogo. Intenta de nuevo.")
      console.error(err)
    } finally {
      setCargando(false)
    }
  }, [
    tab, skip, limit, orden,
    categoriaActiva, busqueda,
    precioMinConfirmado, precioMaxConfirmado,
    hechosJuarez, paquete, puntoMedio,
    verificadas, soloProductos, soloServicios,
  ])

  // Fetch al cambiar dependencias
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Reset al cambiar tab
  useEffect(() => {
    setPagina(1)
    setOrden("newest")
    setCategoriaActiva(null)
    setBusqueda("")
    setPrecioMin(0)
    setPrecioMax(0)
    setPrecioMinConfirmado(0)
    setPrecioMaxConfirmado(0)
    setHechosJuarez(false)
    setPaquete(false)
    setPuntoMedio(false)
    setVerificadas(false)
    setSoloProductos(true)
    setSoloServicios(true)
  }, [tab])

  // Fetch categorías al cambiar tab
  useEffect(() => {
    const fetchCategorias = async () => {
        if (tab === "emprendedoras") { setCategorias([]); return }
        try {
        const tipo = tab === "productos" ? "producto" : "servicio"
        const data = await catalogoService.getCategorias(tipo)
        setCategorias(data)
        } catch {
        console.log("Error categorias:", err)
            setCategorias([])
        }
    }
    fetchCategorias()
  }, [tab])

  const buscarPrecio = () => {
    setPrecioMinConfirmado(precioMin)
    setPrecioMaxConfirmado(precioMax)
    setPagina(1)
  }

  return {
    tab, items, total, totalPaginas, cargando, error,
    pagina, setPagina, limit,
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
  }
}