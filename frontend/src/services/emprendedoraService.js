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

  getProductosNegocio: async (skip = 0, limit = 20) => {
    const { data } = await api.get(`/api/v1/perfil/negocio/productos?skip=${skip}&limit=${limit}`)
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
  actualizarNegocio: async (datos) => {
    const { data } = await api.put("/api/v1/perfil/negocio", datos)
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
  // endpoints para crud de servicios
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
