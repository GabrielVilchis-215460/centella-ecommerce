import { useState, useEffect, useCallback } from "react"
import { emprendedoraService } from "../services/emprendedoraService"

const LIMIT = 10

export function useGestionProductos() {
  const [productos, setProductos]   = useState([])
  const [total, setTotal]           = useState(0)
  const [pagina, setPagina]         = useState(1)
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando]     = useState(true)
  const [error, setError]           = useState(null)

  const cargar = useCallback(async () => {
    try {
      setCargando(true)
      setError(null)
      const data = await emprendedoraService.getProductosNegocio(
        (pagina - 1) * LIMIT,
        LIMIT,
      )
      setProductos(data)
      setTotal(data.length)
    } catch (err) {
      const detail = err?.response?.data?.detail
      setError(typeof detail === "string" ? detail : "Error al cargar productos")
    } finally {
      setCargando(false)
    }
  }, [pagina])

  useEffect(() => {
    cargar()
  }, [cargar])

  useEffect(() => {
    emprendedoraService.getCategorias("producto")
      .then((data) => setCategorias(data))
      .catch(() => setCategorias([]))
  }, [])

    async function crearProducto(datos) {
        try {
            const { imagenes, atributos, ...resto } = datos
            const nuevo = await emprendedoraService.crearProducto(resto)
            return nuevo
        } catch (err) {
            const detail = err?.response?.data?.detail
            setError(typeof detail === "string" ? detail : "Error al crear producto")
        }
    }

    async function actualizarProducto(idProducto, datos) {
        try {
            const { imagenes, atributos, ...resto } = datos
            const actualizado = await emprendedoraService.actualizarProducto(idProducto, resto)
            return actualizado
        } catch (err) {
            const detail = err?.response?.data?.detail
            setError(typeof detail === "string" ? detail : "Error al actualizar producto")
            throw err 
        }
    }

  async function eliminarProducto(idProducto) {
    try {
      await emprendedoraService.eliminarProducto(idProducto)
      setProductos((prev) => prev.filter((p) => p.id_producto !== idProducto))
      setTotal((prev) => prev - 1)
    } catch (err) {
      const detail = err?.response?.data?.detail
      setError(typeof detail === "string" ? detail : "Error al eliminar producto")
    }
  }

  async function obtenerImagenes(idProducto) {
    return await emprendedoraService.getImagenesProducto(idProducto)
  }

  async function obtenerAtributos(idProducto) {
    return await emprendedoraService.getAtributosProducto(idProducto)
    }

   async function crearAtributo(idProducto, tipo, valor) {
    return await emprendedoraService.crearAtributo(idProducto, tipo, valor)
    }

    async function eliminarAtributo(idProducto, idAtributo) {
    return await emprendedoraService.eliminarAtributo(idProducto, idAtributo)
    }

    async function editarAtributo(idProducto, idAtributo, tipo, valor) {
      return await emprendedoraService.editarAtributo(idProducto, idAtributo, tipo, valor)
    }
   async function eliminarImagen(idImagen) {
      try {
        console.log("Intentando borrar imagen con ID: ",idImagen);
        await emprendedoraService.eliminarImagen(idImagen)
        console.log("Imagen borrada con exito de la BD");
      } catch (err) {
        //const detail = err?.response?.data?.detail
        console.error("Error al eliminar la imagen en el backend", err.response?.data || err);
        //setError(typeof detail === "string" ? detail : "Error al eliminar la imagen")
      }
    }
  async function reordenarImagenes(ids) {
    if (!ids || ids.length === 0) return;
    try {
      await emprendedoraService.reordenarImagenes(ids)
    } catch (err) {
      console.error("Error al reordenar las imágenes", err)
    }
  }

  return {
    productos,
    total,
    pagina,
    setPagina,
    totalPaginas: Math.ceil(total / LIMIT) || 1,
    categorias,
    cargando,
    error,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    obtenerImagenes,
    obtenerAtributos,
    crearAtributo,
    eliminarAtributo,
    eliminarImagen,
    reordenarImagenes,
    editarAtributo,
    refrescar: cargar,
  }
}