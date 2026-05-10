import { useEffect, useState, useRef } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import api from "../../services/axios"

export function ConfirmacionPago() {
  const { id_pedido }         = useParams()
  const [searchParams]        = useSearchParams()
  const navigate              = useNavigate()
  const [error, setError]     = useState(null)
  const confirmado            = useRef(false)

  useEffect(() => {
    if (confirmado.current) return
    confirmado.current = true

    const confirmar = async () => {
      try {
        const raw = sessionStorage.getItem("checkout_pedidos")
        if (!raw) throw new Error("No se encontraron pedidos en la sesion")
        const pedidos = JSON.parse(raw) 
        const esPaypal = window.location.pathname.includes("paypal")

        for (const p of pedidos) {
          if (esPaypal) {
            const token = searchParams.get("token")
            await api.get(`/api/v1/pagos/confirm/paypal/${p.id_pedido}?token=${token}`)
          } else {
            await api.get(`/api/v1/pagos/confirm/stripe/${p.id_pedido}`)
          }
        }

        navigate("/checkout/confirmacion", { replace: true })
      } catch (err) {
        console.error("Error al confirmar pago:", err)
        setError("Hubo un problema al confirmar tu pago.")
      }
    }
    confirmar()
  }, [])

  if (error) return (
    <div className="min-h-screen flex items-center justify-center font-body text-error">
      {error}
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="font-body text-text-regular">Confirmando tu pago...</span>
    </div>
  )
}
