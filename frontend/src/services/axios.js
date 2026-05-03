import axios from "axios"

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
    const is401 = err.response?.status === 401
    const esAuthPublico = 
      err.config?.url?.includes("/auth/login") ||
      err.config?.url?.includes("/auth/register") ||
      err.config?.url?.includes("/auth/forgot-password") ||
      err.config?.url?.includes("/auth/confirm-reset") ||
      err.config?.url?.includes("/auth/new-password")

    if (is401 && !esAuthPublico) {
      localStorage.removeItem("token")
      localStorage.removeItem("refresh_token")
      window.location.href = "/login"
    }

    return Promise.reject(err)
  }
)

export default api