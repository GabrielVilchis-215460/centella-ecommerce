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
  }
}
