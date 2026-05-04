import { useState, useEffect, useRef } from "react"
import { emprendedoraService } from "../services/emprendedoraService"
import { perfilService } from "../services/perfilService"
import { COLORES_PERFIL } from "./useCrearPerfil"

export function useAjustesEmprendimiento() {
  const logoRef = useRef(null)

  const [nombreNegocio,   setNombreNegocio]   = useState("")
  const [descripcion,     setDescripcion]     = useState("")
  const [colorHex,        setColorHex]        = useState("")
  const [enlaces,         setEnlaces]         = useState({
    web: null, whatsapp: null, facebook: null, instagram: null
  })
  const [logoUrl,         setLogoUrl]         = useState(null)
  const [logoFile,        setLogoFile]        = useState(null)
  const [logoPreview,     setLogoPreview]     = useState(null)

  const [estadoVerificacion, setEstadoVerificacion] = useState("")
  const [insignia,           setInsignia]           = useState(false)
  const [solicitudInsignia,  setSolicitudInsignia]  = useState(false)

  // Estados originales para detectar cambios
  const [original, setOriginal] = useState(null)

  const [cargando,  setCargando]  = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error,     setError]     = useState("")
  const [exito,     setExito]     = useState(false)

  useEffect(() => {
    emprendedoraService.getPerfilNegocio()
      .then((data) => {
        setNombreNegocio(data.nombre_negocio || "")
        setDescripcion(data.descripcion_negocio || "")
        setColorHex(data.color_emprendedora_hex || COLORES_PERFIL[0].hex)
        setEnlaces(data.enlace_redes_sociales || {
          web: null, whatsapp: null, facebook: null, instagram: null
        })
        setLogoUrl(data.logo_url || null)
        setLogoPreview(data.logo_url || null)
        setEstadoVerificacion(data.estado_verificacion || "pendiente")
        setInsignia(data.insignia_hecho_juarez || false)
        setSolicitudInsignia(data.solicitud_insignia_activa || false)
        setOriginal(data)
      })
      .catch(() => setError("Error al cargar el perfil"))
      .finally(() => setCargando(false))
  }, [])

  const haycambios = () => {
    if (!original) return false
    return (
      nombreNegocio !== (original.nombre_negocio || "")          ||
      descripcion   !== (original.descripcion_negocio || "")     ||
      colorHex      !== (original.color_emprendedora_hex || "")  ||
      JSON.stringify(enlaces) !== JSON.stringify(original.enlace_redes_sociales || {}) ||
      logoFile !== null
    )
  }

  const handleLogo = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const handleEnlaceChange = (red, url) => {
    setEnlaces((prev) => ({ ...prev, [red]: url }))
  }

  const handleGuardar = async () => {
    if (!haycambios()) return
    try {
      setGuardando(true)
      setError("")
      await emprendedoraService.actualizarNegocio({
        nombre_negocio:         nombreNegocio,
        descripcion_negocio:    descripcion || null,
        enlace_redes_sociales:  enlaces,
        color_emprendedora_hex: colorHex,
      })
      if (logoFile) await perfilService.subirLogo(logoFile)
      setLogoFile(null)
      setExito(true)
      setTimeout(() => setExito(false), 3000)
    } catch (err) {
      setError(err.response?.data?.detail || "Error al guardar los cambios.")
    } finally {
      setGuardando(false)
    }
  }

  const handleSolicitarVerificacion = async () => {
    try {
      await emprendedoraService.solicitarVerificacion()
      setEstadoVerificacion("pendiente")
    } catch (err) {
      setError(err.response?.data?.detail || "Error al solicitar verificación.")
    }
  }

  const handleSolicitarInsignia = async () => {
    try {
      await emprendedoraService.solicitarInsignia()
      setSolicitudInsignia(true)
    } catch (err) {
      setError(err.response?.data?.detail || "Error al solicitar insignia.")
    }
  }

  return {
    cargando, guardando, error, exito,
    logoRef, logoPreview, handleLogo,
    nombreNegocio, setNombreNegocio,
    descripcion, setDescripcion,
    colorHex, setColorHex,
    enlaces, handleEnlaceChange,
    estadoVerificacion,
    insignia, solicitudInsignia,
    haycambios,
    handleGuardar,
    handleSolicitarVerificacion,
    handleSolicitarInsignia,
  }
}