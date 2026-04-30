import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Header } from "../../components/layout/Header"
import { Footer } from "../../components/layout/Footer"
import { useCart } from "../../context/CartContext"
import { carritoService } from "../../services/carritoService"
import { pagosService } from "../../services/pagosService"
import { useAuth } from "../../context/AuthContext"
import { Stepper } from "./Checkout"
import {
  IconCreditCard,
  IconCash,
} from "@tabler/icons-react"

const METODOS = [
  { id: "stripe",   label: "Tarjeta de crédito o débito", icon: <IconCreditCard size={22} stroke={1.5} /> },
  { id: "paypal",   label: "PayPal",                       icon: <PayPalIcon /> },
  { id: "efectivo", label: "Pago con efectivo",            icon: <IconCash size={22} stroke={1.5} /> },
]

function PayPalIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#003087">
      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z"/>
    </svg>
  )
}

export function CheckoutPago() {
  const navigate                      = useNavigate()
  const { items, totalPagar }         = useCart()
  const { usuario }                   = useAuth()
  const [metodo, setMetodo]           = useState("stripe")
  const [procesando, setProcesando]   = useState(false)
  const [error, setError]             = useState(null)

  const costoEnvio = parseFloat(sessionStorage.getItem("checkout_costo_envio") ?? 0)
  const idDireccion = parseInt(sessionStorage.getItem("checkout_id_direccion") ?? 0) || null
  const total = totalPagar + costoEnvio

  const tieneEnvio = items.some((i) => i.tipo_entrega_seleccionado === "envio")

  const handleComprar = async () => {
    setError(null)
    setProcesando(true)
    try {
      // 1. Crear pedidos via checkout
      const itemsCheckout = items.map((item) => ({
        id_item: item.id,
        tipo_entrega_seleccionado: item.tipo_entrega_seleccionado,
      }))

      const checkoutRes = await carritoService.checkout(usuario.id, {
        metodo_pago: metodo,
        id_direccion_envio: tieneEnvio ? idDireccion : null,
        items: itemsCheckout,
      })

      const pedidos = checkoutRes.data.pedidos
      const ids_pedido = pedidos.map((p) => p.id_pedido)

      // Guardar pedidos en sessionStorage para la confirmación
      sessionStorage.setItem("checkout_pedidos", JSON.stringify(pedidos))

      // 2. Procesar pago
      const pagoRes = await pagosService.pagar(ids_pedido)
      const pagos = pagoRes.data.pagos

      if (metodo === "efectivo") {
        // Efectivo → directo a confirmación
        navigate("/checkout/confirmacion")
        return
      }

      // Stripe/PayPal → redirigir a pasarela
      // Como puede haber múltiples pedidos (uno por emprendedora), tomamos el primero
      const primerPago = pagos[0]
      if (primerPago?.redirect_url) {
        window.location.href = primerPago.redirect_url
      }

    } catch (err) {
      console.error("Error al procesar pago:", err)
      setError(
        err?.response?.data?.detail ?? "Ocurrió un error al procesar tu pago. Intenta de nuevo."
      )
    } finally {
      setProcesando(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-dark">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10 flex flex-col gap-8">

        <Stepper paso={2} />

        <div className="flex gap-8 items-start">

          {/* Métodos de pago */}
          <div className="flex-1 flex flex-col gap-3">

            {METODOS.map((m) => (
              <div
                key={m.id}
                onClick={() => setMetodo(m.id)}
                className={`flex flex-col rounded-xl border-2 cursor-pointer transition-colors overflow-hidden ${
                  metodo === m.id
                    ? "border-primary"
                    : "border-text-light/20 hover:border-primary/40"
                }`}
              >
                {/* Header del método */}
                <div className="flex items-center justify-between px-5 py-4 bg-bg-light">
                  <div className="flex items-center gap-3">
                    <span className="text-text-regular">{m.icon}</span>
                    <span className="font-body text-sm font-medium text-text-dark">
                      {m.label}
                    </span>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                    metodo === m.id ? "border-primary" : "border-text-light/40"
                  }`}>
                    {metodo === m.id && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                </div>

                {/* Contenido expandido */}
                {metodo === m.id && (
                  <div className="px-5 py-4 bg-bg-light/60 border-t border-text-light/10">
                    {m.id === "stripe" && (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-text-light">
                          <span className="font-body text-xs">🔒 Tu pago es 100% seguro</span>
                          <span className="font-body text-xs">·</span>
                          <span className="font-body text-xs">⚡ Paga fácil y rápido</span>
                        </div>
                        <p className="font-body text-sm text-text-regular">
                          Serás redirigido a Stripe para completar tu pago de forma segura.
                        </p>
                      </div>
                    )}
                    {m.id === "paypal" && (
                      <p className="font-body text-sm text-text-regular">
                        Serás redirigido a PayPal para autorizar el pago con tu cuenta o tarjeta.
                      </p>
                    )}
                    {m.id === "efectivo" && (
                      <p className="font-body text-sm text-text-regular">
                        Paga en efectivo al momento de recoger tu pedido. Solo disponible para productos con entrega física.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}

            {error && (
              <p className="font-body text-sm text-error mt-1">{error}</p>
            )}

          </div>

          {/* Resumen */}
          <div className="w-64 shrink-0 bg-bg-light rounded-xl p-5 flex flex-col gap-3 shadow-sm">

            {/* Items */}
            <div className="flex flex-col gap-3 pb-3 border-b border-text-light/20">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <img
                    src={item.imagen}
                    alt={item.nombre}
                    className="w-10 h-10 object-cover rounded-md shrink-0"
                  />
                  <div className="flex-1 flex justify-between items-center gap-2">
                    <span className="font-body text-xs text-text-regular leading-snug line-clamp-2">
                      {item.nombre}
                    </span>
                    <span className="font-body text-xs text-text-dark shrink-0">
                      ${(item.precio * item.cantidad).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>

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
                  ${costoEnvio.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
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
              onClick={handleComprar}
              disabled={procesando}
              className="w-full bg-primary text-white font-body text-sm py-2.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            >
              {procesando ? "Procesando..." : "Comprar ahora"}
            </button>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}