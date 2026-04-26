import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { IconTrash, IconChevronUp, IconChevronDown } from "@tabler/icons-react"
import { Button } from "./Button"
import { NumberInput } from "./NumberInput"

function CartItem({ imagen, nombre, precio, cantidad, onEliminar, onCantidadChange, className = "" }) {
  return (
    <div className="flex gap-3 pb-4 items-start ${className}">

      {/* Imagen */}
      <img
        src={imagen}
        alt={nombre}
        className="w-20 h-20 object-cover rounded-md shrink-0"
      />

      {/* Info */}
      <div className="flex-1 flex flex-col gap-1">
        <span className="font-body text-sm text-text-regular leading-snug">{nombre}</span>
        <span className="font-body text-base font-medium text-text-dark">
          ${precio.toLocaleString()}
        </span>
      </div>

      {/* Acciones */}
      <div className="flex flex-col justify-between items-end self-stretch shrink-0">
        {/* Borrar */}
        <button
          onClick={onEliminar}
          className="text-text-light hover:text-error transition-colors"
        >
          <IconTrash size={18} stroke={1.5} />
        </button>

        {/* Selector de cantidad */}
        <NumberInput
        value={cantidad}
        onChange={onCantidadChange}
        min={1}
        className="w-20"
        />
      </div>

    </div>
  )
}

export function CartDropdown({ items = [], onEliminar, onCantidadChange, onClose }) {
  const navigate  = useNavigate()

  const subtotal = items.reduce((acc, item) => acc + item.precio * item.cantidad, 0)

  return (
    <div
      className="absolute right-0 top-[calc(100%+12px)] w-80 bg-bg-light rounded-lg shadow-lg z-50 flex flex-col overflow-hidden"
    >

      {/* Titulo */}
      <div className="px-5 pt-5 pb-3">
        <h3 className="font-heading text-lg text-text-dark">Tu carrito</h3>
        <div className="border-t border-text-light/40 mt-2" />
      </div>

      {/* Lista */}
      <div className="flex flex-col gap-4 px-5 overflow-y-auto max-h-64 divide-y divide-text-light/30">
        {items.length === 0
          ? <p className="font-body text-sm text-text-light text-center py-4">Tu carrito está vacío</p>
          : items.map((item) => (
              <CartItem
                key={item.id}
                {...item}
                className="pt-4 pb-4 "
                onEliminar={() => onEliminar(item.id)}
                onCantidadChange={(val) => onCantidadChange(item.id, val)}
              />
            ))
        }
      </div>

      {/* subtotal y botón */}
      <div className="mt-4 px-5 py-4 bg-bg-dark flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-body text-sm text-text-regular">Subtotal</span>
          <span className="font-body text-base font-medium text-text-dark">
            ${subtotal.toLocaleString()} MXN
          </span>
        </div>
        <Button
          size="sm"
          onClick={() => { navigate("/carrito"); onClose() }}
        >
          Realizar pago
        </Button>
      </div>

    </div>
  )
}