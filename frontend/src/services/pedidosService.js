import api from "./axios"

export const pedidosService = {
  obtenerConfirmacion: (id_pedido) =>
    api.get(`/api/v1/pedidos/${id_pedido}/confirmacion`),
  /**
   * GET /pedidos/
   * Retorna la lista de pedidos del usuario autenticado.
   * @param {Object} params - Filtros opcionales
   * @param {string} [params.estado]      - Filtra por estado del pedido
   * @param {string} [params.ordenar_por] - "recientes" | "total_asc" | "total_desc"
   * @param {number} [params.skip]        - Paginación offset (default 0)
   * @param {number} [params.limit]       - Paginación límite (default 20)
   */
  obtenerPedidos: (params = {}) =>
    api.get("/api/v1/pedidos/", { params }),
 
  /**
   * GET /pedidos/:id
   * Retorna el detalle completo de un pedido.
   * @param {number} pedidoId
   */
  obtenerPedidoPorId: (pedidoId) =>
    api.get(`/api/v1/pedidos/${pedidoId}`),
 
  /**
   * GET /pedidos/:id/confirmacion
   * Retorna la confirmación de un pedido (post-compra).
   * @param {number} pedidoId
   */
  obtenerConfirmacion: (pedidoId) =>
    api.get(`/api/v1/pedidos/${pedidoId}/confirmacion`),
}
