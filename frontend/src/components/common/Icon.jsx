export function Icon({ icon: IconComponent, size = 20, stroke = 1.5, color, className = "" }) {
  return (
    <IconComponent
      size={size}
      stroke={stroke}
      color={color || "var(--color-text-regular)"}
      className={className}
    />
  )
}