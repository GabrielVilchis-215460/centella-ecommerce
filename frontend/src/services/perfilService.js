import api from "./axios"

// quedan pendiente los demas endpoints
export const perfilService = {
  obtenerDirecciones: () => api.get("/api/v1/perfil/direcciones"),

  actualizarPerfil: async (datos) => {
    console.log("Token:", localStorage.getItem("token"))
    const { data } = await api.put("/api/v1/perfil/", datos)
    return data
  },

  subirFotoPerfil: async (file) => {
    const formData = new FormData()
    formData.append("file", file)
    const { data } = await api.post("/api/v1/perfil/foto", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })
    return data
  },

  crearNegocio: async (datos) => {
    const { data } = await api.put("/api/v1/perfil/negocio", datos)
    return data
  },

  subirLogo: async (file) => {
    const formData = new FormData()
    formData.append("file", file)
    const { data } = await api.post("/api/v1/perfil/negocio/logo", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })
    return data
  },
}