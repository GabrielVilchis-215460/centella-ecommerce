import api from "./axios";

// Endpoints del panel de admin
export const adminService = {
  getDashboard: () => api.get("/api/v1/admin/"),
  getEmprendedoras: (params) => api.get("/api/v1/admin/emprendedoras", { params }),
  verificarEmprendedora: (id) =>
    api.patch(`/api/v1/admin/emprendedoras/${id}/verificar`),
  suspenderEmprendedora: (id) =>
    api.patch(`/api/v1/admin/emprendedoras/${id}/suspender`),
  getInsignias: (params = {}) => api.get("/api/v1/admin/insignias", {
    params: {
      q:                params.q                ?? undefined,
      solicitud_activa: params.solicitud_activa ?? undefined,
      insignia:         params.insignia         ?? undefined,
      ordenar_por:      params.ordenar_por      ?? undefined,
    }
  }),
  aprobarInsignia: (id) => api.patch(`/api/v1/admin/insignias/${id}/aprobar`),
  rechazarInsignia: (id) => api.patch(`/api/v1/admin/insignias/${id}/rechazar`),
  revocarInsignia: (id) => api.patch(`/api/v1/admin/insignias/${id}/revocar`),
  getReportes: () => api.get("/api/v1/admin/reportes"),
  eliminarPublicacion: (id) =>
    api.patch(`/api/v1/admin/reportes/${id}/eliminar-publicacion`),
  suspenderCuenta: (id) =>
    api.patch(`/api/v1/admin/reportes/${id}/suspender-cuenta`),
  descartarReporte: (id) => api.patch(`/api/v1/admin/reportes/${id}/descartar`),
};
