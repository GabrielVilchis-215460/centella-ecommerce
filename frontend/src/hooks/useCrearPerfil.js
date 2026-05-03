import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { perfilService } from "../services/perfilService"

export const COLORES_PERFIL = [
  { nombre: "Rojo",           hex: "#C7696B" },
  { nombre: "Naranja",        hex: "#D3946D" },
  { nombre: "Amarillo",       hex: "#DACA70" },
  { nombre: "Verde",          hex: "#79BD75" },
  { nombre: "Azul claro",     hex: "#75B2BD" },
  { nombre: "Azul oscuro",    hex: "#7589BD" },
  { nombre: "Morado",         hex: "#8D75BD" },
  { nombre: "Magenta",        hex: "#B86FC7" },
  { nombre: "Rosa",           hex: "#BD759A" },
  { nombre: "Gris",           hex: "#898989" },
]

export function useCrearPerfil() {
  const { usuario, esEmprendedora, login, refreshUsuario } = useAuth()
  const navigate = useNavigate()

  // Paso actual
  const [paso, setPaso] = useState(1)

  // Datos perfil general
  const [nombre,          setNombre]          = useState("")
  const [apellido,        setApellido]        = useState("")
  const [fecha,           setFecha]           = useState({})
  const [fotoPerfil,      setFotoPerfil]      = useState(null)
  const [fotoPreview,     setFotoPreview]     = useState(null)

  // Datos emprendimiento
  const [nombreNegocio,   setNombreNegocio]   = useState("")
  const [descripcion,     setDescripcion]     = useState("")
  const [colorHex,        setColorHex]        = useState(COLORES_PERFIL[0].hex)
  const [logoFile,        setLogoFile]        = useState(null)
  const [logoPreview,     setLogoPreview]     = useState(null)
  const [enlaces,         setEnlaces]         = useState({
    web: null, whatsapp: null, facebook: null, instagram: null
  })

  const [cargando, setCargando] = useState(false)
  const [error,    setError]    = useState("")

  // Manejo de foto de perfil
  const handleFotoPerfil = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setFotoPerfil(file)
    setFotoPreview(URL.createObjectURL(file))
  }

  // Manejo de logo
  const handleLogo = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  // Manejo de enlaces de redes
  const handleEnlaceChange = (red, url) => {
    setEnlaces((prev) => ({ ...prev, [red]: url }))
  }

  // Validación paso 1
  const paso1Valido = nombre.trim() && apellido.trim() && fecha.dia && fecha.mes && fecha.año

  // Validación paso 2
  const paso2Valido = nombreNegocio.trim() && colorHex

  const handleSiguientePaso1 = async () => {
    if (!paso1Valido) return
    try {
      setCargando(true)
      setError("")

      // Actualizar nombre, apellido, fecha
      await perfilService.actualizarPerfil({
        nombre,
        apellido,
        fecha_nacimiento: `${fecha.año}-${fecha.mes}-${fecha.dia}`,
      })

      // Subir foto si hay
      if (fotoPerfil) {
        await perfilService.subirFotoPerfil(fotoPerfil)
      }

      await refreshUsuario()

      if (esEmprendedora()) {
        setPaso(2)
      } else {
        navigate("/catalogo")
      }
    } catch {
      setError("Ocurrió un error. Intenta de nuevo.")
    } finally {
      setCargando(false)
    }
  }

  const handleSiguientePaso2 = async () => {
    if (!paso2Valido) return
    try {
      setCargando(true)
      setError("")

      await perfilService.crearNegocio({
        nombre_negocio:        nombreNegocio,
        descripcion_negocio:   descripcion || null,
        enlace_redes_sociales: enlaces,
        color_emprendedora_hex: colorHex,
      })

      if (logoFile) {
        await perfilService.subirLogo(logoFile)
      }

      navigate("/dashboard")
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(detail || "Ocurrió un error. Intenta de nuevo.")
    } finally {
      setCargando(false)
    }
  }

  return {
    paso,
    // Paso 1
    nombre, setNombre,
    apellido, setApellido,
    fecha, setFecha,
    fotoPreview, handleFotoPerfil,
    paso1Valido,
    handleSiguientePaso1,
    // Paso 2
    nombreNegocio, setNombreNegocio,
    descripcion, setDescripcion,
    colorHex, setColorHex,
    logoPreview, handleLogo,
    enlaces, handleEnlaceChange,
    paso2Valido,
    handleSiguientePaso2,
    // Comunes
    cargando, error,
    setPaso,
  }
}