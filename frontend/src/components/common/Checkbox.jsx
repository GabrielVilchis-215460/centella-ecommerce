import { IconSquare, IconSquareCheckFilled } from "@tabler/icons-react"

export function Checkbox({ label, checked = false, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2 cursor-pointer"
    >
      {checked
        ? <IconSquareCheckFilled size={20} className="text-primary shrink-0" />
        : <IconSquare           size={20} className="text-text-light shrink-0" stroke={1.5} />
      }
      {label && (
        <span className="font-body text-base text-text-regular">{label}</span>
      )}
    </button>
  )
}