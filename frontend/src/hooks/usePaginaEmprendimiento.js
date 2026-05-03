import { useState, useEffect } from "react"
import { emprendedoraService } from "../services/emprendedoraService"
import { useParams } from "react-router-dom"

export function usePaginaEmprendimiento() {
  const [datos, setDatos]       = useState(null)
  const [perfil, setPerfil]     = useState(null)
  const [etiquetas, setEtiquetas] = useState([])
  const [rating, setRating]     = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError]       = useState(null)
  const [productos, setProductos] = useState([])
  const [servicios, setServicios] = useState([])
  const { id } = useParams()

  useEffect(() => {
    let cancelado = false
    

    async function cargar() {
      try {
        setCargando(true)
        setError(null)

        // 1. Perfil del negocio → obtiene id_emprendedora
        /*const perfilData = await emprendedoraService.getPaginaNegocio()
        if (cancelado) return
        setPerfil(perfilData)

        const id = perfilData?.id_emprendedora
        if (!id) return

        // 2. Página pública + productos + servicios
        const paginaData = await emprendedoraService.getPaginaPublica(id)
        if (cancelado) return
        setDatos(paginaData)*/

       /* const productosData = await emprendedoraService.getProductosNegocio()
        if (cancelado) return
        setProductos(productosData)*/

        // 1.  reemplaza getPaginaNegocio por el catálogo
        const catalogo = await emprendedoraService.getCatalogoEmprendedoras()
        if (cancelado) return
        const emp = Array.isArray(catalogo) 
          ? catalogo.find((e) => e.id_emprendedora === Number(id))
          : catalogo?.items?.find((e) => e.id_emprendedora === Number(id))
        setPerfil(emp ?? null)
        //console.log(">>> catalogo:", catalogo)

        // 2. Página pública
        const paginaData = await emprendedoraService.getPaginaPublica(id)
        if (cancelado) return
        setDatos(paginaData)
        setProductos(paginaData?.productos ?? [])
        setServicios(paginaData?.servicios ?? [])

        // 3. Rating  
        const ratingData = await emprendedoraService.getRatingEmprendedora(id)
        if (cancelado) return
        setRating(ratingData)

        // 4. Catálogo emprendedoras → filtrar por id para obtener etiquetas
       /*  const catalogo = await emprendedoraService.getCatalogoEmprendedoras()
        if (cancelado) return
        const emp = catalogo.find((e) => e.id_emprendedora === id)
        setEtiquetas(emp?.etiquetas ?? []) */
        const etiquetasData = await emprendedoraService.getEtiquetasNegocio(id)
        if (cancelado) return
        setEtiquetas(etiquetasData?.etiquetas ?? [])
        console.log(">>> catalogo:", catalogo)
        console.log(">>> id buscado:", Number(id))
        console.log(">>> emp:", emp)
        setEtiquetas(emp?.etiquetas ?? [])

        /*const serviciosData = await emprendedoraService.getServiciosNegocio()
        if (cancelado) return
        setServicios(serviciosData)*/

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
  }, [id])

  return {
    cargando,
    error,
    // Encabezado
    nombreNegocio:    perfil?.nombre_negocio    ?? "",
    logoUrl:          perfil?.logo_url           ?? null,
    descripcion:      perfil?.descripcion_negocio ?? "",
    insignia:         perfil?.insignia_hecho_juarez ?? false,
    verificada:    perfil?.estado_verificacion === "verificada",
    etiquetas,
    rating,           // { promedio_item, promedio_vendedora, total_resenas }
    // Contenido
    htmlContenido: datos?.pagina?.contenido?.html ?? "",
    productos,
    //servicios:        datos?.servicios            ?? [],
    servicios,
  }
}