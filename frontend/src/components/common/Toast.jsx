import { useState, useEffect } from "react"
import {
  IconCircleCheck, IconCircleX,
  IconAlertTriangle, IconInfoCircle, IconX,
} from "@tabler/icons-react"

const CONFIG = {
  success: { icon: IconCircleCheck, className: "bg-[#e9f8ee] border-[#7dcf95] text-[#1a6635]" },
  error:   { icon: IconCircleX,     className: "bg-[#fceaea] border-[#f09595] text-[#7a1f1f]" },
  warning: { icon: IconAlertTriangle, className: "bg-[#fef3e0] border-[#fac775] text-[#633806]" },
  info:    { icon: IconInfoCircle,  className: "bg-[#e6f1fb] border-[#85b7eb] text-[#0c447c]" },
}

export function Toast({ id, message, type = "success", onRemove, removing }) {
  const { icon: Icon, className } = CONFIG[type] ?? CONFIG.success

  return (
    <div className={`
        toast-enter
        ${removing ? "toast-exit" : ""}
        flex items-center gap-3 px-4 py-3 rounded-lg border text-sm min-w-72 max-w-sm shadow-sm
        ${className}
    `}>
      <Icon size={18} stroke={1.5} className="shrink-0" />
      <p className="font-body flex-1 leading-snug">{message}</p>
      <button
        onClick={() => onRemove(id)}
        className="shrink-0 opacity-50 hover:opacity-100 transition-opacity"
      >
        <IconX size={15} stroke={1.5} />
      </button>
    </div>
  )
}