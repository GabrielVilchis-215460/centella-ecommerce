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
  precioMinValue,
  precioMaxValue,
  onPrecioMinChange,
  onPrecioMaxChange,
  onBuscarPrecio,

  // Origen
  mostrarOrigen,
  hechosJuarezValue,
  onHechosJuarezChange,

  // Tipo de entrega
  mostrarTipoEntrega,
  paqueteValue,
  onPaqueteChange,
  puntoMedioValue,
  onPuntoMedioChange,

  // Verificación
  mostrarVerificacion,
  verificadasValue,
  onVerificadasChange,

  // Particularidad (productos/servicios)
  mostrarParticularidad,
  soloProductosValue,
  onSoloProductosChange,
  soloServiciosValue,
  onSoloServiciosChange,
}) {
  // Estado interno solo si no se pasa externamente
  const [precioMinInterno, setPrecioMinInterno] = useState(0)
  const [precioMaxInterno, setPrecioMaxInterno] = useState(0)
  const [hechosJuarezInterno, setHechosJuarezInterno] = useState(false)
  const [paqueteInterno,      setPaqueteInterno]      = useState(false)
  const [puntoMedioInterno,   setPuntoMedioInterno]   = useState(false)
  const [verificadasInterno,  setVerificadasInterno]  = useState(false)
  const [soloProductosInterno,setSoloProductosInterno]= useState(false)
  const [soloServiciosInterno,setSoloServiciosInterno]= useState(false)

  // Usa el valor externo si existe, si no el interno
  const precioMin     = precioMinValue     ?? precioMinInterno
  const precioMax     = precioMaxValue     ?? precioMaxInterno
  const hechosJuarez  = hechosJuarezValue  ?? hechosJuarezInterno
  const paquete       = paqueteValue       ?? paqueteInterno
  const puntoMedio    = puntoMedioValue    ?? puntoMedioInterno
  const verificadas   = verificadasValue   ?? verificadasInterno
  const soloProductos = soloProductosValue ?? soloProductosInterno
  const soloServicios = soloServiciosValue ?? soloServiciosInterno

  const setPrecioMin    = onPrecioMinChange    ?? setPrecioMinInterno
  const setPrecioMax    = onPrecioMaxChange    ?? setPrecioMaxInterno
  const setHechosJuarez = onHechosJuarezChange ?? setHechosJuarezInterno
  const setPaquete      = onPaqueteChange      ?? setPaqueteInterno
  const setPuntoMedio   = onPuntoMedioChange   ?? setPuntoMedioInterno
  const setVerificadas  = onVerificadasChange  ?? setVerificadasInterno
  const setSoloProductos= onSoloProductosChange?? setSoloProductosInterno
  const setSoloServicios= onSoloServiciosChange?? setSoloServiciosInterno

  return (
    <aside className="flex flex-col gap-6 w-70 pr-8">

      {/* Categorías */}
      {categorias?.length > 0 && (
        <SeccionFiltro titulo="Categorías">
          <ul className="flex flex-col gap-2">
            {categorias.map((cat) => (
              <li key={cat.id_categoria}>
                <button
                  onClick={() => onCategoriaChange?.(
                    categoriaActiva === cat.id_categoria ? null : cat.id_categoria
                  )}
                  className={`
                    font-body text-sm text-left w-full
                    transition-colors
                    ${categoriaActiva === cat.id_categoria
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
              <span className="font-body text-base text-text-dark font-regular">Precio</span>
              <div className="flex gap-3">
                <NumberInput label="Mínimo" value={precioMin} onChange={setPrecioMin} prefix="$" min={0} className="w-30" />
                <NumberInput label="Máximo" value={precioMax} onChange={setPrecioMax} prefix="$" min={0} className="w-30"/>
              </div>
              <div className="flex justify-end">
                <Button size="sm" className="w-auto! px-6" onClick={onBuscarPrecio}>Buscar</Button>
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
              <FilaSwitch label="Productos" checked={soloProductos} onChange={setSoloProductos} />
              <FilaSwitch label="Servicios" checked={soloServicios} onChange={setSoloServicios} />
            </div>
          )}

        </div>
      </SeccionFiltro>

    </aside>
  )
}