import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { authService } from "../services/auth"

export function useVerificarCodigo({ modo }) {
  // modo: "registro" | "reset"
  const [codigo,    setCodigo]    = useState(["", "", "", "", "", ""])
  const [error,     setError]     = useState("")
  const [cargando,  setCargando]  = useState(false)
  const [cooldown,  setCooldown]  = useState(0)
  const navigate   = useNavigate()
  const location   = useLocation()
  const email      = location.state?.email || ""
  const inputsRef  = useRef([])

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const codigoCompleto = codigo.join("")

  const handleChange = (i, val) => {
    if (val.length === 6 && /^\d{6}$/.test(val)) {
      const nuevo = val.split("")
      setCodigo(nuevo)
      inputsRef.current[5]?.focus()
      return
    }

    // Un dígito a la vez
    if (!/^\d?$/.test(val)) return
    const nuevo = [...codigo]
    nuevo[i] = val
    setCodigo(nuevo)
    if (val && i < 5) inputsRef.current[i + 1]?.focus()
  }

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !codigo[i] && i > 0) {
      inputsRef.current[i - 1]?.focus()
    }
    if (e.key === "Enter" && codigoCompleto.length === 6) {
      handleSubmit()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pegado = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (pegado.length === 6) {
      setCodigo(pegado.split(""))
      inputsRef.current[5]?.focus()
    }
  }

  const handleReenviar = async () => {
    if (cooldown > 0) return
    try {
      if (modo === "registro") {
        await authService.reenviarCodigo(email)
      } else {
        await authService.reenviarCodigoReset(email)
      }
      setCooldown(60)
      setError("")
    } catch (err) {
      const detail = err.response?.data?.detail
      if (detail === "Ya tienes un código activo. Espera antes de solicitar otro.") {
        setError("Ya tienes un código activo. Espera unos minutos antes de solicitar otro.")
        setCooldown(60)
      } else {
        setError("No se pudo reenviar el código. Intenta de nuevo.")
      }
    }
  }

  const handleSubmit = async () => {
    if (codigoCompleto.length < 6) return
    try {
      setCargando(true)
      setError("")
      if (modo === "registro") {
        await authService.verificarEmail(email, codigoCompleto)
        navigate("/crear-perfil", { state: { email } })
      } else {
        await authService.confirmReset(email, codigoCompleto)
        navigate("/nueva-contrasena", { state: { email } })
      }
    } catch (err) {
      const detail = err.response?.data?.detail
      if (detail === "Código inválido o expirado") {
        setError("El código es inválido o ha expirado.")
      } else if (detail === "El código ha expirado") {
        setError("El código ha expirado. Solicita uno nuevo.")
      } else {
        setError("Ocurrió un error. Intenta de nuevo.")
      }
      setCodigo(["", "", "", "", "", ""])
      inputsRef.current[0]?.focus()
    } finally {
      setCargando(false)
    }
  }

  return {
    codigo, email, error, cargando, cooldown,
    codigoCompleto, inputsRef,
    handleChange, handleKeyDown, handlePaste,
    handleReenviar, handleSubmit,
  }
}