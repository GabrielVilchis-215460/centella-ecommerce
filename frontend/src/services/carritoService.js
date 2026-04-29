import api from "./axios"

export const carritoService = {
  // GET /api/v1/carrito  → items del carrito
  obtenerCarrito: () => api.get("/api/v1/carrito"),

  // POST /api/v1/carrito/items = agregar producto
  // DELETE /api/v1/carrito/items/{id_item} = quitar producto
  // PATCH /api/v1/carrito/items/{id_item} = actualizar item
  // GET /api/v1/carrito/totales  
  // POST /api/v1/carrito/checkout  → inicia checkout
}