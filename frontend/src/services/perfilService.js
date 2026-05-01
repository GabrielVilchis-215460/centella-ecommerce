import api from "./axios"

// quedan pendiente los demas endpoints
export const perfilService = {
  obtenerDirecciones: () => api.get("/api/v1/perfil/direcciones"),
}