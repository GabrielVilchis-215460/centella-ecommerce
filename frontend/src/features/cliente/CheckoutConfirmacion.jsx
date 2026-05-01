import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { Header } from "../../components/layout/Header"
import { Footer } from "../../components/layout/Footer"
import { Button } from "../../components/common/Button"

import { pedidosService } from "../../services/pedidosService"
import { Stepper } from "./Checkout"
import { IconCircleCheck, IconTruck, IconQrcode } from "@tabler/icons-react"

export function CheckoutConfirmacion() {
  const navigate = useNavigate()
  const [pedidos, setPedidos]     = useState([])
  const [cargando, setCargando]   = useState(true)
  const [error, setError]         = useState(null)

  useEffect(() => {
    const cargar = async () => {
      try {
        const raw = sessionStorage.getItem("checkout_pedidos")
        if (!raw) { navigate("/catalogo", { replace: true }); return }

        const resumen = JSON.parse(raw)
        const detalles = await Promise.all(
          resumen.map((p) => pedidosService.obtenerConfirmacion(p.id_pedido))
        )
        setPedidos(detalles.map((r) => r.data))
      } catch (err) {
        console.error("Error al cargar confirmación:", err)
        setError("No pudimos cargar el detalle de tu pedido.")
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  const handleSeguir = () => {
    sessionStorage.removeItem("checkout_pedidos")
    sessionStorage.removeItem("checkout_id_direccion")
    sessionStorage.removeItem("checkout_costo_envio")
    sessionStorage.removeItem("checkout_total")
    navigate("/catalogo")
  }

  const metodoLabel = (metodo) => ({
    stripe:   "Tarjeta de crédito · Procesado por Stripe",
    paypal:   "PayPal",
    efectivo: "Pago con efectivo",
  }[metodo] ?? metodo)

  if (cargando) return (
    <div className="min-h-screen flex flex-col bg-bg-dark">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <span className="font-body text-text-regular">Cargando confirmación...</span>
      </main>
      <Footer />
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex flex-col bg-bg-dark">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <span className="font-body text-error">{error}</span>
      </main>
      <Footer />
    </div>
  )

  const subtotalGlobal  = pedidos.reduce((acc, p) => acc + parseFloat(p.subtotal), 0)
  const envioGlobal     = pedidos.reduce((acc, p) => acc + parseFloat(p.costo_envio), 0)
  const totalGlobal     = pedidos.reduce((acc, p) => acc + parseFloat(p.total), 0)

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10 flex flex-col gap-8">

        <Stepper paso={3} />

        {/* Éxito */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-16 h-16 rounded-full border-2 border-green-500 flex items-center justify-center">
            <IconCircleCheck size={36} stroke={1.5} color="#22c55e" />
          </div>
          <h1 className="font-heading text-2xl text-text-dark">¡Pedido Confirmado!</h1>
          <p className="font-body text-sm text-text-regular max-w-sm">
            Gracias por tu compra. Los vendedores han recibido tu pedido y lo procesarán pronto.
          </p>
        </div>

        {pedidos.map((pedido) => (
          <div key={pedido.id_pedido} className="flex flex-col gap-4">

            {/* Número de pedido */}
            <div className="bg-bg-dark rounded-xl p-5 flex flex-col items-center gap-1 text-center">
              <span className="font-body text-xs text-text-light uppercase tracking-wider">
                Número de pedido
              </span>
              <span className="font-body text-lg text-text-dark">
                ORD-{new Date().getFullYear()}-{String(pedido.id_pedido).padStart(4, "0")}
              </span>
              <span className="font-body text-xs text-text-regular">
                {new Date().toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>

            {/* Método de pago */}
            <div className="bg-bg-dark rounded-xl p-5 flex flex-col items-center gap-1 text-center">
              <span className="font-body text-xs text-text-light uppercase tracking-wider">
                Método de pago
              </span>
              <span className="font-body text-sm text-text-dark">
                {metodoLabel(pedido.metodo_pago)}
              </span>
              <span className="font-body text-xs text-green-500">✓ Pago procesado</span>
            </div>

            {/* Envío */}
            {pedido.tiene_envio && pedido.numero_rastreo && (
              <div className="bg-bg-dark rounded-xl p-5 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <IconTruck size={18} stroke={1.5} className="text-text-regular" />
                  <span className="font-body text-sm font-medium text-text-dark">
                    Información de envío
                  </span>
                </div>
                <span className="font-body text-xs text-text-regular">
                  Número de rastreo: <span className="text-text-dark">{pedido.numero_rastreo}</span>
                </span>
                <a
                  href={pedido.track_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-xs text-primary underline"
                >
                  Rastrear envío →
                </a>
              </div>
            )}

            {/* QR entrega física */}
            {pedido.tiene_fisica && pedido.codigo_qr_url && (
              <div className="bg-bg-dark rounded-xl p-5 flex flex-col items-center gap-3">
                <div className="flex items-center gap-2">
                  <IconQrcode size={18} stroke={1.5} className="text-text-regular" />
                  <span className="font-body text-sm font-medium text-text-dark">
                    Código QR para recoger tu pedido
                  </span>
                </div>
                <img
                  src={pedido.codigo_qr_url}
                  alt="QR pedido"
                  className="w-40 h-40 object-contain"
                />
                <p className="font-body text-xs text-text-regular text-center">
                  Presenta este código al recoger tu pedido
                </p>
              </div>
            )}

            {/* Resumen de compra */}
            <div className="bg-bg-dark rounded-xl p-5 flex flex-col gap-4">
              <h3 className="font-heading text-base text-text-dark border-b border-text-light/20 pb-2">
                Resumen de compra
              </h3>
              <div className="flex flex-col divide-y divide-text-light/10">
                {pedido.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-3">
                    <div className="flex-1 flex flex-col">
                      <span className="font-body text-sm text-text-dark">{item.nombre_producto}</span>
                      <span className="font-body text-xs text-text-regular">
                        Cantidad: {item.cantidad}
                      </span>
                    </div>
                    <span className="font-body text-sm text-text-dark">
                      ${(parseFloat(item.precio_unitario) * item.cantidad)
                        .toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ))}

        {/* Resumen del pedido global */}
        <div className="bg-bg-dark rounded-xl p-5 flex flex-col gap-3">
          <h3 className="font-heading text-base text-text-dark border-b border-text-light/20 pb-2">
            Resumen del pedido
          </h3>
          <div className="flex justify-between items-center">
            <span className="font-body text-sm text-text-dark">Subtotal productos</span>
            <span className="font-body text-sm text-text-dark">
              ${subtotalGlobal.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-body text-sm text-text-dark">Envío</span>
            <span className="font-body text-sm text-text-dark">
              ${envioGlobal.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN
            </span>
          </div>
          <div className="border-t border-text-light/30 pt-3 flex justify-between items-center">
            <span className="font-body text-base font-medium text-text-dark">Total</span>
            <span className="font-body text-base font-medium text-text-dark">
              ${totalGlobal.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN
            </span>
          </div>
        </div>

        <Button
          size="sm"
          onClick={handleSeguir}
        >
          Seguir comprando &gt;
        </Button>

      </main>

      <Footer />
    </div>
  )
}
