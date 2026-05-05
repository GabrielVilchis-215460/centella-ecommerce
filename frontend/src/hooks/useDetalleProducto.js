import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { catalogoService } from "../services/catalogoService"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import { emprendedoraService } from "../services/emprendedoraService"

export function useDetalleProducto() {
  const { id }  = useParams()
  const { agregarItem } = useCart()
  const { usuario, esCliente } = useAuth()

  const [producto,   setProducto]   = useState(null)
  const [resenas,    setResenas]    = useState([])
  const [cargando,   setCargando]   = useState(true)
  const [error,      setError]      = useState("")

  // Selecciones del usuario
  const [imagenActiva,     setImagenActiva]     = useState(0)
  const [atributosSeleccionados, setAtributosSeleccionados] = useState({})
  const [tipoEntrega,      setTipoEntrega]      = useState("")
  const [cantidad,         setCantidad]         = useState(1)
  const [ordenResenas,     setOrdenResenas]     = useState("recientes")
  const [modalResena,      setModalResena]      = useState(false)
  const [promedioEmprendedora, setPromedioEmprendedora] = useState(0)
  const [yaReseno, setYaReseno] = useState(false)

  useEffect(() => {
  let cancelado = false
  async function cargar() {
    let prod = null
    try {
      setCargando(true)
      prod = await catalogoService.getDetalleProducto(id)
      if (cancelado) return
      setProducto(prod)

      if (prod.tipo_entrega === "ambas") setTipoEntrega("envio")
      else setTipoEntrega(prod.tipo_entrega)

      const tiposUnicos = [...new Set(prod.atributos?.map((a) => a.tipo) ?? [])]
      const inicial = {}
      tiposUnicos.forEach((tipo) => {
        const primero = prod.atributos.find((a) => a.tipo === tipo)
        if (primero) inicial[tipo] = primero.valor.split(",")[0].trim()
      })
      setAtributosSeleccionados(inicial)

    } catch {
      if (!cancelado) setError("Error al cargar el producto.")
    } finally {
      if (!cancelado) setCargando(false)
    }

    try {
      const res = await catalogoService.getResenasProducto(id)
      if (!cancelado) {
        setResenas(res.resenas ?? [])
        const yaReseno = res.resenas?.some((r) => r.id_cliente === usuario?.id) ?? false
        setYaReseno(yaReseno)
      }
    } catch {
      // sin reseñas array vacio
    }

    try {
        if (!prod?.emprendedora?.id_emprendedora) return
        const rating = await emprendedoraService.getRatingEmprendedora(prod.emprendedora.id_emprendedora)
        if (!cancelado) setPromedioEmprendedora(
        rating.promedio_vendedora ? Number(rating.promedio_vendedora).toFixed(1) : 0
        )
    } catch {
        // si falla dejamos 0
    }
  }
  cargar()
  return () => { cancelado = true }
}, [id])

  const resenasOrdenadas = [...resenas].sort((a, b) => {
    if (ordenResenas === "recientes")  return new Date(b.fecha) - new Date(a.fecha)
    if (ordenResenas === "antiguos")   return new Date(a.fecha) - new Date(b.fecha)
    if (ordenResenas === "mayor_cal")  return b.calificacion_item - a.calificacion_item
    if (ordenResenas === "menor_cal")  return a.calificacion_item - b.calificacion_item
    return 0
  })

  const promedioCalificacion = resenas.length
    ? (resenas.reduce((s, r) => s + r.calificacion_item, 0) / resenas.length).toFixed(1)
    : 0

  const handleAgregarCarrito = () => {
    if (!esCliente()) return
    agregarItem(Number(id), cantidad, tipoEntrega)
  }

  const handleCantidad = (val) => {
    if (val < 1) return
    if (val > (producto?.cantidad_stock ?? 1)) return
    setCantidad(val)
  }

  const tiposAtributos = [...new Set(producto?.atributos?.map((a) => a.tipo) ?? [])]
  const opcionesTipoEntrega = producto?.tipo_entrega === "ambas"
    ? ["envio", "fisica"]
    : [producto?.tipo_entrega]

  return {
    producto, resenas: resenasOrdenadas, cargando, error,
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
    esCliente, usuario,
    yaReseno,
  }
}