import { useState } from "react"
import { Modal }      from "./Modal"
import { Button }     from "./Button"
import { StarRating } from "./StarRating"
import { catalogoService } from "../../services/catalogoService"
import { useAuth } from "../../context/AuthContext"

export function ResenaModal({ tipo, idReferencia, idEmprendedora, nombreItem, nombreEmprendedora, onClose, onGuardada }) {
  const { usuario } = useAuth()
  const [calItem,      setCalItem]      = useState(0)
  const [calVendedora, setCalVendedora] = useState(0)
  const [comentario,   setComentario]   = useState("")
  const [guardando,    setGuardando]    = useState(false)
  const [error,        setError]        = useState("")

  const valido = calItem > 0 && calVendedora > 0

  const handleGuardar = async () => {
    if (!valido) return
    try {
      setGuardando(true)
      setError("")
      await catalogoService.crearResena({
        id_cliente:              usuario.id,
        id_emprendedora:         idEmprendedora,
        tipo_resena:             tipo,
        id_referencia:           idReferencia,
        calificacion_item:       calItem,
        calificacion_vendedora:  calVendedora,
        comentario:              comentario || null,
      })
      onGuardada?.()
      onClose()
    } catch (err) {
      const detail = err.response?.data?.detail
      if (detail === "Review already exists for this item") {
        setError("Ya dejaste una reseña para este elemento.")
      } else {
        setError("Error al guardar la reseña.")
      }
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Modal titulo="Escribe una reseña" onClose={onClose} size="md">
      <div className="flex flex-col gap-6">

        {/* Calificación del item */}
        <div className="flex items-center gap-3">
          <span className="font-body text-base text-text-dark shrink-0">Producto</span>
          <span className="text-text-light">•</span>
          <span className="font-body text-base text-text-dark shrink-0">
            {nombreItem ?? (tipo === "producto" ? "Producto" : "Servicio")}
          </span>
          <span className="text-text-light">•</span>
          <StarRating value={calItem} onChange={setCalItem} size={22} />
        </div>

        {/* Comentario */}
        <div className="flex flex-col gap-1">
          <label className="font-body text-sm text-text-regular">
            Agrega un comentario
          </label>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value.slice(0, 300))}
            rows={5}
            className="w-full px-3 py-2 font-body text-sm text-text-regular bg-transparent border border-text-light/60 rounded-md focus:outline-none focus:border-text-regular resize-none placeholder:text-text-light/40"
          />
        </div>

        {/* Calificación emprendedora */}
        <div className="flex items-center gap-3">
          <span className="font-body text-base text-text-dark shrink-0">Emprendedora</span>
          <span className="text-text-light">•</span>
          <span className="font-body text-base text-text-dark shrink-0">
            {nombreEmprendedora ?? "Emprendedora"}
          </span>
          <span className="text-text-light">•</span>
          <StarRating value={calVendedora} onChange={setCalVendedora} size={22} />
        </div>

        {error && <p className="font-body text-sm text-error">{error}</p>}

        {/* Botón alineado a la derecha */}
        <div className="flex justify-end">
          <Button
          size="sm"
            onClick={handleGuardar}
            disabled={guardando || !valido}
            className="w-auto! px-8"
          >
            {guardando ? "Guardando..." : "Publicar reseña"}
          </Button>
        </div>

      </div>
    </Modal>
  )
}