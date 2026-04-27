import { createContext, useContext, useState, useEffect } from "react"
import { authService } from "../services/auth"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {

  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  // verificar si hay sesion guardada
  useEffect(() => {
    const token = localStorage.getItem("token")
    const usuarioGuardado = localStorage.getItem("usuario")

    if (token && usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado))
    }

    setCargando(false)
  }, [])

  // login
  const login = async (email, contrasena) => {
    const data = await authService.login(email, contrasena)

    localStorage.setItem("token", data.token)
    localStorage.setItem("usuario", JSON.stringify(data.usuario))
    setUsuario(data.usuario)
  }

  // logout
  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("usuario")
    setUsuario(null)
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