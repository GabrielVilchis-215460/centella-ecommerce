import api from "./axios"

export const carritoService = {
  // GET /api/v1/carrito  → items del carrito
  obtenerCarrito: (id) =>
    api.get("/api/v1/carrito/", { params: { id } }),

  // POST /api/v1/carrito/items = agregar producto
  agregarItem: (id_usuario, id_producto, cantidad, tipo_entrega_seleccionado) =>
    api.post("/api/v1/carrito/items", 
      { id_producto, cantidad, tipo_entrega_seleccionado },
      { params: { id_usuario } }
    ),

  // DELETE /api/v1/carrito/items/{id_item} = quitar producto
  eliminarItem: (id_item) =>
    api.delete(`/api/v1/carrito/items/${id_item}`),

  // PATCH /api/v1/carrito/items/{id_item} = actualizar item
  actualizarItem: (id_item, cantidad) =>
    api.patch(`/api/v1/carrito/items/${id_item}`, { cantidad }),

  // GET /api/v1/carrito/totales  
  obtenerTotales: (id_usuario) =>
    api.get("/api/v1/carrito/totales", { params: { id_usuario } }),

  // POST /api/v1/carrito/checkout  → inicia checkout
  checkout: (id_usuario, checkoutData) =>
    api.post("/api/v1/carrito/checkout", checkoutData, { params: { id_usuario } }),

}