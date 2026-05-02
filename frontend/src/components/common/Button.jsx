const VARIANTS = {
  primary: [
    "bg-primary text-bg-light",
    "hover:bg-aux",
    "disabled:bg-text-light disabled:cursor-not-allowed",
  ].join(" "),

  secondary: [
    "bg-[#4a4a4a] text-bg-light",
    "hover:bg-[#5a5a5a]",
    "disabled:bg-text-light disabled:cursor-not-allowed",
  ].join(" "),
}

const SIZES = {
  md: "px-10 py-3 text-lg font-body font-medium w-full rounded-xxl",
  sm: "px-6  py-2 text-md  font-body font-regular w-full rounded-lg",
}

export function Button({
  children,
  variant  = "primary",
  size     = "md",
  disabled = false,
  type     = "button",
  onClick,
  className = "",
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        transition-colors duration-fast
        ${VARIANTS[variant]}
        ${SIZES[size]}
        ${className}
      `}
    >
      {children}
    </button>
  )
}