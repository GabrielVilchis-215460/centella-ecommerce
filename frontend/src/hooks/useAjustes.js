import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { perfilService } from "../services/perfilService"
import { useNavigate } from "react-router-dom"

const REQUISITOS_PASS = [
  { id: "longitud",  label: "Mínimo 8 caracteres", regex: /.{8,}/  },
  { id: "mayuscula", label: "Una mayúscula",        regex: /[A-Z]/  },
  { id: "minuscula", label: "Una minúscula",        regex: /[a-z]/  },
  { id: "especial",  label: "Un carácter especial", regex: /[!@#$%^&*(),.?":{}|<>]/ },
  { id: "numero",    label: "Un número",            regex: /\d/     },
]

export function useAjustes() {
  const { usuario, refreshUsuario, esCliente, logout } = useAuth()

  // Perfil general
  const [nombre,          setNombre]          = useState("")
  const [apellido,        setApellido]        = useState("")
  const [fecha,           setFecha]           = useState({})
  const [fotoActual,      setFotoActual]      = useState(null)
  const [fotoFile,        setFotoFile]        = useState(null)
  const [fotoPreview,     setFotoPreview]     = useState(null)

  // Contraseña
  const [contrasenaActual,    setContrasenaActual]    = useState("")
  const [contrasenaNueva,     setContrasenaNueva]     = useState("")
  const [confirmarContrasena, setConfirmarContrasena] = useState("")

  // Direcciones
  const [direcciones,        setDirecciones]        = useState([])
  const [modalDireccion,     setModalDireccion]     = useState(false)
  const [modalEditarDireccion, setModalEditarDireccion] = useState(null)
  // Estados
  const [cargando,     setCargando]     = useState(true)
  const [guardando,    setGuardando]    = useState(false)
  const [errorPerfil,  setErrorPerfil]  = useState("")
  const [errorPass,    setErrorPass]    = useState("")
  const [exitoPerfil,  setExitoPerfil]  = useState(false)
  const [exitoPass,    setExitoPass]    = useState(false)

  const [modalEliminar, setModalEliminar] = useState(false)
  const navigate = useNavigate()

  // Prellenar con datos actuales
  useEffect(() => {
    if (!usuario) return
    setNombre(usuario.nombre || "")
    setApellido(usuario.apellido || "")
    setFotoActual(usuario.foto_perfil_url || null)
    setFotoPreview(usuario.foto_perfil_url || null)

    if (usuario.fecha_nacimiento) {
      const fechaSolo = usuario.fecha_nacimiento.split("T")[0]
      const [año, mes, dia] = fechaSolo.split("-")
      setFecha({ dia, mes, año })
    }

    // Cargar direcciones solo para clientes
    if (esCliente()) {
      perfilService.getDirecciones()
        .then(setDirecciones)
        .catch(() => {})
    }

    setCargando(false)
  }, [usuario])

  // Detectar cambios en perfil
  const perfilCambiado = () => {
    if (!usuario) return false
    const fechaOriginal = usuario.fecha_nacimiento
      ? usuario.fecha_nacimiento.split("T")[0]
      : ""
    const fechaNueva = fecha.año && fecha.mes && fecha.dia
      ? `${fecha.año}-${fecha.mes}-${fecha.dia}`
      : ""
    return (
      nombre    !== (usuario.nombre   || "") ||
      apellido  !== (usuario.apellido || "") ||
      fechaNueva !== fechaOriginal           ||
      fotoFile  !== null
    )
  }

  const requisitosPass = REQUISITOS_PASS.map((r) => ({
    ...r,
    cumplido: r.regex.test(contrasenaNueva),
  }))

  const passValida =
    requisitosPass.every((r) => r.cumplido) &&
    contrasenaNueva === confirmarContrasena &&
    contrasenaActual.trim()

  // Cambiar foto
  const handleFoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setFotoFile(file)
    setFotoPreview(URL.createObjectURL(file))
  }

  // Eliminar foto
  const handleEliminarFoto = async () => {
    try {
      await perfilService.eliminarFotoPerfil()
      setFotoActual(null)
      setFotoPreview(null)
      setFotoFile(null)
      await refreshUsuario()
    } catch {
      setErrorPerfil("Error al eliminar la foto.")
    }
  }

  // Guardar perfil
  const handleGuardarPerfil = async () => {
    if (!perfilCambiado()) return
    try {
      setGuardando(true)
      setErrorPerfil("")
      await perfilService.actualizarPerfil({
        nombre,
        apellido,
        fecha_nacimiento: fecha.año && fecha.mes && fecha.dia
          ? `${fecha.año}-${fecha.mes}-${fecha.dia}`
          : undefined,
      })
      if (fotoFile) await perfilService.subirFotoPerfil(fotoFile)
      await refreshUsuario()
      setFotoFile(null)
      setExitoPerfil(true)
      setTimeout(() => setExitoPerfil(false), 3000)
    } catch {
      setErrorPerfil("Error al guardar los cambios.")
    } finally {
      setGuardando(false)
    }
  }

  // Cambiar contraseña
  const handleCambiarContrasena = async () => {
    if (!passValida) return
    try {
      setGuardando(true)
      setErrorPass("")
      await perfilService.cambiarContrasena({
        contrasena_actual: contrasenaActual,
        contrasena_nueva:  contrasenaNueva,
      })
      setContrasenaActual("")
      setContrasenaNueva("")
      setConfirmarContrasena("")
      setExitoPass(true)
      setTimeout(() => setExitoPass(false), 3000)
    } catch (err) {
      const detail = err.response?.data?.detail
      setErrorPass(detail || "Error al cambiar la contraseña.")
    } finally {
      setGuardando(false)
    }
  }

  // Eliminar dirección
  const handleEliminarDireccion = async (id) => {
    try {
      const eraPrincipal = direcciones.find((d) => d.id_direccion === id)?.es_principal
      await perfilService.eliminarDireccion(id)
      const restantes = direcciones.filter((d) => d.id_direccion !== id)

      // Si era principal y quedan otras, marcar la primera como principal
      if (eraPrincipal && restantes.length > 0) {
        await perfilService.actualizarDireccion(restantes[0].id_direccion, {
          ...restantes[0],
          es_principal: true,
        })
        const nuevas = await perfilService.getDirecciones()
        setDirecciones(nuevas)
      } else {
        setDirecciones(restantes)
      }
    } catch {
      setErrorPerfil("Error al eliminar la dirección.")
    }
  }

  const handleEditarDireccion = async (id, datos) => {
    try {
      await perfilService.actualizarDireccion(id, datos)
      const nuevas = await perfilService.getDirecciones()
      setDirecciones(nuevas)
      setModalEditarDireccion(null)
    } catch (err) {
      throw err
    }
  }

  // Agregar dirección
  const handleAgregarDireccion = async (datos) => {
    try {
      await perfilService.agregarDireccion(datos)
      const nuevas = await perfilService.getDirecciones()
      setDirecciones(nuevas)
      setModalDireccion(false)
    } catch (err) {
      throw err
    }
  }

  const handleEliminarCuenta = async () => {
    try {
        await perfilService.eliminarCuenta()
        logout()
        navigate("/login")
    } catch {
        setErrorPerfil("Error al desactivar la cuenta.")
    }
  }

  return {
    cargando, guardando,
    // Perfil
    nombre, setNombre,
    apellido, setApellido,
    fecha, setFecha,
    fotoPreview,
    handleFoto, handleEliminarFoto,
    handleGuardarPerfil,
    perfilCambiado,
    errorPerfil, exitoPerfil,
    // Contraseña
    contrasenaActual, setContrasenaActual,
    contrasenaNueva, setContrasenaNueva,
    confirmarContrasena, setConfirmarContrasena,
    requisitosPass, passValida,
    handleCambiarContrasena,
    errorPass, exitoPass,
    // Direcciones
    direcciones,
    modalDireccion, setModalDireccion,
    handleEliminarDireccion,
    handleAgregarDireccion,
    modalEditarDireccion, setModalEditarDireccion,
    handleEditarDireccion,
    modalEliminar, setModalEliminar,
    handleEliminarCuenta,
  }
}