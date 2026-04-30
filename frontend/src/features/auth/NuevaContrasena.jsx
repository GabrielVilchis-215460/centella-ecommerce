import { useState } from "react"
import { IconEye, IconEyeOff } from "@tabler/icons-react"
import { useNuevaContrasena } from "../../hooks/useNuevaContrasena"
import { AuthLayout } from "../../components/common/AuthLayout"

export function NuevaContrasena() {
  const {
    contrasena, setContrasena,
    confirmar, setConfirmar,
    requisitos, formularioValido,
    error, cargando,
    handleSubmit,
  } = useNuevaContrasena()

  const [mostrarPass,      setMostrarPass]      = useState(false)
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false)

  return (
    <AuthLayout backTo="/verificar-codigo">
      <div className="flex flex-col gap-6 w-full">

        <div className="flex flex-col gap-2 text-center">
          <h1 className="font-heading text-2xl text-text-dark">Nueva contraseña</h1>
          <p className="font-body text-sm text-text-light">
            Crea una nueva contraseña segura para tu cuenta
          </p>
        </div>

        <div className="flex flex-col gap-4">

          {/* Formulario */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="font-body text-sm text-text-regular">Nueva contraseña</label>
              <button
                type="button"
                onClick={() => setMostrarPass(!mostrarPass)}
                className="flex items-center gap-1 font-body text-sm text-text-light hover:text-text-regular transition-colors"
              >
                {mostrarPass ? <IconEyeOff size={16} stroke={1.5} /> : <IconEye size={16} stroke={1.5} />}
                {mostrarPass ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            <input
              type={mostrarPass ? "text" : "password"}
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit() }}
              className="w-full px-3 py-2 font-body text-sm text-text-light bg-transparent border border-text-light rounded-md focus:outline-none focus:border-text-regular"
            />
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
              {requisitos.map((r) => (
                <div key={r.id} className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${r.cumplido ? "bg-aux" : "bg-text-light"}`} />
                  <span className={`font-body text-xs ${r.cumplido ? "text-aux" : "text-text-light"}`}>
                    {r.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Confirmar */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="font-body text-sm text-text-regular">Confirmar contraseña</label>
              <button
                type="button"
                onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                className="flex items-center gap-1 font-body text-sm text-text-light hover:text-text-regular transition-colors"
              >
                {mostrarConfirmar ? <IconEyeOff size={16} stroke={1.5} /> : <IconEye size={16} stroke={1.5} />}
                {mostrarConfirmar ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            <input
              type={mostrarConfirmar ? "text" : "password"}
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit() }}
              className={`
                w-full px-3 py-2 font-body text-sm text-text-light bg-transparent
                border rounded-md focus:outline-none transition-colors
                ${confirmar && contrasena !== confirmar
                  ? "border-error" : "border-text-light focus:border-text-regular"
                }
              `}
            />
            {confirmar && contrasena !== confirmar && (
              <span className="font-body text-xs text-error">Las contraseñas no coinciden.</span>
            )}
          </div>

          {error && <p className="font-body text-sm text-error text-center">{error}</p>}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={cargando || !formularioValido}
            className="w-full py-3 bg-primary text-white font-body text-base rounded-full hover:bg-aux transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {cargando ? "Guardando..." : "Restablecer contraseña"}
          </button>

        </div>
      </div>
    </AuthLayout>
  )
}