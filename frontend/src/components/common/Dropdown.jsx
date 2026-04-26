import { useState, useRef, useEffect } from "react"
import { IconChevronDown } from "@tabler/icons-react"
import { Checkbox } from "./Checkbox"

function DropdownMenu({ children }) {
  return (
    <div className="absolute top-[calc(100%+8px)] left-0 w-72 bg-bg-light rounded-md shadow-lg z-50 p-4 flex flex-col gap-4">
      {children}
    </div>
  )
}

// ordenar
export function OrderByDropdown({ opciones = [], valorActivo, onChange }) {
  const [abierto, setAbierto] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const labelActivo = opciones.find((o) => o.value === valorActivo)?.label || "Ordenar por"

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setAbierto(!abierto)}
        className="flex items-center gap-2 font-body text-base text-text-regular hover:text-text-dark transition-colors pb-1 border-b-2 border-primary"
      >
        Ordenar por
        <IconChevronDown size={16} stroke={1.5} color="var(--color-text-light)" />
      </button>

      {abierto && (
        <DropdownMenu>
          {opciones.map((opcion) => (
            <button
              key={opcion.value}
              onClick={() => { onChange(opcion.value); setAbierto(false) }}
              className={`
                font-body text-sm text-left transition-colors
                ${valorActivo === opcion.value
                  ? "text-text-regular font-medium underline"
                  : "text-text-light hover:text-text-dark"
                }
              `}
            >
              {opcion.label}
            </button>
          ))}
        </DropdownMenu>
      )}
    </div>
  )
}

// filtrar
export function FilterDropdown({ label = "Filtrar", grupos = [], valores = {}, onChange }) {
  const [abierto, setAbierto] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleCheck = (key, checked) => {
    onChange({ ...valores, [key]: checked })
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setAbierto(!abierto)}
        className="flex items-center gap-2 font-body text-base text-text-regular hover:text-text-dark transition-colors pb-1 border-b-2 border-primary"
      >
        {label}
        <IconChevronDown size={16} stroke={1.5} color="var(--color-text-light)" />
      </button>

      {abierto && (
        <DropdownMenu>
          {grupos.map((grupo) => (
            <div key={grupo.label} className="flex flex-col gap-2">
              <span className="font-body text-sm text-text-dark font-regular">
                {grupo.label}
              </span>
              {grupo.opciones.map((opcion) => (
                <Checkbox
                  key={opcion.key}
                  label={opcion.label}
                  checked={valores[opcion.key] ?? true}
                  onChange={(val) => handleCheck(opcion.key, val)}
                  className="text-sm"
                />
              ))}
            </div>
          ))}
        </DropdownMenu>
      )}
    </div>
  )
}