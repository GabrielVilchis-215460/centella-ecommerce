import { useState } from "react"
import { Modal } from "./Modal"
import { Select } from "./Select"
import { Switch } from "./Switch"
import { NumberInput } from "./NumberInput"
import { SocialButton } from "./SocialButton"

// categorias como prop
export function ServicioModal({ onClose, onGuardar, servicio = null, categorias = [] }) {
  const modo = servicio ? "editar" : "agregar"

  const [nombre,      setNombre]      = useState(servicio?.nombre      || "")
  const [descripcion, setDescripcion] = useState(servicio?.descripcion || "")
  const [precio,      setPrecio]      = useState(servicio?.precio      || 0)
  const [categoria,   setCategoria]   = useState(servicio?.categoria   || "")
  const [activo,      setActivo]      = useState(servicio?.activo      ?? true)
  const [enlaces,     setEnlaces]     = useState(servicio?.enlaces     || {
    whatsapp:  null,
    web:       null,
    facebook:  null,
    instagram: null,
  })
  const [redActiva,  setRedActiva]  = useState(() => {
  if (!servicio?.enlaces) return null
  const entrada = Object.entries(servicio.enlaces).find(([_, url]) => url)
  return entrada ? { red: entrada[0], url: entrada[1] } : null
})
  const [otroEnlace, setOtroEnlace] = useState(servicio?.otroEnlace || "")

  const handleEnlaceChange = (red, url) => {
    if (!url) {
      setRedActiva(null)
    } else {
      setRedActiva({ red, url })
    }
  }

  const tieneEnlace = !!redActiva || !!otroEnlace

  const handleGuardar = () => {
    if (!nombre.trim() || !precio || !categoria || !tieneEnlace) return
    onGuardar({ nombre, descripcion, precio, categoria, activo, 
      enlaces: redActiva || (otroEnlace ? { red: "otro", url: otroEnlace } : null) })
    onClose()
  }
  const formularioValido = nombre.trim() && precio > 0 && categoria && tieneEnlace

  return (
    <Modal
      titulo={modo === "agregar" ? "Crear servicio" : "Editar servicio"}
      onClose={onClose}
      size="lg"
    >
      <div className="grid grid-cols-2 gap-8">

        {/* col izquierda*/}
        <div className="flex flex-col gap-5">

          {/* Nombre */}
          <div className="flex flex-col gap-1">
            <label className="font-body text-sm text-text-regular">Nombre del servicio</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3 py-2 font-body text-sm text-text-light bg-transparent border border-text-light rounded-md focus:outline-none focus:border-text-regular"
            />
          </div>

          {/* Descripcion */}
          <div className="flex flex-col gap-1">
            <label className="font-body text-sm text-text-regular">Descripción del servicio</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={5}
              className="w-full px-3 py-2 font-body text-sm text-text-light bg-transparent border border-text-light rounded-md focus:outline-none focus:border-text-regular resize-none"
            />
          </div>

          {/* Precio y Categoría */}
          <div className="flex gap-4">
            <NumberInput
              label="Precio"
              value={precio}
              onChange={setPrecio}
              min={0}
              prefix="$"
              className="w-36"
            />
            {/* ya no tiene el categorias mock */}
            <div className="flex-1">
              <Select
                label="Categoría"
                labelClassName="text-sm"
                placeholder="Categorias"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                options={categorias.map((c) => ({ value: String(c.id_categoria), label: c.nombre }))}
                className="text-sm"
              />
            </div>
          </div>

        </div>

        {/* col derecha */}
        <div className="flex flex-col gap-5">

          {/* Enlace para agendar */}
          <div className="flex flex-col gap-3">
            <label className="font-body text-sm text-text-regular">Enlace para agendar</label>

            {/* Botones de redes */}
            <div className="flex gap-4">
              {["whatsapp", "web", "facebook", "instagram"].map((red) => (
                <SocialButton
                  key={red}
                  red={red}
                  enlace={redActiva?.red === red ? redActiva.url : null}
                  onEnlaceChange={handleEnlaceChange}
                  disabled={!!otroEnlace || (redActiva && redActiva.red !== red)}
                />
              ))}
            </div>

            {/* Otro enlace */}
            <div className="flex flex-col gap-1">
              <label className="font-body text-sm text-text-regular">Otro enlace</label>
              <div className="relative">
                <input
                  type="url"
                  value={otroEnlace}
                  onChange={(e) => setOtroEnlace(e.target.value)}
                  placeholder="https://..."
                  disabled={!!redActiva}
                  className="w-full px-3 py-2 pr-10 font-body text-sm text-text-light bg-transparent border border-text-light rounded-md placeholder:text-text-light focus:outline-none focus:border-text-regular disabled:opacity-40"
                />
                {otroEnlace && (
                  <button
                    onClick={() => setOtroEnlace("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light hover:text-text-dark transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Servicio activo */}
          <div className="flex items-center justify-between">
            <label className="font-body text-sm text-text-regular">Servicio activo</label>
            <Switch checked={activo} onChange={setActivo} />
          </div>

        </div>
      </div>

      {/* Boton guardar */}
      <div className="flex justify-end mt-6">
        <button
          onClick={handleGuardar}
          disabled={!formularioValido}
          className="px-10 py-3 bg-primary text-white font-body text-base rounded-full hover:bg-aux transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {modo === "agregar" ? "Crear servicio" : "Guardar cambios"}
        </button>
      </div>

    </Modal>
  )
}