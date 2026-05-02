import { useState, useEffect } from "react"
import { emprendedoraService } from "../services/emprendedoraService"

export function usePaginaEmprendimiento() {
  const [datos, setDatos]       = useState(null)
  const [perfil, setPerfil]     = useState(null)
  const [etiquetas, setEtiquetas] = useState([])
  const [rating, setRating]     = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError]       = useState(null)
  const [productos, setProductos] = useState([])
  const [servicios, setServicios] = useState([])

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

        // 2. Página pública + productos + servicios
        const paginaData = await emprendedoraService.getPaginaPublica(id)
        if (cancelado) return
        setDatos(paginaData)

        const productosData = await emprendedoraService.getProductosNegocio()
        if (cancelado) return
        setProductos(productosData)

        // 3. Rating
        const ratingData = await emprendedoraService.getRatingEmprendedora(id)
        if (cancelado) return
        setRating(ratingData)

        // 4. Catálogo emprendedoras → filtrar por id para obtener etiquetas
        const catalogo = await emprendedoraService.getCatalogoEmprendedoras()
        if (cancelado) return
        const emp = catalogo.find((e) => e.id_emprendedora === id)
        setEtiquetas(emp?.etiquetas ?? [])

        const serviciosData = await emprendedoraService.getServiciosNegocio()
        if (cancelado) return
        setServicios(serviciosData)

      } catch (err) {
        console.log(">>> error completo:", err)
        console.log(">>> error response:", err?.response)
        console.log(">>> error detail:", err?.response?.data?.detail)
        if (!cancelado) setError(err?.response?.data?.detail || "Error al cargar la página")
      } finally {
        if (!cancelado) setCargando(false)
      }
    }

    cargar()
    return () => { cancelado = true }
  }, [])

  return {
    cargando,
    error,
    // Encabezado
    nombreNegocio:    perfil?.nombre_negocio    ?? "",
    logoUrl:          perfil?.logo_url           ?? null,
    descripcion:      perfil?.descripcion_negocio ?? "",
    insignia:         perfil?.insignia_hecho_juarez ?? false,
    etiquetas,
    rating,           // { promedio_item, promedio_vendedora, total_resenas }
    // Contenido
    htmlContenido: datos?.pagina?.contenido?.html ?? "",
    productos,
    //servicios:        datos?.servicios            ?? [],
    servicios,
  }
}