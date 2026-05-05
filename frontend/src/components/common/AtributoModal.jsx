import { useState } from "react"
import { IconCirclePlus, IconTrash } from "@tabler/icons-react"
import { Modal } from "./Modal"

export function AtributoModal({ onClose, onGuardar, atributo = null }) {
  const [tipo, setTipo] = useState(atributo?.tipo || "")
  const valoresIniciales = atributo?.valor
    ? atributo.valor.split(",").map(v => v.trim())
    : [""]
  const [valores, setValores] = useState(valoresIniciales)

  const agregarValor = () => setValores((prev) => [...prev, ""])

  const eliminarValor = (i) =>
    setValores((prev) => prev.filter((_, idx) => idx !== i))

  const editarValor = (i, val) =>
    setValores((prev) => prev.map((v, idx) => idx === i ? val : v))

  const handleGuardar = () => {
    if (!tipo.trim()) return
    onGuardar({ 
      id_atributo: atributo?.id_atributo,
      tipo: tipo, 
      valor: valores.filter((v) => v.trim()).join(", ") 
    })
    onClose()
  }
  const todosLlenos = tipo.trim() && valores.every((v) => v.trim())
  
  return (
    <Modal titulo={atributo ? "Editar atributo" : "Agrega un atributo"} onClose={onClose} size="sm">
      <div className="flex flex-col gap-5">

        {/* Tipo (antes Nombre) */}
        <div className="flex flex-col gap-1">
          <label className="font-body text-sm text-text-regular">
            Nombre del atributo
          </label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full px-4 py-3 font-body text-sm text-text-regular bg-transparent border border-text-light rounded-md focus:outline-none focus:border-text-regular"
          >
            {/* Opción por defecto o "placeholder" */}
            <option value="" disabled>
              Selecciona un atributo...
            </option>
            <option value="talla">Talla</option>
            <option value="color">Color</option>
            <option value="tamanio">Tamaño</option>
            <option value="material">Material</option>
          </select>
        </div>

        {/* Valores */}
        <div className="flex flex-col gap-2">
          <label className="font-body text-sm text-text-regular">Valores</label>
          <div className="flex flex-col gap-2">
            {valores.map((val, i) => (
              <div key={i} className="relative">
                <input
                  type="text"
                  value={val}
                  onChange={(e) => editarValor(i, e.target.value)}
                  placeholder="Ej. XL, Rojo, Algodón..."
                  className="w-full px-4 py-3 pr-10 font-body text-sm text-text-regular bg-transparent border border-text-light rounded-md placeholder:text-text-light focus:outline-none focus:border-text-regular"
                />
                {valores.length > 1 && (
                  <button
                    onClick={() => eliminarValor(i)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light hover:text-error transition-colors"
                  >
                    <IconTrash size={16} stroke={1.5} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Agregar valor */}
          <button
            onClick={agregarValor}
            className="flex items-center justify-center gap-2 w-full py-2 font-body text-sm text-text-light hover:text-text-regular border border-dashed border-text-light hover:border-text-regular rounded-md transition-colors mt-1"
          >
            <IconCirclePlus size={16} stroke={1.5} />
            Agregar
          </button>
        </div>

        {/* Boton guardar */}
        <button
          onClick={handleGuardar}
          disabled={!todosLlenos}
          className="w-full py-3 bg-primary text-white font-body text-base rounded-full hover:bg-aux transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {atributo ? "Guardar cambios" : "Agregar atributo"}
        </button>

      </div>
    </Modal>
  )
}