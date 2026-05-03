import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { authService } from "../services/auth"

const REQUISITOS = [
  { id: "longitud",  label: "Usa 8 caracteres o más",  regex: /.{8,}/          },
  { id: "mayuscula", label: "Una mayúscula",            regex: /[A-Z]/          },
  { id: "minuscula", label: "Una minúscula",            regex: /[a-z]/          },
  { id: "especial",  label: "Un carácter especial",     regex: /[!@#$%^&*(),.?":{}|<>]/ },
  { id: "numero",    label: "Un número",                regex: /\d/             },
]

export function useRegistro() {
  const [tipoUsuario,      setTipoUsuario]      = useState("cliente")
  const [email,            setEmail]            = useState("")
  const [contrasena,       setContrasena]       = useState("")
  const [confirmar,        setConfirmar]        = useState("")
  const [aceptaTerminos,   setAceptaTerminos]   = useState(false)
  const [error,            setError]            = useState("")
  const [cargando,         setCargando]         = useState(false)
  const navigate = useNavigate()

  const requisitos = REQUISITOS.map((r) => ({
    ...r,
    cumplido: r.regex.test(contrasena),
  }))

  const formularioValido =
    email.trim() &&
    requisitos.every((r) => r.cumplido) &&
    contrasena === confirmar &&
    aceptaTerminos

  const handleSubmit = async () => {
    if (!formularioValido) return

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    if (!emailValido) {
      setError("Ingresa un correo electrónico válido.")
      return
    }

    try {
      setCargando(true)
      setError("")
      await authService.registro({
        email,
        contrasena,
        nombre:      "",
        apellido:    "",
        tipo_usuario: tipoUsuario,
      })
      // Redirige a verificación de correo pasando el email y contraseña para hacer login y obtener token
      navigate("/verificar-correo", { state: { email, contrasena, modo: "registro"} })
    } catch (err) {
      const detail = err.response?.data?.detail
      if (Array.isArray(detail)) {
        setError("Por favor verifica que todos los campos estén correctos.")
      } else if (detail === "El email ya está registrado") {
        setError("Este correo ya tiene una cuenta registrada.")
      } else {
        setError("Ocurrió un error. Intenta de nuevo.")
      }
    } finally {
      setCargando(false)
    }
  }

  return {
    tipoUsuario, setTipoUsuario,
    email, setEmail,
    contrasena, setContrasena,
    confirmar, setConfirmar,
    aceptaTerminos, setAceptaTerminos,
    requisitos,
    formularioValido,
    error, cargando,
    handleSubmit,
  }
}