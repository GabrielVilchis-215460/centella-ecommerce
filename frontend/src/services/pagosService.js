import api from "./axios"

export const pagosService = {
  pagar: (ids_pedido) =>
    api.post("/api/v1/pagos/pay", { ids_pedido }),
}