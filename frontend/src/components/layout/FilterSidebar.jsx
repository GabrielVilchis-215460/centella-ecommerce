import { useState } from "react"
import { Switch } from "../common/Switch"
import { Button } from "../common/Button"
import { NumberInput } from "../common/NumberInput"

// bloque
function SeccionFiltro({ titulo, children }) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="font-heading text-lg text-text-dark">{titulo}</h2>
        <div className="border-t border-text-light opacity-40 mt-1" />
      </div>
      {children}
    </div>
  )
}

// switches
function FilaSwitch({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="font-body text-sm text-text-regular leading-snug">{label}</span>
      <Switch checked={checked} onChange={onChange} />
    </div>
  )
}

// barra lateral
export function FilterSidebar({
  // Categorías
  categorias,
  categoriaActiva,
  onCategoriaChange,

  // Precio
  mostrarPrecio,

  // Origen
  mostrarOrigen,

  // Tipo de entrega
  mostrarTipoEntrega,

  // Verificación
  mostrarVerificacion,

  // Particularidad (productos/servicios)
  mostrarParticularidad,
}) {
  const [precioMin,   setPrecioMin]   = useState("")
  const [precioMax,   setPrecioMax]   = useState("")
  const [hechosJuarez, setHechosJuarez] = useState(false)
  const [paquete,     setPaquete]     = useState(false)
  const [puntoMedio,  setPuntoMedio]  = useState(false)
  const [verificadas, setVerificadas] = useState(false)
  const [productos,   setProductos]   = useState(false)
  const [servicios,   setServicios]   = useState(false)

  return (
    <aside className="flex flex-col gap-6 w-70 border-r border-text-light/40 pr-8">

      {/* Categorías */}
      {categorias?.length > 0 && (
        <SeccionFiltro titulo="Categorías">
          <ul className="flex flex-col gap-2">
            {categorias.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => onCategoriaChange?.(cat.id)}
                  className={`
                    font-body text-sm text-left w-full
                    transition-colors
                    ${categoriaActiva === cat.id
                      ? "text-primary font-medium"
                      : "text-text-regular hover:text-text-dark"
                    }
                  `}
                >
                  {cat.nombre}
                </button>
              </li>
            ))}
          </ul>
        </SeccionFiltro>
      )}

      {/* Filtros */}
      <SeccionFiltro titulo="Filtros">
        <div className="flex flex-col gap-5">

          {/* Precio */}
          {mostrarPrecio && (
            <div className="flex flex-col gap-2">
              <span className="font-body text-base text-text-dark font-medium">Precio</span>
              <div className="flex gap-3">
                <NumberInput label="Mínimo" value={precioMin} onChange={setPrecioMin} prefix="$" min={0} className="w-30" />
                <NumberInput label="Máximo" value={precioMax} onChange={setPrecioMax} prefix="$" min={0} className="w-30"/>
              </div>
              <div className="flex justify-end">
                <Button size="sm" className="w-auto! px-6">Buscar</Button>
              </div>
            </div>
          )}

          {/* Verificación */}
          {mostrarVerificacion && (
            <div className="flex flex-col gap-2">
              <span className="font-body text-md text-text-dark font-regular">Verificación</span>
              <FilaSwitch
                label='Sólo emprendedoras verificadas'
                checked={verificadas}
                onChange={setVerificadas}
              />
            </div>
          )}

          {/* Origen */}
          {mostrarOrigen && (
            <div className="flex flex-col gap-2">
              <span className="font-body text-md text-text-dark font-regular">Origen</span>
              <FilaSwitch
                label='Productos "Hechos en Juárez"'
                checked={hechosJuarez}
                onChange={setHechosJuarez}
              />
            </div>
          )}

          {/* Tipo de entrega */}
          {mostrarTipoEntrega && (
            <div className="flex flex-col gap-2">
              <span className="font-body text-md text-text-dark font-regular">Tipo de entrega</span>
              <FilaSwitch label="Paquete"     checked={paquete}    onChange={setPaquete}    />
              <FilaSwitch label="Punto medio" checked={puntoMedio} onChange={setPuntoMedio} />
            </div>
          )}

          {/* Particularidad */}
          {mostrarParticularidad && (
            <div className="flex flex-col gap-2">
              <span className="font-body text-md text-text-dark font-regular">Particularidad</span>
              <FilaSwitch label="Productos" checked={productos} onChange={setProductos} />
              <FilaSwitch label="Servicios" checked={servicios} onChange={setServicios} />
            </div>
          )}

        </div>
      </SeccionFiltro>

    </aside>
  )
}