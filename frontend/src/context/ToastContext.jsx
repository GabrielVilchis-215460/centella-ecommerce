import { createContext, useContext, useState, useCallback } from "react"
import { ToastContainer } from "../components/common/ToastContainer"

const ToastContext = createContext()

const DURATION = 3500
const EXIT_DURATION = 300

// referencia externa para usar fuera de React
export const toastRef = { showToast: null }

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, removing: true } : t))
    // elimina del estado
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, EXIT_DURATION)
  }, [])

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type, removing: false }])
    setTimeout(() => removeToast(id), DURATION)
  }, [removeToast])

  toastRef.showToast = showToast

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}