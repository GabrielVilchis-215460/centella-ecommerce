import { useState, useEffect } from "react"
import { emprendedoraService } from "../services/emprendedoraService"

export function useGestionPagina() {
  const [perfil, setPerfil]       = useState(null)
  const [etiquetas, setEtiquetas] = useState([])
  const [rating, setRating]       = useState(null)
  const [bloques, setBloques]     = useState({})  // { bloque1: "texto", bloque2: "texto" }
  const [productos, setProductos] = useState([])
  const [cargando, setCargando]   = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError]         = useState(null)

  useEffect(() => {
    let cancelado = false

    async function cargar() {
      try {
        setCargando(true)
        setError(null)

        // 1. Perfil del negocio → obtiene id_emprendedora
        const perfilData = await emprendedoraService.getPaginaNegocio()
        if (cancelado) return
        setPerfil(perfilData)

        const id = perfilData?.id_emprendedora
        if (!id) return

        // 2. Contenido actual de la página
        const paginaData = await emprendedoraService.getPaginaPublica(id)
        if (cancelado) return
        setBloques(paginaData?.pagina?.contenido ?? {})

        // 3. Productos del negocio
        const productosData = await emprendedoraService.getProductosNegocio()
        if (cancelado) return
        setProductos(productosData)

        // 4. Rating
        const ratingData = await emprendedoraService.getRatingEmprendedora(id)
        if (cancelado) return
        setRating(ratingData)

        // 5. Etiquetas del catálogo
        const catalogo = await emprendedoraService.getCatalogoEmprendedoras()
        if (cancelado) return
        const emp = catalogo.find((e) => e.id_emprendedora === id)
        setEtiquetas(emp?.etiquetas ?? [])

      } catch (err) {
        if (!cancelado) setError(err?.response?.data?.detail || "Error al cargar la página")
      } finally {
        if (!cancelado) setCargando(false)
      }
    }

    cargar()
    return () => { cancelado = true }
  }, [])

  // Agrega un bloque nuevo vacío al final
  function agregarBloque() {
    const siguienteNum = Object.keys(bloques).length + 1
    const key = `bloque${siguienteNum}`
    setBloques((prev) => ({ ...prev, [key]: "" }))
  }

  // Actualiza el texto de un bloque
  function actualizarBloque(key, texto) {
    setBloques((prev) => ({ ...prev, [key]: texto }))
  }

  // Elimina un bloque y renumera los restantes
  function eliminarBloque(key) {
    const nuevos = { ...bloques }
    delete nuevos[key]
    // Renumerar para mantener bloque1, bloque2, etc.
    const renumerados = {}
    Object.values(nuevos).forEach((texto, i) => {
      renumerados[`bloque${i + 1}`] = texto
    })
    setBloques(renumerados)
  }

  // Guarda todos los bloques en el backend
  async function guardarCambios() {
    try {
      setGuardando(true)
      await emprendedoraService.actualizarContenidoPagina(bloques)
    } catch (err) {
      setError(err?.response?.data?.detail || "Error al guardar")
    } finally {
      setGuardando(false)
    }
  }

  return {
    cargando,
    guardando,
    error,
    // Encabezado
    nombreNegocio: perfil?.nombre_negocio       ?? "",
    logoUrl:       perfil?.logo_url              ?? null,
    descripcion:   perfil?.descripcion_negocio   ?? "",
    insignia:      perfil?.insignia_hecho_juarez ?? false,
    etiquetas,
    rating,
    // Contenido editable
    bloques,
    productos,
    // Acciones
    agregarBloque,
    actualizarBloque,
    eliminarBloque,
    guardarCambios,
  }
}