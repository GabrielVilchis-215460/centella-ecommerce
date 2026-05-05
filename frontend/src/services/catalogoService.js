import api from "./axios"

const LIMIT = 30 // productos
const LIMIT_2COL = 20 // servicios y emprendedoras

export const catalogoService = {

  getProductos: async (params = {}) => {
    const { data } = await api.get("/api/v1/catalogo/productos", {
      params: {
        limit:        params.limit       ?? LIMIT,
        skip:         params.skip        ?? 0,
        id_categoria: params.id_categoria ?? undefined,
        nombre:       params.nombre       ?? undefined,
        precio_min:   params.precio_min   ?? undefined,
        precio_max:   params.precio_max   ?? undefined,
        hecho_juarez: params.hecho_juarez ?? undefined,
        tipo_entrega: params.tipo_entrega ?? undefined,
        ordenar_por:  params.ordenar_por  ?? undefined,
      }
    })
    return data
  },

  getServicios: async (params = {}) => {
    const { data } = await api.get("/api/v1/catalogo/servicios", {
      params: {
        limit:        params.limit       ?? LIMIT_2COL,
        skip:         params.skip        ?? 0,
        id_categoria: params.id_categoria ?? undefined,
        nombre:       params.nombre       ?? undefined,
        precio_min:   params.precio_min   ?? undefined,
        precio_max:   params.precio_max   ?? undefined,
        ordenar_por:  params.ordenar_por  ?? undefined,
      }
    })
    return data
  },

  getEmprendedoras: async (params = {}) => {
    const { data } = await api.get("/api/v1/catalogo/emprendedoras", {
      params: {
        limit:       params.limit      ?? LIMIT_2COL,
        skip:        params.skip       ?? 0,
        nombre:      params.nombre      ?? undefined,
        ordenar_por: params.ordenar_por ?? undefined,
        verificadas:    params.verificadas     ?? undefined,
        solo_productos: params.solo_productos  ?? undefined,
        solo_servicios: params.solo_servicios  ?? undefined,
      }
    })
    return data
  },

  getCategorias: async (tipo) => {
    const { data } = await api.get("/api/v1/catalogo/categorias", {
        params: { tipo }
    })
    return data
  },

  getDetalleProducto: async (id) => {
    const { data } = await api.get(`/api/v1/productos/${id}/detalle`)
    return data
  },

  getDetalleServicio: async (id) => {
    const { data } = await api.get(`/api/v1/servicios/${id}/detalle`)
    return data
  },

  getResenasProducto: async (id) => {
    const { data } = await api.get(`/api/v1/resenas/referencia/${id}/producto`)
    return data
  },

  getResenasServicio: async (id) => {
    const { data } = await api.get(`/api/v1/resenas/referencia/${id}/servicio`)
    return data
  },

  crearResena: async (datos) => {
    const { data } = await api.post("/api/v1/resenas/create", datos)
    return data
  },

}