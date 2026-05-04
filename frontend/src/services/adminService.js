import api from "./axios";

// Endpoints del panel de admin
export const adminService = {
  getDashboard: () => api.get("/api/v1/admin/"),
  getEmprendedoras: (params) => api.get("/api/v1/admin/emprendedoras", { params }),
  verificarEmprendedora: (id) =>
    api.patch(`/api/v1/admin/emprendedoras/${id}/verificar`),
  suspenderEmprendedora: (id) =>
    api.patch(`/api/v1/admin/emprendedoras/${id}/suspender`),
  getInsignias: () => api.get("/api/v1/admin/insignias"),
  aprobarInsignia: (id) => api.patch(`/api/v1/admin/insignias/${id}/aprobar`),
  rechazarInsignia: (id) => api.patch(`/api/v1/admin/insignias/${id}/rechazar`),
  getReportes: () => api.get("/api/v1/admin/reportes"),
  eliminarPublicacion: (id) =>
    api.patch(`/api/v1/admin/reportes/${id}/eliminar-publicacion`),
  suspenderCuenta: (id) =>
    api.patch(`/api/v1/admin/reportes/${id}/suspender-cuenta`),
  descartarReporte: (id) => api.patch(`/api/v1/admin/reportes/${id}/descartar`),
};
