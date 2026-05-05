import { IconTrash } from "@tabler/icons-react"

export function DataTable({ columnas = [], datos = [], onEliminar, onRowClick }) {
  return (
    <div className="w-full flex flex-col gap-3">
      {/* Encabezados */}
      <div
        className="grid gap-4 px-4 py-2"
        style={{ gridTemplateColumns: columnas.map((c) => c.width || "1fr").join(" ") }}
      >
        {columnas.map((col) => (
          <span 
            key={col.key} 
            className={`font-body text-sm text-text-light ${
              col.key === "eliminar" ? "text-center" : ""
            }`}
          >
            {col.label}
          </span>
        ))}
      </div>

      {/* Filas */}
      <div className="flex flex-col gap-2">
        {datos.map((fila, i) => (
          <div
            key={fila.id ?? i}
            onClick={() => onRowClick?.(fila)}
            className={`
                grid gap-4 px-4 py-3 items-center
                bg-bg-light rounded-md shadow-sm
                border border-transparent
                transition-colors duration-(--transition-fast)
                ${onRowClick
                ? "cursor-pointer hover:bg-bg-dark hover:border-text-light/40"
                : "hover:bg-bg-dark hover:border-text-light/40"
                }
            `}
            style={{ gridTemplateColumns: columnas.map((c) => c.width || "1fr").join(" ") }}
          >
            {columnas.map((col) => (
              <div 
                key={col.key} 
                className={`flex items-center ${
                  col.key === "eliminar" ? "justify-center" : ""
                }`}
              >
                {col.key === "eliminar"
                  ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); onEliminar?.(fila) }}
                      className="text-text-light hover:text-error transition-colors"
                    >
                      <IconTrash size={18} stroke={1.5} />
                    </button>
                  )
                  : col.render
                    ? col.render(fila)
                    : (
                      <span className="font-body text-sm text-text-regular truncate">
                        {fila[col.key] ?? "—"}
                      </span>
                    )
                }
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}