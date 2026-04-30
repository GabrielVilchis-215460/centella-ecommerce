
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Header } from "../../components/layout/Header"
import { Footer } from "../../components/layout/Footer"
import { useCart } from "../../context/CartContext"
import { useAuth } from "../../context/AuthContext"
import { perfilService } from "../../services/perfilService"
import { enviosService } from "../../services/enviosService"

export function Checkout() {
  const navigate  = useNavigate()
  const { items, totalPagar, cargando }  = useCart()
  const { usuario } = useAuth()
  const [redirigiendo, setRedirigiendo] = useState(false)
  const [direcciones, setDirecciones] = useState([])
  const [direccionId, setDireccionId] = useState(null)
  const [costoEnvio, setCostoEnvio] = useState(null)
  const [cotizando, setCotizando] = useState(false)
  const [cargandoDirs, setCargandoDirs] = useState(true)

  // redirigir si el carrito esta vacio
  useEffect(() => {
    // debug
    // console.log("cargando:", cargando, "items:", items.length)
    if (!cargando && items.length === 0) {
      setRedirigiendo(true)
      setTimeout(() => navigate("/catalogo", { replace: true }), 2000)
    }
  }, [items, cargando])

  // ¿algún item requiere envío?
  const tieneEnvio = items.some(
    (i) => i.tipo_entrega_seleccionado === "envio"
  )

  // 1. Cargar direcciones
  useEffect(() => {
    perfilService.obtenerDirecciones()
      .then((res) => {
        setDirecciones(res.data)
        // Preseleccionar la principal si existe
        const principal = res.data.find((d) => d.es_principal)
        if (principal) setDireccionId(principal.id_direccion)
      })
      .catch((err) => console.error("Error al cargar direcciones:", err))
      .finally(() => setCargandoDirs(false))
  }, [])

  // 2. Cotizar envío cuando cambia la dirección seleccionada
  useEffect(() => {
    if (!tieneEnvio || !direccionId) {
      setCostoEnvio(0)
      return
    }
    const dir = direcciones.find((d) => d.id_direccion === direccionId)
    if (!dir) return

    const cotizar = async () => {
      setCotizando(true)
      try {
        const destino = {
          name:       `${usuario.nombre} ${usuario.apellido}`,
          phone:      dir.numero_telefonico,
          street:     dir.calle,
          number:     dir.numero_ext || "S/N",
          city:       dir.ciudad,
          state:      dir.estado,
          country:    "MX",
          postalCode: dir.codigo_postal,
        }
        const paquete = {
          content:        "Productos varios",
          weight:         1.5,
          length:         30,
          width:          20,
          height:         10,
          declared_value: totalPagar,
          amount:         1,
        }
        const res = await enviosService.cotizar(destino, paquete)
        // Tomar la tarifa más barata
        const tarifas = res.data.tarifas
        const minima  = tarifas.reduce((a, b) =>
          parseFloat(a.totalPrice) < parseFloat(b.totalPrice) ? a : b
        )
        setCostoEnvio(parseFloat(minima.totalPrice))
      } catch (err) {
        console.error("Error al cotizar envío:", err)
        setCostoEnvio(150) // fallback igual que el backend
      } finally {
        setCotizando(false)
      }
    }
    cotizar()
  }, [direccionId, direcciones, tieneEnvio, totalPagar, usuario])

  const total = totalPagar + (costoEnvio ?? 0)

  const handleProceder = () => {
  sessionStorage.setItem("checkout_id_direccion", direccionId ?? "")
  sessionStorage.setItem("checkout_costo_envio", costoEnvio ?? 0)  // ← ¿está esto?
  sessionStorage.setItem("checkout_total", total)
  navigate("/checkout/pago")
}

    if (redirigiendo) return (
    <div className="min-h-screen flex flex-col bg-bg-dark">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center gap-3">
        <span className="font-heading text-lg text-text-dark">Tu carrito está vacío</span>
        <span className="font-body text-sm text-text-regular">
          Redirigiendo al catálogo...
        </span>
      </main>
      <Footer />
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-bg-dark">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10 flex flex-col gap-8">

        {/* Stepper */}
        <Stepper paso={1} />

        <div className="flex gap-8 items-start">

          {/* Tabla de productos */}
          <div className="flex-1 flex flex-col gap-4">

            {/* Encabezado tabla */}
            <div className="grid grid-cols-[2fr_1fr_1fr] px-2">
              <span className="font-body text-sm text-text-regular">Producto</span>
              <span className="font-body text-sm text-text-regular text-center">Cantidad</span>
              <span className="font-body text-sm text-text-regular text-right">Precio</span>
            </div>

            <div className="flex flex-col divide-y divide-text-light/20">
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-[2fr_1fr_1fr] items-center py-4 px-2 gap-4">
                  {/* Producto */}
                  <div className="flex items-center gap-3">
                    <img
                      src={item.imagen}
                      alt={item.nombre}
                      className="w-16 h-16 object-cover rounded-md shrink-0"
                    />
                    <span className="font-body text-sm text-text-dark leading-snug">
                      {item.nombre}
                    </span>
                  </div>
                  {/* Cantidad */}
                  <span className="font-body text-sm text-text-dark text-center">
                    {item.cantidad}
                  </span>
                  {/* Precio */}
                  <span className="font-body text-sm text-text-dark text-right">
                    ${(item.precio * item.cantidad).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>

            {/* Selector de dirección */}
            {tieneEnvio && (
              <div className="mt-4 flex flex-col gap-2">
                <span className="font-body text-sm font-medium text-text-dark">
                  Dirección de envío
                </span>
                {cargandoDirs ? (
                  <span className="font-body text-sm text-text-light">Cargando direcciones...</span>
                ) : direcciones.length === 0 ? (
                  <span className="font-body text-sm text-error">
                    No tienes direcciones guardadas. Agrega una en tu perfil.
                  </span>
                ) : (
                  <div className="flex flex-col gap-2">
                    {direcciones.map((dir) => (
                      <label
                        key={dir.id_direccion}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          direccionId === dir.id_direccion
                            ? "border-primary bg-primary/5"
                            : "border-text-light/30 hover:border-primary/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="direccion"
                          value={dir.id_direccion}
                          checked={direccionId === dir.id_direccion}
                          onChange={() => setDireccionId(dir.id_direccion)}
                          className="mt-1 accent-primary"
                        />
                        <div className="flex flex-col">
                          <span className="font-body text-sm text-text-dark">
                            {dir.calle} {dir.numero_ext && `#${dir.numero_ext}`}
                            {dir.numero_int && ` Int. ${dir.numero_int}`}
                          </span>
                          <span className="font-body text-xs text-text-regular">
                            {dir.colonia}, {dir.ciudad}, {dir.estado} CP {dir.codigo_postal}
                          </span>
                          {dir.es_principal && (
                            <span className="font-body text-xs text-primary mt-0.5">Principal</span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Resumen */}
          <div className="w-64 shrink-0 bg-bg-light rounded-xl p-5 flex flex-col gap-3 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="font-body text-sm text-text-regular">Subtotal</span>
              <span className="font-body text-sm text-text-dark">
                ${totalPagar.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
              </span>
            </div>

            {tieneEnvio && (
              <div className="flex justify-between items-center">
                <span className="font-body text-sm text-text-regular">Envío</span>
                <span className="font-body text-sm text-text-dark">
                  {cotizando
                    ? "Cotizando..."
                    : costoEnvio !== null
                    ? `$${costoEnvio.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
                    : "—"
                  }
                </span>
              </div>
            )}

            <div className="border-t border-text-light/30 pt-3 flex justify-between items-center">
              <span className="font-body text-base font-medium text-text-dark">Total</span>
              <span className="font-body text-base font-medium text-text-dark">
                ${total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <button
              onClick={handleProceder}
              disabled={cotizando || (tieneEnvio && !direccionId)}
              className="w-full bg-primary text-white font-body text-sm py-2.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            >
              Procede al pago
            </button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}

// Stepper separado para reutilizarlo en las siguientes vistas
export function Stepper({ paso }) {
  const pasos = [
    { label: "Carrito",      icon: "🛒", num: 1 },
    { label: "Pago",         icon: "$",  num: 2 },
    { label: "Confirmación", icon: "✓",  num: 3 },
  ]
  return (
    <div className="flex items-center justify-center gap-0">
      {pasos.map((p, i) => (
        <div key={p.num} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-body text-sm transition-colors ${
              paso >= p.num
                ? "bg-primary border-primary text-white"
                : "bg-transparent border-text-light/40 text-text-light"
            }`}>
              {p.icon}
            </div>
            <span className={`font-body text-xs ${paso >= p.num ? "text-text-dark" : "text-text-light"}`}>
              {p.label}
            </span>
          </div>
          {i < pasos.length - 1 && (
            <div className="w-24 border-t-2 border-dashed border-text-light/40 mb-4 mx-2" />
          )}
        </div>
      ))}
    </div>
  )
}