import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { adminService } from "../services/adminService"

export function useGestionEmprendedora(filtros) {
  const { esAdmin } = useAuth()
  const [datos, setDatos]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetchDatos = async () => {
    if (!esAdmin()) return
    try {
      setLoading(true)
      setError(null)
      const params = {}
      if (filtros.q)                     params.q           = filtros.q
      if (filtros.estado) {
        const estados = filtros.estado.split(",")
        if (estados.length === 1) params.estado = filtros.estado
      }
      if (filtros.insignia !== undefined) params.insignia   = filtros.insignia
      if (filtros.ordenar_por)           params.ordenar_por = filtros.ordenar_por

      const res = await adminService.getEmprendedoras(params)
      setDatos(res.data)
    } catch (e) {
      setError(e.response?.data?.detail ?? "Error al cargar emprendedoras")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDatos()
  }, [JSON.stringify(filtros)])

  return { datos, loading, error, refetch: fetchDatos }
}