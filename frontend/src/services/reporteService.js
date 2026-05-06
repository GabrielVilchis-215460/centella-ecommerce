import api from "./axios"

export const reporteService = {
  crearReporte: async (datos) => {
    const { data } = await api.post("/api/v1/reportes/", datos)
    return data
  },
}