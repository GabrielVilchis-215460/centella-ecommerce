const COLORES = {
  green:  "bg-states-green",
  red:    "bg-states-red",
  blue:   "bg-states-blue",
  orange: "bg-states-orange",
  gray:   "bg-states-gray",
}

export function StatusBadge({ texto, color = "gray", className = "" }) {
  return (
    <span className={`
      inline-block font-body text-sm text-text-dark
      px-3 py-1 rounded-full
      ${COLORES[color]}
      ${className}
    `}>
      {texto}
    </span>
  )
}