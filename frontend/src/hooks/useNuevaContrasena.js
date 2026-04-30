import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { authService } from "../services/auth"

const REQUISITOS = [
  { id: "longitud",  label: "Usa 8 caracteres o más",  regex: /.{8,}/          },
  { id: "mayuscula", label: "Una mayúscula",            regex: /[A-Z]/          },
  { id: "minuscula", label: "Una minúscula",            regex: /[a-z]/          },
  { id: "especial",  label: "Un carácter especial",     regex: /[!@#$%^&*(),.?":{}|<>]/ },
  { id: "numero",    label: "Un número",                regex: /\d/             },
]

export function useNuevaContrasena() {
  const [contrasena,  setContrasena]  = useState("")
  const [confirmar,   setConfirmar]   = useState("")
  const [error,       setError]       = useState("")
  const [cargando,    setCargando]    = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const email    = location.state?.email || ""

  const requisitos = REQUISITOS.map((r) => ({
    ...r,
    cumplido: r.regex.test(contrasena),
  }))

  const formularioValido =
    requisitos.every((r) => r.cumplido) &&
    contrasena === confirmar

  const handleSubmit = async () => {
    if (!formularioValido) return
    try {
      setCargando(true)
      setError("")
      await authService.newPassword(email, contrasena)
      navigate("/login")
    } catch (err) {
      const detail = err.response?.data?.detail
      if (detail === "Debes verificar el código primero") {
        setError("Debes verificar tu código antes de cambiar la contraseña.")
      } else {
        setError("Ocurrió un error. Intenta de nuevo.")
      }
    } finally {
      setCargando(false)
    }
  }

  return {
    contrasena, setContrasena,
    confirmar, setConfirmar,
    requisitos, formularioValido,
    error, cargando,
    handleSubmit,
  }
}