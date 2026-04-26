import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"

export function Pagination({ paginaActual, totalPaginas, onChange }) {

  const getPaginas = () => {
  if (totalPaginas <= 5) {
    return Array.from({ length: totalPaginas }, (_, i) => i + 1)
  }

  const paginas = []
  let inicio, fin

  if (paginaActual <= 3) {
    // al inicio
    inicio = 1
    fin    = 3
    for (let i = inicio; i <= fin; i++) paginas.push(i)
    paginas.push("...")
    paginas.push(totalPaginas)

  } else if (paginaActual >= totalPaginas - 2) {
    // al final
    paginas.push(1)
    paginas.push("...")
    inicio = totalPaginas - 2
    fin    = totalPaginas
    for (let i = inicio; i <= fin; i++) paginas.push(i)

  } else {
    // si esta en medio
    paginas.push(1)
    paginas.push("...")
    paginas.push(paginaActual)
    paginas.push("...")
    paginas.push(totalPaginas)
  }

  return paginas
}

  return (
    <div className="flex items-center gap-1">

      {/* Anterior */}
      <button
        onClick={() => onChange(paginaActual - 1)}
        disabled={paginaActual === 1}
        className="p-1 text-text-light hover:text-text-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <IconChevronLeft size={16} stroke={1.5} />
      </button>

      {/* Paginas */}
      {getPaginas().map((pagina, i) =>
        pagina === "..." ? (
          <span key={`ellipsis-${i}`} className="font-body text-sm text-text-light px-1">
            ...
          </span>
        ) : (
          <button
            key={pagina}
            onClick={() => onChange(pagina)}
            className={`
              w-7 h-7 rounded-md font-body text-sm transition-colors
              ${paginaActual === pagina
                ? "bg-primary text-white"
                : "text-text-regular hover:text-text-dark hover:bg-bg-dark"
              }
            `}
          >
            {pagina}
          </button>
        )
      )}

      {/* Siguiente */}
      <button
        onClick={() => onChange(paginaActual + 1)}
        disabled={paginaActual === totalPaginas}
        className="p-1 text-text-light hover:text-text-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <IconChevronRight size={16} stroke={1.5} />
      </button>

    </div>
  )
}