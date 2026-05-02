import api from "./axios" 

const API_URL = import.meta.env.VITE_API_URL

export const authService = {

  login: async (email, contrasena) => {
    const { data } = await api.post("/api/v1/auth/login", { email, contrasena })
    return data
    // Devuelve: { access_token, refresh_token, token_type, tipo_usuario }
  },

  getMe: async () => {
    const { data } = await api.get("/api/v1/auth/me")
    return data
    // Devuelve: { id, email, nombre, apellido, tipo_usuario, fecha_registro }
  },

  registro: async (datosUsuario) => {
    const { data } = await api.post("/api/v1/auth/register", datosUsuario)
    return data
  },

  verificarEmail: async (email, codigo) => {
    const { data } = await api.post("/api/v1/auth/verify", { email, codigo })
    return data
  },

  forgotPassword: async (email) => {
    const { data } = await api.post("/api/v1/auth/forgot-password", { email })
    return data
  },

  confirmReset: async (email, codigo) => {
    const { data } = await api.post("/api/v1/auth/confirm-reset", { email, codigo })
    return data
  },

  newPassword: async (email, contrasena_nueva) => {
    const { data } = await api.post("/api/v1/auth/new-password", { email, contrasena_nueva })
    return data
  },
  
  reenviarCodigo: async (email) => {
  const { data } = await api.post("/api/v1/auth/resend-verification", { email })
  return data
  },

  reenviarCodigoReset: async (email) => {
  const { data } = await api.post("/api/v1/auth/resend-reset-code", { email })
  return data
  },
}