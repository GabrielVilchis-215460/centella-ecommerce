import { useRecuperarContrasena } from "../../hooks/useRecuperarContrasena"
import { AuthLayout } from "../../components/common/AuthLayout"

export function RecuperarContrasena() {
  const { email, setEmail, error, exito, cargando, handleSubmit } = useRecuperarContrasena()

  return (
    <AuthLayout backTo="/login">
      <div className="flex flex-col gap-6 w-full">

        <div className="flex flex-col gap-2 text-center">
          <h1 className="font-heading text-2xl text-text-dark">Restablecer contraseña</h1>
          <p className="font-body text-sm text-text-light">
            Ingresa tu correo electrónico para recibir un código de verificación
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-body text-sm text-text-regular">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit() }}
              placeholder="designer@gmail.com"
              className="w-full px-3 py-2 font-body text-sm text-text-light bg-transparent border border-text-light rounded-md focus:outline-none focus:border-text-regular placeholder:text-text-light/50"
            />
          </div>

          {error && <p className="font-body text-sm text-error text-center">{error}</p>}
          {exito && (
            <p className="font-body text-sm text-aux text-center">
                Si tu correo está registrado, recibirás un código brevemente. Revisa tu bandeja de entrada.
            </p>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={cargando || !email.trim()}
            className="w-full py-3 bg-primary text-white font-body text-base rounded-full hover:bg-aux transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {cargando ? "Enviando..." : "Enviar código"}
          </button>
        </div>

      </div>
    </AuthLayout>
  )
}