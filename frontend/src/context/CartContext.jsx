import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { carritoService } from "../services/carritoService"
import { useAuth } from "./AuthContext"

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { usuario, esCliente, estaAutenticado } = useAuth()
  const [items, setItems]           = useState([])
  const [totalPagar, setTotalPagar] = useState(0)
  const [cargando, setCargando]     = useState(false)

  const cargarCarrito = useCallback(async () => {
    // debug
    /*console.log("usuario:", usuario)
    console.log("esCliente:", esCliente())
    console.log("estaAutenticado:", estaAutenticado())*/
    if (!estaAutenticado() || !esCliente() || !usuario?.id) return
    try {
      setCargando(true)
      const res = await carritoService.obtenerTotales(usuario.id)
      // Mapear al shape que espera CartDropdown
      const itemsMapeados = res.data.items.map((item) => ({
        id:       item.id_item,
        nombre:   item.nombre_producto,
        precio:   item.precio_unitario,
        cantidad: item.cantidad,
        imagen:   item.imagen_url,
        tipo_entrega_seleccionado: item.tipo_entrega_seleccionado,
      }))
      setItems(itemsMapeados)
      setTotalPagar(res.data.total_pagar)
    } catch (err) {
      console.error("Error al cargar carrito:", err)
    } finally {
      setCargando(false)
    }
  }, [usuario?.id, estaAutenticado, esCliente])

  useEffect(() => {
    cargarCarrito()
  }, [cargarCarrito])

  const eliminarItem = async (id_item) => {
    setItems((prev) => prev.filter((i) => i.id !== id_item)) // optimistic
    try {
      await carritoService.eliminarItem(id_item)
      await cargarCarrito() // re-sincronizar totales
    } catch (err) {
      console.error("Error al eliminar item:", err)
      cargarCarrito() // revertir
    }
  }

  const actualizarCantidad = async (id_item, cantidad) => {
    if (cantidad < 1) return
    setItems((prev) =>
      prev.map((i) => (i.id === id_item ? { ...i, cantidad } : i))
    ) // optimistic
    try {
      await carritoService.actualizarItem(id_item, cantidad)
      await cargarCarrito() // re-sincronizar totales
    } catch (err) {
      console.error("Error al actualizar cantidad:", err)
      cargarCarrito() // revertir
    }
  }

  const agregarItem = async (id_producto, cantidad = 1, tipo_entrega_seleccionado) => {
    if (!estaAutenticado() || !usuario) {
      console.warn("Intento de agregar al carrito sin sesión activa.");
      return; 
    }
    try {
      await carritoService.agregarItem(
        usuario.id,
        id_producto,
        cantidad,
        tipo_entrega_seleccionado
      );
      
      await cargarCarrito();

    } catch (err) {
      // PASO 4: Manejo de errores
      // Si falla la conexión o la base de datos, lo registramos para poder depurar
      console.error("Error al agregar item al carrito:", err);
    }
  };

  const totalItems = items.reduce((acc, i) => acc + i.cantidad, 0)

  return (
    <CartContext.Provider value={{
      items,
      totalPagar,
      totalItems,
      cargando,
      agregarItem,
      eliminarItem,
      actualizarCantidad,
      cargarCarrito,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart debe usarse dentro de un CartProvider")
  return context
}