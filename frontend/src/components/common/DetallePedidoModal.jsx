import { useState } from "react"
import { IconChevronDown } from "@tabler/icons-react"
import { Modal } from "./Modal"
import { StatusBadge } from "./StatusBadge"
import { Button } from "./Button"

const ESTADOS_PEDIDO = [
  { value: "pendiente",   label: "Pendiente",   color: "gray" },
  { value: "en_proceso",  label: "En proceso",  color: "orange" },
  { value: "en_transito", label: "En tránsito", color: "blue"   },
  { value: "entregado",   label: "Entregado",   color: "green"  },
  { value: "cancelado",   label: "Cancelado",   color: "red"    },
]

function SeccionDetalle({ titulo, children }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-body text-sm text-text-regular font-medium">{titulo}</span>
      {children}
    </div>
  )
}

export function DetallePedidoModal({ onClose, pedido, onEstadoChange }) {
  const [estado,          setEstado]          = useState(pedido?.estado || "pendiente")
  const [dropdownAbierto, setDropdownAbierto] = useState(false)

  const estadoActual = ESTADOS_PEDIDO.find((e) => e.value === estado)

  const handleEstadoChange = (nuevoEstado) => {
    setEstado(nuevoEstado)
    onEstadoChange?.(nuevoEstado)
    setDropdownAbierto(false)
  }

  return (
    <Modal titulo="Detalles de pedido" onClose={onClose} size="md">
      <div className="grid grid-cols-2 gap-8">

        {/* col izquierda */}
        <div className="flex flex-col gap-5">

          <SeccionDetalle titulo="Número de orden">
            <span className="font-body text-sm text-text-light">
              {pedido?.numero_orden || "0000-AAAA-0000-AAAA"}
            </span>
          </SeccionDetalle>

          <SeccionDetalle titulo="Tipo de entrega">
            <span className="font-body text-sm text-text-light">
              {pedido?.tipo_entrega || "—"}
            </span>
          </SeccionDetalle>

          <SeccionDetalle titulo="Fecha del pedido">
            <span className="font-body text-sm text-text-light">
              {pedido?.fecha || "dd-mm-yyyy hh:mm"}
            </span>
          </SeccionDetalle>

          {/* Estado con dropdown */}
          <SeccionDetalle titulo="Estado del pedido">
            <div className="relative z-10 inline-block">
              <button
                onClick={() => setDropdownAbierto(!dropdownAbierto)}
                className="flex items-center gap-2"
              >
                <StatusBadge texto={estadoActual.label} color={estadoActual.color} />
                <IconChevronDown size={14} stroke={1.5} color="var(--color-text-light)" />
              </button>

              {dropdownAbierto && (
                <div className="fixed bg-bg-light rounded-md shadow-lg z-100 overflow-hidden min-w-36"
                    style={{
                    top: "auto",
                    left: "auto",
                    }}
                >
                  {ESTADOS_PEDIDO.map((e) => (
                    <button
                      key={e.value}
                      onClick={() => handleEstadoChange(e.value)}
                      className={`
                        w-full px-3 py-2 flex items-center gap-2
                        hover:bg-bg-dark transition-colors
                        ${estado === e.value ? "bg-bg-dark" : ""}
                      `}
                    >
                      <StatusBadge texto={e.label} color={e.color} className="text-xs px-2 py-0.5" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </SeccionDetalle>

        </div>

        {/* col derecha */}
        <div className="flex flex-col gap-2">
          <span className="font-body text-sm text-text-regular font-medium">
            Detalles del pedido
          </span>

          <div className="flex flex-col gap-1">
            <span className="font-body text-sm text-text-light">
              Nombre del cliente:
            </span>
            <span className="font-body text-sm text-text-regular">
              {pedido?.cliente || "—"}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="font-body text-sm text-text-light">Resumen de compra:</span>
            {pedido?.items?.map((item, i) => (
              <span key={i} className="font-body text-sm text-text-regular">
                {item.nombre} ({item.cantidad}) — ${item.precio.toLocaleString()}
              </span>
            ))}
          </div>

          <div className="flex flex-col gap-1 mt-1">
            <span className="font-body text-sm text-text-light">Total:</span>
            <span className="font-body text-sm text-text-regular font-medium">
              ${pedido?.total?.toLocaleString() || "0.00"}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="font-body text-sm text-text-light">Método de pago:</span>
            <span className="font-body text-sm text-text-regular">
              {pedido?.metodo_pago || "—"}
            </span>
          </div>
            {/* Footer */}
            <div className="flex justify-end mt-6 pt-4">
            <Button
                size="sm"
                className="w-auto! px-8"
                onClick={() => {
                onEstadoChange?.(estado)
                onClose()
                }}
            >
                Guardar cambios
            </Button>
            </div>
        </div>
      </div>
    </Modal>
  )
}