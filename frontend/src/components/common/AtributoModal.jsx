import { useState } from "react"
import { IconCirclePlus, IconTrash } from "@tabler/icons-react"
import { Modal } from "./Modal"

export function AtributoModal({ onClose, onGuardar, atributo = null }) {
  const [nombre,  setNombre]  = useState(atributo?.nombre || "")
  const [valores, setValores] = useState(atributo?.valores || [""])

  const agregarValor = () => setValores((prev) => [...prev, ""])

  const eliminarValor = (i) =>
    setValores((prev) => prev.filter((_, idx) => idx !== i))

  const editarValor = (i, val) =>
    setValores((prev) => prev.map((v, idx) => idx === i ? val : v))

  const handleGuardar = () => {
    if (!nombre.trim()) return
    onGuardar({ nombre, valores: valores.filter((v) => v.trim()) })
    onClose()
  }

  const todosLlenos = nombre.trim() && valores.every((v) => v.trim())

  return (
    <Modal titulo="Agrega un atributo" onClose={onClose} size="sm">
      <div className="flex flex-col gap-5">

        {/* Nombre */}
        <div className="flex flex-col gap-1">
          <label className="font-body text-sm text-text-regular">
            Nombre del atributo
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Talla, Color, Material..."
            className="w-full px-4 py-3 font-body text-sm text-text-regular bg-transparent border border-text-light rounded-md placeholder:text-text-light focus:outline-none focus:border-text-regular"
          />
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