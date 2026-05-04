import { useState } from "react"
import { Modal } from "./Modal"
import { Button } from "./Button"
import { Checkbox } from "./Checkbox"

export function DireccionModal({ onClose, onGuardar, direccionInicial = null }) {
  const [calle,     setCalle]     = useState(direccionInicial?.calle      || "")
  const [colonia,   setColonia]   = useState(direccionInicial?.colonia    || "")
  const [numExt,    setNumExt]    = useState(direccionInicial?.numero_ext || "")
  const [numInt,    setNumInt]    = useState(direccionInicial?.numero_int || "")
  const [ciudad,    setCiudad]    = useState(direccionInicial?.ciudad     || "")
  const [cp,        setCp]        = useState(direccionInicial?.codigo_postal    || "")
  const [telefono,  setTelefono]  = useState(direccionInicial?.numero_telefonico || "")
  const [principal, setPrincipal] = useState(direccionInicial?.es_principal     || false)
  const [guardando,  setGuardando]  = useState(false)
  const [error,      setError]      = useState("")

  const valido = calle.trim() && colonia.trim() && numExt.trim() && ciudad.trim() && cp.trim()

  const handleGuardar = async () => {
    if (!valido) return
    try {
      setGuardando(true)
      setError("")
      await onGuardar({
        calle,
        colonia,
        numero_ext:        numExt,
        numero_int:        numInt || null,
        estado:            "CHH",
        ciudad,
        codigo_postal:     cp,
        numero_telefonico: telefono,
        es_principal:      principal,
      })
    } catch (err) {
      setError(err.response?.data?.detail || "Error al agregar la dirección.")
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Modal titulo={direccionInicial ? "Editar dirección" : "Nueva dirección"} onClose={onClose} size="sm">
      <div className="flex flex-col gap-4">

        {/* Calle */}
        <div className="flex flex-col gap-1">
          <label className="font-body text-sm text-text-regular">Calle *</label>
          <input
            type="text"
            value={calle}
            onChange={(e) => setCalle(e.target.value)}
            placeholder="Ej: Calle roja"
            className="w-full px-3 py-2 font-body text-sm text-text-light bg-transparent border border-text-light rounded-md focus:outline-none focus:border-text-regular placeholder:text-text-light/50"
          />
        </div>

        {/* Colonia */}
        <div className="flex flex-col gap-1">
          <label className="font-body text-sm text-text-regular">Colonia *</label>
          <input
            type="text"
            value={colonia}
            onChange={(e) => setColonia(e.target.value)}
            placeholder="Ej. Fraccionamiento azul"
            className="w-full px-3 py-2 font-body text-sm text-text-light bg-transparent border border-text-light rounded-md focus:outline-none focus:border-text-regular placeholder:text-text-light/50"
          />
        </div>

        {/* Número exterior e interior */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-body text-sm text-text-regular">Número exterior *</label>
            <input
              type="text"
              value={numExt}
              onChange={(e) => setNumExt(e.target.value)}
              placeholder="Ej. 1234"
              className="w-full px-3 py-2 font-body text-sm text-text-light bg-transparent border border-text-light rounded-md focus:outline-none focus:border-text-regular placeholder:text-text-light/50"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-body text-sm text-text-regular">Número interior</label>
            <input
              type="text"
              value={numInt}
              onChange={(e) => setNumInt(e.target.value)}
              placeholder="Ej. A-210"
              className="w-full px-3 py-2 font-body text-sm text-text-light bg-transparent border border-text-light rounded-md focus:outline-none focus:border-text-regular placeholder:text-text-light/50"
            />
          </div>
        </div>

        {/* Estado fijo + Ciudad */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-body text-sm text-text-regular">Estado *</label>
            <input
              type="text"
              value="CHH"
              disabled
              className="w-full px-3 py-2 font-body text-sm text-text-light bg-bg-dark border border-text-light rounded-md opacity-60 cursor-not-allowed"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-body text-sm text-text-regular">Ciudad *</label>
            <input
              type="text"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              placeholder="Ej. Ciudad Juárez"
              className="w-full px-3 py-2 font-body text-sm text-text-light bg-transparent border border-text-light rounded-md focus:outline-none focus:border-text-regular placeholder:text-text-light/50"
            />
          </div>
        </div>

        {/* Codigo postal y Teléfono */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-body text-sm text-text-regular">Código Postal *</label>
            <input
              type="text"
              value={cp}
              onChange={(e) => setCp(e.target.value)}
              placeholder="Ej. 12345"
              className="w-full px-3 py-2 font-body text-sm text-text-light bg-transparent border border-text-light rounded-md focus:outline-none focus:border-text-regular placeholder:text-text-light/50"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-body text-sm text-text-regular">Número telefónico</label>
            <input
              type="text"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Ej. 123 456 7890"
              className="w-full px-3 py-2 font-body text-sm text-text-light bg-transparent border border-text-light rounded-md focus:outline-none focus:border-text-regular placeholder:text-text-light/50"
            />
          </div>
        </div>

        {/* Dirección principal */}
        <Checkbox
          label="Dirección principal"
          checked={principal}
          onChange={setPrincipal}
        />

        {error && <p className="font-body text-sm text-error">{error}</p>}

        <Button
          size="sm"
          onClick={handleGuardar}
          disabled={guardando || !valido}
          className="mt-2"
        >
          {guardando ? "Guardando..." : direccionInicial ? "Guardar cambios" : "Agregar dirección"}
        </Button>

      </div>
    </Modal>
  )
}