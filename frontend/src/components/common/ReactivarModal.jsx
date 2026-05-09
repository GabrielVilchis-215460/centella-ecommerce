import { useState } from "react"
import { IconUserCheck } from "@tabler/icons-react"
import { Modal } from "../../components/common/Modal.jsx"

export function ModalReactivar({ emprendedora, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    await onConfirm()
    setLoading(false)
    onClose()
  }

  return (
    <Modal titulo="Reactivar Cuenta" onClose={onClose} size="sm">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 p-4 bg-states-green/30 rounded-lg">
          <IconUserCheck size={20} stroke={1.5} className="text-green-500 mt-0.5 shrink-0" />
          <p className="text-sm font-body text-text-regular">
            ¿Estás seguro de que deseas reactivar la cuenta de{" "}
            <span className="font-medium text-text-dark">{emprendedora.nombre_negocio}</span>?
          </p>
        </div>

        <ul className="flex flex-col gap-1 px-4 text-sm font-body text-text-regular list-disc list-inside bg-bg rounded-lg p-4">
          <p>Esta acción realizará lo siguiente: </p>  
          <li>Restaurará el acceso a la cuenta (inicio de sesión)</li>
          <li>Devolverá su estado a "Verificada"</li>
        </ul>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 font-body text-sm text-text-regular hover:text-text-dark transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-6 py-2 bg-primary text-white font-body text-sm rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Reactivando..." : "Reactivar"}
          </button>
        </div>
      </div>
    </Modal>
  )
}
