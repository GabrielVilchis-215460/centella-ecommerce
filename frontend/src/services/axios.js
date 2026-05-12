import axios from "axios"
import { toastRef } from "../context/ToastContext"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status
    const esAuthPublico =
      err.config?.url?.includes("/auth/login") ||
      err.config?.url?.includes("/auth/register") ||
      err.config?.url?.includes("/auth/forgot-password") ||
      err.config?.url?.includes("/auth/confirm-reset") ||
      err.config?.url?.includes("/auth/new-password")

    // sesión expirada
    if (status === 401 && !esAuthPublico) {
      toastRef.showToast?.("Tu sesión ha expirado, inicia sesión de nuevo", "warning")
      localStorage.removeItem("token")
      localStorage.removeItem("refresh_token")
      setTimeout(() => { window.location.href = "/login" }, 2000)
    }

    // error de red (sin respuesta del servidor)
    if (!err.response) {
      toastRef.showToast?.("Sin conexión, verifica tu red e intenta de nuevo", "error")
    }

    return Promise.reject(err)
  }
)

export default api