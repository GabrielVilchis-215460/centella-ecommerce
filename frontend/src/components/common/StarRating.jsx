import { useState } from "react"
import { IconStarFilled, IconStar } from "@tabler/icons-react"

export function StarRating({ value = 0, onChange, size = 20, readonly = false }) {
  const [hover, setHover] = useState(0)

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const activa = (hover || value) >= star
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange?.(star)}
            onMouseEnter={() => !readonly && setHover(star)}
            onMouseLeave={() => !readonly && setHover(0)}
            className={readonly ? "cursor-default" : "cursor-pointer"}
          >
            {activa
              ? <IconStarFilled size={size} color="var(--color-primary)" />
              : <IconStar       size={size} color="var(--color-text-light)" stroke={1.5} />
            }
          </button>
        )
      })}
    </div>
  )
}