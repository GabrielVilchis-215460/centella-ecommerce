import api from "./axios"

export const emprendedoraService = {

  getDashboard: async () => {
    const { data } = await api.get("/api/v1/emprendedora/dashboard/")
    return data
  },
  solicitarInsignia: async () => {
    const { data } = await api.post("/api/v1/perfil/negocio/insignia")
    return data
  },
  solicitarVerificacion: async () => {
    const { data } = await api.post("/api/v1/perfil/negocio/verificacion")
    return data
  },
  actualizarPagina: async () => {
    const { data } = await api.put("/api/v1/perfil/negocio/pagina")
    return data
  },
  // endpoints para la gestion y muestreo de pagina
  getPaginaNegocio: async () => {
    const { data } = await api.get("/api/v1/perfil/negocio")
    return data
  },

  actualizarContenidoPagina: async (contenido) => {
    const { data } = await api.patch("/api/v1/paginas/", { contenido })
    return data
  },

  getProductosNegocio: async (skip = 0, limit = 20, soloActivos = false) => {
    const { data } = await api.get(`/api/v1/perfil/negocio/productos?skip=${skip}&limit=${limit}&solo_activos=${soloActivos}`)
    return data
  },

  getPaginaPublica: async (id_emprendedora) => {
    const { data } = await api.get(`/api/v1/paginas/${id_emprendedora}`)
    return data
  },

 /*  getCatalogoEmprendedoras: async () => {
    const { data } = await api.get("/api/v1/catalogo/emprendedoras")
    return data
  }, */
  getEtiquetasNegocio: async (id) => {
    const { data } = await api.get(`/api/v1/perfil/negocio/etiquetas`, {
      params: { id_emprendedora: id }
    })
    return data
  },

  getRatingEmprendedora: async (id_emprendedora) => {
    const { data } = await api.get(`/api/v1/resenas/vendedora/${id_emprendedora}`)
    return data
  },
  getPerfilNegocio: async () => {
    const { data } = await api.get("/api/v1/perfil/negocio")
    return data
  },
  subirImagenPagina: async (file, id_emprendedora) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("entity_id", id_emprendedora)
    formData.append("entity_type", "pagina")
    const { data } = await api.post("/api/v1/imagenes/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })
    return data
  },

  getImagenesPagina: async (id_emprendedora) => {
    const { data } = await api.get(`/api/v1/imagenes/pagina/${id_emprendedora}`)
    return data
  },
  getServiciosNegocio: async (skip = 0, limit = 20) => {
    const { data } = await api.get(`/api/v1/perfil/negocio/servicios?skip=${skip}&limit=${limit}`)
    return data
  },
  getCatalogoEmprendedoras: async () => {
    const { data } = await api.get("/api/v1/catalogo/emprendedoras")
    return data
  },
  // endpoints para crud de productos
  getProductos: async ({ skip = 0, limit = 20 } = {}) => {
    const { data } = await api.get("/api/v1/productos/", { params: { skip, limit } })
    return data
  },
  crearProducto: async (body) => {
    const { data } = await api.post("/api/v1/productos/", body)
    return data
  },
  actualizarProducto: async (idProducto, body) => {
    const { data } = await api.put(`/api/v1/productos/${idProducto}`, body)
    return data
  },
  eliminarProducto: async (idProducto) => {
    await api.delete(`/api/v1/productos/${idProducto}`)
  },
  subirImagenesProducto: async (idProducto, files) => {
    const formData = new FormData()
    files.forEach((file) => formData.append("files", file))
    const { data } = await api.post(`/api/v1/productos/${idProducto}/imagenes`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })
    return data
  },
  getImagenesProducto: async (idProducto) => {
    const { data } = await api.get(`/api/v1/productos/${idProducto}/imagenes`)
    return data
  },
  getAtributosProducto: async (idProducto) => {
    const { data } = await api.get(`/api/v1/productos/${idProducto}/atributos`)
    return data
  },
  crearAtributo: async (idProducto, tipo, valor) => {
    const { data } = await api.post(`/api/v1/productos/${idProducto}/atributos`, null, {
      params: { tipo, valor }
    })
    return data
  },
  eliminarAtributo: async (idProducto, idAtributo) => {
    await api.delete(`/api/v1/productos/${idProducto}/atributos/${idAtributo}`)
  },
  eliminarImagen: async (idImagen) => {
    await api.delete(`/api/v1/imagenes/image/${idImagen}`)
  },
  reordenarImagenes: async (idsImagenes) => {
    const { data } = await api.put("/api/v1/imagenes/reordenar", { ids_imagenes: idsImagenes })
    return data
  },
  // endpoints para crud de servicios
  getServicios: async ({ skip = 0, limit = 20 } = {}) => {
    const { data } = await api.get("/api/v1/servicios/", { params: { skip, limit } })
    return data
  },
  crearServicio: async (body) => {
    const { data } = await api.post("/api/v1/servicios/", body)
    return data
  },
  actualizarServicio: async (idServicio, body) => {
    const { data } = await api.put(`/api/v1/servicios/${idServicio}`, body)
    return data
  },
  eliminarServicio: async (idServicio) => {
    await api.delete(`/api/v1/servicios/${idServicio}`)
  },
  getCategorias: async (tipo) => {
    const { data } = await api.get("/api/v1/catalogo/categorias", { params: { tipo } })
    return data
  },
  // endpoints para gestion de estado de pedidos
  getPedidos: async ({ skip = 0, limit = 10, ordenar_por } = {}) => {
    const { data } = await api.get("/api/v1/pedidos/", {
      params: {
        skip,
        limit,
        ...(ordenar_por && { ordenar_por }),
      }
    })
    return data
  },
  getDetallePedido: async (idPedido) => {
    const { data } = await api.get(`/api/v1/pedidos/${idPedido}`)
    return data
  },
  actualizarPedido: async (idPedido, body) => {
    const { data } = await api.patch(`/api/v1/pedidos/${idPedido}`, body)
    return data
  },
}
