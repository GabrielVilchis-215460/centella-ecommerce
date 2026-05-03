import { createContext, useContext, useState, useEffect } from "react"
import { authService } from "../services/auth"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {

  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  // verificar si hay sesion guardada
  useEffect(() => {
    const iniciarSesion = async () => {
      const token = localStorage.getItem("token")
      if (!token) { setCargando(false); return }
      try {
        const me = await authService.getMe()
        setUsuario(me)
      } catch {
        localStorage.removeItem("token")
        localStorage.removeItem("refresh_token")
      } finally {
        setCargando(false)
      }
    }
    iniciarSesion()
  }, [])

  // login
  const login = async (email, contrasena) => {
  try {
    const data = await authService.login(email, contrasena)
    localStorage.setItem("token",         data.access_token)
    localStorage.setItem("refresh_token", data.refresh_token)
    // Obtener datos completos del usuario
    const me = await authService.getMe()
    setUsuario(me)
    return me
  } catch (err) {
    console.log("Error en AuthContext:", err)
    console.log("Error response:", err?.response)
    throw err
  }
}

  // logout
  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("refresh_token")
    setUsuario(null)
  }

  //refresh
  const refreshUsuario = async () => {
    try {
      const me = await authService.getMe()
      setUsuario(me)
    } catch {
      console.error("Error al refrescar usuario")
    }
  }

  // manejo de roles
  const esCliente      = () => usuario?.tipo_usuario === "cliente"
  const esEmprendedora = () => usuario?.tipo_usuario === "emprendedora"
  const esAdmin        = () => usuario?.tipo_usuario === "administrador"
  const estaAutenticado = () => !!usuario

  return (
    <AuthContext.Provider value={{
      usuario,
      cargando,
      login,
      logout,
      refreshUsuario,
      esCliente,
      esEmprendedora,
      esAdmin,
      estaAutenticado,
    }}>
      {!cargando && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider")
  }
  return context
}