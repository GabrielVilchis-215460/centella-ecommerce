import { useState, useEffect } from "react"
import { emprendedoraService } from "../services/emprendedoraService"

export function useGestionPagina() {
  const [perfil, setPerfil]       = useState(null)
  const [etiquetas, setEtiquetas] = useState([])
  const [rating, setRating]       = useState(null)
  const [htmlContenido, setHtmlContenido] = useState("") // HTML string
  const [productos, setProductos] = useState([])
  const [cargando, setCargando]   = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError]         = useState(null)
  const [servicios, setServicios] = useState([])

  useEffect(() => {
    let cancelado = false

    async function cargar() {
      try {
        setCargando(true)
        setError(null)

        const perfilData = await emprendedoraService.getPerfilNegocio()
        if (cancelado) return
        setPerfil(perfilData)

        const id = perfilData?.id_emprendedora
        if (!id) return

        // Obtener contenido HTML actual
        const paginaData = await emprendedoraService.getPaginaPublica(id)
        if (cancelado) return
        setHtmlContenido(paginaData?.pagina?.contenido?.html ?? "")

        const productosData = await emprendedoraService.getProductosNegocio()
        if (cancelado) return
        setProductos(productosData)

        const ratingData = await emprendedoraService.getRatingEmprendedora(id)
        if (cancelado) return
        setRating(ratingData)

        const catalogo = await emprendedoraService.getCatalogoEmprendedoras()
        if (cancelado) return
        const emp = catalogo.find((e) => e.id_emprendedora === id)
        setEtiquetas(emp?.etiquetas ?? [])

        const serviciosData = await emprendedoraService.getServiciosNegocio()
        if (cancelado) return
        setServicios(serviciosData)

      } catch (err) {
        console.log(">>> error completo:", err)
        console.log(">>> response:", err?.response)
        if (!cancelado) setError(err?.response?.data?.detail || "Error al cargar la página")
      } finally {
        if (!cancelado) setCargando(false)
      }
    }

    cargar()
    return () => { cancelado = true }
  }, [])

  async function guardarCambios(html) {
    try {
      setGuardando(true)
      await emprendedoraService.actualizarContenidoPagina({ html })
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
    nombreNegocio:  perfil?.nombre_negocio       ?? "",
    logoUrl:        perfil?.logo_url              ?? null,
    insignia:       perfil?.insignia_hecho_juarez ?? false,
    idEmprendedora: perfil?.id_emprendedora       ?? null,
    etiquetas,
    rating,
    htmlContenido,
    productos,
    guardarCambios,
    servicios,
  }
}