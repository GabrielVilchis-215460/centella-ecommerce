import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export function useLogin() {
  const [email,      setEmail]      = useState("")
  const [contrasena, setContrasena] = useState("")
  const [error,      setError]      = useState("")
  const [cargando,   setCargando]   = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleSubmit = async () => {
    if (!email.trim() || !contrasena.trim()) return

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    if (!emailValido) {
      setError("Ingresa un correo electrónico válido.")
      return
    }

    try {
      setCargando(true)
      setError("")
      const me = await login(email, contrasena)

      if (me.tipo_usuario === "administrador")    navigate("/admin")
      else if (me.tipo_usuario === "emprendedora") navigate("/dashboard")
      else navigate("/")

    } catch (err) {
      const msg = err.response?.data?.detail

      if (Array.isArray(msg)) {
        setError("Por favor verifica que todos los campos estén correctos.")
        return
      }

      if (msg === "Debes verificar tu correo antes de iniciar sesión") {
        setError("Debes verificar tu correo antes de iniciar sesión.")
      } else if (msg === "Credenciales incorrectas") {
        setError("Correo o contraseña incorrectos.")
      } else {
        setError("Ocurrió un error. Intenta de nuevo.")
      }
    } finally {
      setCargando(false)
    }
  }

  return {
    email, setEmail,
    contrasena, setContrasena,
    error, cargando,
    handleSubmit,
  }
}