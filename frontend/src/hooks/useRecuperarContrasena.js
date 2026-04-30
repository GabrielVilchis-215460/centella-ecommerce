import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { authService } from "../services/auth"

export function useRecuperarContrasena() {
  const [email,    setEmail]    = useState("")
  const [error,    setError]    = useState("")
  const [exito,    setExito]    = useState(false)
  const [cargando, setCargando] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async () => {
    if (!email.trim()) return
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    if (!emailValido) { setError("Ingresa un correo electrónico válido."); return }

    try {
      setCargando(true)
      setError("")
      await authService.forgotPassword(email)
      setExito(true)
      setTimeout(() => navigate("/verificar-codigo", { state: { email, modo: "reset" } }), 2500)
    } catch {
      setError("Ocurrió un error. Intenta de nuevo.")
    } finally {
      setCargando(false)
    }
  }

  return { email, setEmail, error, exito, cargando, handleSubmit }
}