import { useState, useEffect, useCallback } from "react"
import { emprendedoraService } from "../services/emprendedoraService"
import { useToast } from "../context/ToastContext"

const LIMIT = 10

export function useGestionServicios() {
  const { showToast } = useToast() 
  const [servicios, setServicios]   = useState([])
  const [total, setTotal]  = useState(0)
  const [pagina, setPagina]  = useState(1)
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [redesNegocio, setRedesNegocio] = useState({
    whatsapp: null, web: null, facebook: null, instagram: null
  })

  const cargar = useCallback(async () => {
    try {
      setCargando(true)
      setError(null)
      const data = await emprendedoraService.getServicios({
        skip:  (pagina - 1) * LIMIT,
        limit: LIMIT,
      })
      setServicios(data)
      setTotal(data.length)
    } catch (err) {
      const detail = err?.response?.data?.detail
      setError(typeof detail === "string" ? detail : "Error al cargar servicios")
    } finally {
      setCargando(false)
    }
  }, [pagina])

  useEffect(() => {
    cargar()
  }, [cargar])

  useEffect(() => {
    emprendedoraService.getCategorias("servicio")
      .then((data) => setCategorias(data))
      .catch(() => setCategorias([]))
  }, [])

  useEffect(() => {
    emprendedoraService.getPerfilNegocio()
      .then((data) => setRedesNegocio(data.enlace_redes_sociales ?? {}))
      .catch(() => {})
  }, [])

  async function crearServicio(datos) {
    try {
      const nuevo = await emprendedoraService.crearServicio(datos)
      setServicios((prev) => [nuevo, ...prev])
      setTotal((prev) => prev + 1)
      showToast("Servicio creado exitosamente", "success")
    } catch (err) {
      const detail = err?.response?.data?.detail
      showToast(typeof detail === "string" ? detail : "Error al crear servicio", "error")
    }
  }

  async function actualizarServicio(idServicio, datos) {
    try {
      const actualizado = await emprendedoraService.actualizarServicio(idServicio, datos)
      setServicios((prev) =>
        prev.map((s) => s.id_servicio === idServicio ? actualizado : s)
      )
      showToast("Servicio actualizado exitosamente", "success")
    } catch (err) {
      const detail = err?.response?.data?.detail
      showToast(typeof detail === "string" ? detail : "Error al actualizar servicio", "error")
    }
  }

  async function eliminarServicio(idServicio) {
    try {
      await emprendedoraService.eliminarServicio(idServicio)
      setServicios((prev) => prev.filter((s) => s.id_servicio !== idServicio))
      setTotal((prev) => prev - 1)
      showToast("Servicio eliminado", "success")
    } catch (err) {
      const detail = err?.response?.data?.detail
      showToast(typeof detail === "string" ? detail : "Error al eliminar servicio", "error")
    }
  }

  return {
    servicios,
    total,
    pagina,
    setPagina,
    totalPaginas: Math.ceil(total / LIMIT) || 1,
    categorias,
    redesNegocio,
    cargando,
    error,
    crearServicio,
    actualizarServicio,
    eliminarServicio,
  }
}
