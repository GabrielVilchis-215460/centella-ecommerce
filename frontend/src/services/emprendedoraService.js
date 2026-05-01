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

  getCatalogoEmprendedoras: async () => {
    const { data } = await api.get("/api/v1/catalogo/emprendedoras")
    return data
  },

  getRatingEmprendedora: async (id_emprendedora) => {
    const { data } = await api.get(`/api/v1/resenas/vendedora/${id_emprendedora}`)
    return data
  },
}
