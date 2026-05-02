export function CatalogTabs({ activo, onChange }) {
  const tabs = [
    { id: "productos",     label: "Productos"     },
    { id: "servicios",     label: "Servicios"     },
    { id: "emprendedoras", label: "Emprendedoras" },
  ]

  return (
    <div className="flex items-center gap-4">
      {tabs.map((tab, i) => (
        <div key={tab.id} className="flex items-center gap-4">

          <button
            onClick={() => onChange(tab.id)}
            className={`
              relative pb-1 font-body text-base transition-colors
              ${activo === tab.id
                ? "text-primary font-medium"
                : "text-text-light hover:text-text-regular"
              }
            `}
          >
            {tab.label}
            {activo === tab.id && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />
            )}
          </button>

          {i < tabs.length - 1 && (
            <span className="w-1 h-1 rounded-full bg-text-light/60 shrink-0" />
          )}

        </div>
      ))}
    </div>
  )
}