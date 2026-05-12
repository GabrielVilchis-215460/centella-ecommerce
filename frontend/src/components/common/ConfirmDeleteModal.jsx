import { IconAlertTriangle } from "@tabler/icons-react"
import { Modal } from "./Modal"
import { Button } from "./Button"

export function ConfirmDeleteModal({ nombre, tipo = "producto", onConfirmar, onCancelar }) {
  return (
    <Modal titulo="Confirmar eliminación" onClose={onCancelar} size="sm">
      <div className="flex flex-col gap-6">

        <div className="flex items-start gap-3">
          <IconAlertTriangle size={20} stroke={1.5} className="text-error shrink-0 mt-0.5" />
          <p className="font-body text-sm text-text-regular leading-relaxed">
            ¿Estás segura de que quieres eliminar{" "}
            <span className="text-text-dark font-body">{nombre}</span>?
            Esta acción no se puede deshacer.
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="secondary" size="sm" onClick={onCancelar}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" onClick={onConfirmar}>
            Eliminar {tipo}
          </Button>
        </div>

      </div>
    </Modal>
  )
}