import { IconChevronDown } from "@tabler/icons-react"

export function Select({
  label,
  placeholder = "Seleccionar",
  value,
  onChange,
  options = [],
  disabled = false,
  error,
  className = "",
  labelClassName = "",
  variant = "default",
}) {
  const isLight = variant === "light"
  return (
    <div className="flex flex-col gap-1 w-full">

      {label && (
        <label className={`font-body text-base ${isLight ? "text-white" : "text-text-regular"} ${labelClassName}`}>
          {label}
        </label>
      )}

      <div className="relative w-full">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`
            w-full
            px-4 py-3
            font-body text-base
            ${isLight ? "text-white border-white/50 focus:border-white" : "text-text-light border-text-light focus:border-text-regular"}
            bg-transparent
            border border-text-light
            rounded-md
            appearance-none
            focus:outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-(--transition-fast)
            ${error ? "border-error" : ""}
            ${className}
          `}
        >
          <option value="" disabled hidden>{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="text-text-regular">
              {opt.label}
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
            <IconChevronDown size={16} stroke={1.5} color={isLight ? "white" : "var(--color-text-light)"} />
        </div>
      </div>

      {error && (
        <span className="font-body text-sm text-error">
          {error}
        </span>
      )}

    </div>
  )
}