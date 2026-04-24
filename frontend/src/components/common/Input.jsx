export function Input({
  label,
  placeholder = "",
  value,
  onChange,
  type = "text",
  disabled = false,
  error,
  className = "",
}) {
  return (
    <div className="flex flex-col gap-1 w-full">

      {label && (
        <label className="font-body text-base text-text-regular">
          {label}
        </label>
      )}

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full
          px-4 py-3
          font-body text-base text-text-light
          bg-transparent
          border border-text-light
          rounded-md
          placeholder:text-text-light
          focus:outline-none focus:border-text-regular
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-(--transition-fast)
          ${error ? "border-error" : ""}
          ${className}
        `}
      />

      {error && (
        <span className="font-body text-sm text-error">
          {error}
        </span>
      )}

    </div>
  )
}