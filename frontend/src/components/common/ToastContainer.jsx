import { Toast } from "./Toast"

export function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed top-18 right-6 flex flex-col gap-2 z-50">
      {toasts.map(t => (
        <Toast key={t.id} {...t} onRemove={onRemove} />
      ))}
    </div>
  )
}