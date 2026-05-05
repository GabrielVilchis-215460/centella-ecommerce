import { useState, useEffect, useCallback } from "react"
import { pedidosService } from "../services/pedidosService"

const LIMIT = 20

export function usePedidos() {
  const [pedidos,      setPedidos]      = useState([])
  const [total,        setTotal]        = useState(0)
  const [cargando,     setCargando]     = useState(false)
  const [error,        setError]        = useState("")

  // Paginación y orden
  const [pagina,       setPagina]       = useState(1)
  const [ordenar_por,  setOrdenarPor]   = useState("recientes")

  // Filtros
  const [estado,       setEstado]       = useState("")
  const [busqueda,     setBusqueda]     = useState("")

  const skip         = (pagina - 1) * LIMIT
  const totalPaginas = Math.max(1, Math.ceil(total / LIMIT))

  const fetchPedidos = useCallback(async () => {
    try {
      setCargando(true)
      setError("")

      const { data } = await pedidosService.obtenerPedidos({
        skip,
        limit:       LIMIT,
        ordenar_por: ordenar_por || undefined,
        estado:      estado      || undefined,
      })

      setPedidos(data)
      setTotal(data.length)
    } catch (err) {
      setError(err?.response?.data?.detail ?? "No se pudieron cargar los pedidos.")
      console.error(err)
    } finally {
      setCargando(false)
    }
  }, [skip, ordenar_por, estado])

  useEffect(() => {
    fetchPedidos()
  }, [fetchPedidos])

  // Reset al cambiar filtros
  const resetPagina = () => setPagina(1)

  return {
    pedidos, total, totalPaginas, cargando, error,
    pagina, setPagina,
    ordenar_por, setOrdenarPor,
    estado, setEstado,
    busqueda, setBusqueda,
    refetch: fetchPedidos,
    resetPagina,
    limit: LIMIT,
  }
}