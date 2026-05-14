import { useState, useEffect, useRef } from "react"
import { emprendedoraService } from "../services/emprendedoraService"
import { perfilService } from "../services/perfilService"
import { COLORES_PERFIL } from "./useCrearPerfil"
import { useToast } from "../context/ToastContext"

export function useAjustesEmprendimiento() {
  const { showToast } = useToast()
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
      showToast("Cambios guardados exitosamente", "success")
    } catch (err) {
      showToast(err.response?.data?.detail || "Error al guardar los cambios", "error")
    } finally {
      setGuardando(false)
    }
  }

  const handleSolicitarVerificacion = async () => {
    try {
      await emprendedoraService.solicitarVerificacion()
      setEstadoVerificacion("pendiente")
      showToast("Solicitud de verificación enviada", "success")
    } catch (err) {
      showToast(err.response?.data?.detail || "Error al solicitar verificación", "error")
    }
  }

  const handleSolicitarInsignia = async () => {
    try {
      await emprendedoraService.solicitarInsignia()
      setSolicitudInsignia(true)
      showToast('Solicitud de insignia "Hecho en Juárez" enviada', "success")
    } catch (err) {
      showToast(err.response?.data?.detail || "Error al solicitar insignia", "error")
    }
  }

  return {
    cargando, guardando, error,
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