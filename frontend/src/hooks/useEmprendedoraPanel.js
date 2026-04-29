import { useState, useEffect } from "react"
import { emprendedoraService } from "../services/emprendedoraService"

export function useDashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [cargando, setCargando]   = useState(true)
  const [error, setError]         = useState(null)

  useEffect(() => {
    let cancelado = false

    async function cargar() {
      try {
        setCargando(true)
        setError(null)
        const data = await emprendedoraService.getDashboard()
        if (!cancelado) setDashboard(data)
      } catch (err) {
        if (!cancelado) setError(err?.response?.data?.detail || "Error al cargar el dashboard")
      } finally {
        if (!cancelado) setCargando(false)
      }
    }

    cargar()
    return () => { cancelado = true }
  }, [])

  const summary     = dashboard?.summary       ?? {}
  const ventas30d   = dashboard?.ventas_30_dias ?? []
  const topCantidad = dashboard?.top_productos?.por_cantidad ?? []
  const topIngresos = dashboard?.top_productos?.por_ingresos ?? []

  return {
    cargando,
    error,
    summary,      // { saldo_actual, pedidos_activos, visitas_perfil }
    ventas30d,    // [{ fecha, total }]
    topCantidad,  // [{ id_producto, nombre, total }]
    topIngresos,  // [{ id_producto, nombre, total }]
  }
}