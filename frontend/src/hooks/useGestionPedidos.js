import { useState, useEffect, useCallback } from "react"
import { emprendedoraService } from "../services/emprendedoraService"

const LIMIT = 10

export function useGestionPedidos() {
  const [pedidos, setPedidos]         = useState([])
  const [total, setTotal]             = useState(0)
  const [pagina, setPagina]           = useState(1)
  const [cargando, setCargando]       = useState(true)
  const [error, setError]             = useState(null)

  // Filtros
  const [busqueda, setBusqueda]       = useState("")
  const [ordenar, setOrdenar]         = useState("")
  const [filtros, setFiltros]         = useState({
    estados: {
      pendiente:   true,
      confirmado:  true,
      enviado:     true,
      entregado:   true,
      cancelado:   true,
    },
    tiposEntrega: {
      envio:   true,
      fisica:  true,
      mixto:   true,
    },
  })

  const cargar = useCallback(async () => {
    try {
      setCargando(true)
      setError(null)

      const estadosActivos = Object.entries(filtros.estados)
        .filter(([, v]) => v)
        .map(([k]) => k)

      const data = await emprendedoraService.getPedidos({
        skip:      (pagina - 1) * LIMIT,
        limit:     LIMIT,
        ordenar_por: ordenar || undefined,
      })

      // Filtrar en frontend por estados, tipo entrega y búsqueda
      let resultado = data.filter((p) => {
        const estadoOk  = estadosActivos.includes(p.estado)
        const tipoOk    = filtros.tiposEntrega[p.tipo_entrega] ?? true
        const busquedaOk = busqueda
          ? p.numero_rastreo?.toLowerCase().includes(busqueda.toLowerCase()) ||
            String(p.id_pedido).includes(busqueda)
          : true
        return estadoOk && tipoOk && busquedaOk
      })

      setPedidos(resultado)
      setTotal(data.length)
    } catch (err) {
      const detail = err?.response?.data?.detail
      setError(typeof detail === "string" ? detail : "Error al cargar pedidos")
    } finally {
      setCargando(false)
    }
  }, [pagina, ordenar, filtros, busqueda])

  useEffect(() => {
    cargar()
  }, [cargar])

  async function actualizarEstado(idPedido, nuevoEstado) {
    try {
      await emprendedoraService.actualizarPedido(idPedido, { estado: nuevoEstado })
      setPedidos((prev) =>
        prev.map((p) => p.id_pedido === idPedido ? { ...p, estado: nuevoEstado } : p)
      )
    } catch (err) {
      setError(err?.response?.data?.detail || "Error al actualizar estado")
    }
  }

  async function obtenerDetalle(idPedido) {
    const data = await emprendedoraService.getDetallePedido(idPedido)
    return data
  }

  return {
    pedidos,
    total,
    pagina,
    setPagina,
    totalPaginas: Math.ceil(total / LIMIT) || 1,
    cargando,
    error,
    busqueda,
    setBusqueda,
    ordenar,
    setOrdenar,
    filtros,
    setFiltros,
    actualizarEstado,
    obtenerDetalle,
  }
}