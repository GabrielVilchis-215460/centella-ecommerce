import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { catalogoService } from "../services/catalogoService"
import { useAuth } from "../context/AuthContext"
import { emprendedoraService } from "../services/emprendedoraService"

export function useDetalleServicio() {
  const { id } = useParams()
  const { usuario, esCliente } = useAuth()

  const [servicio,     setServicio]     = useState(null)
  const [resenas,      setResenas]      = useState([])
  const [cargando,     setCargando]     = useState(true)
  const [error,        setError]        = useState("")
  const [ordenResenas, setOrdenResenas] = useState("recientes")
  const [modalResena,  setModalResena]  = useState(false)
  const [promedioEmprendedora, setPromedioEmprendedora] = useState(0)
  const [yaReseno, setYaReseno] = useState(false)

  useEffect(() => {
    let cancelado = false
    async function cargar() {
      let srv = null
      try {
        setCargando(true)
        srv = await catalogoService.getDetalleServicio(id)
        if (cancelado) return
        setServicio(srv)
        
      } catch {
        if (!cancelado) setError("Error al cargar el servicio.")
      } finally {
        if (!cancelado) setCargando(false)
      }

      try {
        const res = await catalogoService.getResenasServicio(id)
        if (!cancelado) {
            setResenas(res.resenas ?? [])
            const yaReseno = res.resenas?.some((r) => r.id_cliente === usuario?.id) ?? false
            setYaReseno(yaReseno)
        }
      } catch {
        // sin reseñas array vacio
      }

      try {
        if (!srv?.emprendedora?.id_emprendedora) return
        const rating = await emprendedoraService.getRatingEmprendedora(srv.emprendedora.id_emprendedora)
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

  return {
    servicio, resenas: resenasOrdenadas, cargando, error,
    ordenResenas, setOrdenResenas,
    modalResena, setModalResena,
    promedioCalificacion,
    promedioEmprendedora,
    esCliente, usuario,
    yaReseno,
  }
}