import { useState } from "react"
import { Modal }  from "./Modal"
import { Button } from "./Button"
import { reporteService } from "../../services/reporteService"
import { useAuth } from "../../context/AuthContext"

export function ReporteModal({ tipo, idReferencia, nombreContenido, onClose }) {
  const { usuario } = useAuth()
  const [motivo,    setMotivo]    = useState("")
  const [enviando,  setEnviando]  = useState(false)
  const [error,     setError]     = useState("")

  const handleReportar = async () => {
    try {
      setEnviando(true)
      setError("")
      await reporteService.crearReporte({
        tipo_contenido: tipo,
        id_referencia:  idReferencia,
        motivo:         motivo || null,
      })
      onClose()
    } catch {
      setError("Error al enviar el reporte.")
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Modal titulo="Reporte" onClose={onClose} size="md">
      <div className="flex flex-col gap-5">

        <p className="font-body text-base text-text-dark">{nombreContenido}</p>

        <div className="flex flex-col gap-1">
          <label className="font-body text-sm text-text-light">
            Agrega la razón de tu reporte
          </label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value.slice(0, 300))}
            rows={5}
            className="w-full px-3 py-2 font-body text-sm text-text-regular bg-transparent border border-text-light/60 rounded-md focus:outline-none focus:border-text-regular resize-none"
          />
        </div>

        {error && <p className="font-body text-sm text-error">{error}</p>}

        <div className="flex justify-end">
          <Button
          size="sm"
            onClick={handleReportar}
            disabled={enviando}
            className="w-auto! px-8"
          >
            {enviando ? "Enviando..." : "Reportar"}
          </Button>
        </div>

      </div>
    </Modal>
  )
}