export function Switch({ checked = false, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`
        relative shrink-0 w-11 h-6 rounded-full
        transition-colors duration-(--transition-fast)
        ${checked ? "bg-aux" : "bg-gray-200"}
      `}
    >
      <span className={`
        absolute top-1 w-4 h-4 rounded-full
        transition-all duration-(--transition-fast)
        ${checked ? "left-6 bg-bg-light" : "left-1 bg-gray-400"}
      `} />
    </button>
  )
}