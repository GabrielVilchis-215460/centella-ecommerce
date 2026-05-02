import api from "./axios"

export const pedidosService = {
  obtenerConfirmacion: (id_pedido) =>
    api.get(`/api/v1/pedidos/${id_pedido}/confirmacion`),
}