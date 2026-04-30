import { useLocation } from "react-router-dom"
import { useVerificarCodigo } from "../../hooks/useVerificarCodigo"
import { AuthLayout } from "../../components/common/AuthLayout"

export function VerificarCodigo() {
  const location = useLocation()
  const modo     = location.state?.modo || "registro"

  const {
    codigo, email, error, cargando, cooldown,
    codigoCompleto, inputsRef,
    handleChange, handleKeyDown, handlePaste,
    handleReenviar, handleSubmit,
  } = useVerificarCodigo({ modo })

  const backTo = modo === "registro" ? "/registro" : "/recuperar-contrasena"

  return (
    <AuthLayout backTo={backTo}>
      <div className="flex flex-col gap-6 w-full items-center">

        <div className="flex flex-col gap-2 text-center">
          <h1 className="font-heading text-2xl text-text-dark">Código de verificación</h1>
          <p className="font-body text-sm text-text-light">
            Ingresa el código de 6 dígitos enviado a{" "}
            <span className="text-text-regular">{email || "usuario@ejemplo.com"}</span>
          </p>
        </div>

        {/* Inputs del código */}
        <div className="flex gap-3" onPaste={handlePaste}>
          {codigo.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-12 h-14 text-center font-body text-xl text-text-dark bg-transparent border border-text-light rounded-md focus:outline-none focus:border-primary transition-colors"
            />
          ))}
        </div>

        {/* Reenviar código */}
        <button
          onClick={handleReenviar}
          disabled={cooldown > 0}
          className="font-body text-sm text-primary underline hover:text-aux transition-colors disabled:text-text-light disabled:no-underline disabled:cursor-not-allowed"
        >
          {cooldown > 0 ? `Reenviar código (${cooldown}s)` : "Reenviar código"}
        </button>

        {error && <p className="font-body text-sm text-error text-center">{error}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={cargando || codigoCompleto.length < 6}
          className="w-full py-3 bg-primary text-white font-body text-base rounded-full hover:bg-aux transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {cargando ? "Verificando..." : "Verificar código"}
        </button>

      </div>
    </AuthLayout>
  )
}