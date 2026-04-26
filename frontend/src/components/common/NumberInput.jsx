import { IconChevronUp, IconChevronDown } from "@tabler/icons-react"

export function NumberInput({ label, value = 0, onChange, min = 0, max, prefix = "", className = "" }) {

  const incrementar = () => {
    if (max === undefined || value < max) onChange(value + 1)
  }

  const decrementar = () => {
    if (value > min) onChange(value - 1)
  }

  const handleInput = (e) => {
    const val = parseInt(e.target.value)
    if (isNaN(val)) return onChange(min)
    if (val < min) return onChange(min)
    if (max !== undefined && val > max) return onChange(max)
    onChange(val)
  }

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <span className="font-body text-sm text-text-light">{label}</span>
      )}
      <div className="flex items-center border border-text-light rounded-md overflow-hidden">
        <span className="font-body text-sm text-text-light pl-3">{prefix}</span>
        <input
          type="number"
          value={value}
          onChange={handleInput}
          onKeyDown={(e) => {
                if (e.key === "e" || e.key === "E" || e.key === "-" || e.key === "+") {
                e.preventDefault()
                }
            }}
          className="flex-1 font-body text-sm text-text-regular bg-transparent py-2 px-1 outline-none min-w-0
            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <div className="flex flex-col border-l border-text-light shrink-0">
          <button
            onClick={incrementar}
            className="px-1 pt-0.75 pb-px hover:bg-bg-dark transition-colors"
          >
            <IconChevronUp size={12} stroke={1.5} color="var(--color-text-light)" />
          </button>
          <button
            onClick={decrementar}
            className="px-1 pt-px pb-0.75 hover:bg-bg-dark transition-colors"
          >
            <IconChevronDown size={12} stroke={1.5} color="var(--color-text-light)" />
          </button>
        </div>
      </div>
    </div>
  )
}