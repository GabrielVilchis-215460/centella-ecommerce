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
  try {
    setCargando(true)
    setError("")
    await login(email, contrasena)
    navigate("/")
  } catch (err) {
    const msg = err.response?.data?.detail
    console.log("Detail:", msg)
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