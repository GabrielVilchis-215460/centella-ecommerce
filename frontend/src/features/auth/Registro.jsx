import { useState } from "react"
import { Link } from "react-router-dom"
import { IconEye, IconEyeOff } from "@tabler/icons-react"
import { useRegistro } from "../../hooks/useRegistro"
import { Footer } from "../../components/layout/Footer"
import logoFullColor  from "../../assets/logo_full_color.png"
import signupImg      from "../../assets/signup.jpg"
import aboutUs from "../../assets/about_us.png"

export function Registro() {
  const {
    tipoUsuario, setTipoUsuario,
    email, setEmail,
    contrasena, setContrasena,
    confirmar, setConfirmar,
    aceptaTerminos, setAceptaTerminos,
    requisitos,
    formularioValido,
    error, cargando,
    handleSubmit,
  } = useRegistro()

  const [mostrarPass,     setMostrarPass]     = useState(false)
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-bg">

      {/* ── Sección superior ── */}
      <section className="grid min-h-[85vh]" style={{ gridTemplateColumns: "55% 45%" }}>

        {/* Formulario izquierda */}
        <div className="flex flex-col justify-center px-16 py-12 bg-bg">

          {/* Título */}
          <div className="text-center mb-8">
            <h1 className="font-heading text-2xl text-text-dark flex items-end justify-center gap-3 leading-none">
              Bienvenido a
              <img src={logoFullColor} alt="Centella" className="h-9 w-auto" />
            </h1>
            <p className="font-body text-base text-text-regular mt-3">
              Registrate y conecta con vendedoras y clientes locales
            </p>
          </div>

          {/* Selector de rol */}
          <div className="flex gap-3 max-w-md mx-auto w-full mb-6">
            <button
              onClick={() => setTipoUsuario("cliente")}
              className={`
                flex-1 py-2 rounded-lg font-body text-base transition-colors
                ${tipoUsuario === "cliente"
                  ? "bg-primary text-white"
                  : "bg-bg-dark text-text-regular hover:bg-text-light/20"
                }
              `}
            >
              Quiero comprar
            </button>
            <button
              onClick={() => setTipoUsuario("emprendedora")}
              className={`
                flex-1 py-2 rounded-lg font-body text-base transition-colors
                ${tipoUsuario === "emprendedora"
                  ? "bg-primary text-white"
                  : "bg-bg-dark text-text-regular hover:bg-text-light/20"
                }
              `}
            >
              Quiero vender
            </button>
          </div>

          {/* Formulario */}
          <div className="flex flex-col gap-5 max-w-md mx-auto w-full">

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="font-body text-sm text-text-regular">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSubmit() }}
                className="w-full px-3 py-2 font-body text-sm text-text-light bg-transparent border border-text-light rounded-md focus:outline-none focus:border-text-regular"
              />
            </div>

            {/* Contraseña */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="font-body text-sm text-text-regular">Contraseña</label>
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

              {/* Requisitos */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
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

            {/* Confirmar contraseña */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="font-body text-sm text-text-regular">Confirma tu contraseña</label>
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
                    ? "border-error focus:border-error"
                    : "border-text-light focus:border-text-regular"
                  }
                `}
              />
              {confirmar && contrasena !== confirmar && (
                <span className="font-body text-xs text-error">
                  Las contraseñas no coinciden.
                </span>
              )}
            </div>

            {/* Términos y condiciones */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terminos"
                checked={aceptaTerminos}
                onChange={(e) => setAceptaTerminos(e.target.checked)}
                className="mt-1 accent-primary shrink-0"
              />
              <label htmlFor="terminos" className="font-body text-sm text-text-regular">
                He leído y acepto los{" "}
                <Link to="/terminos" className="text-primary underline hover:text-aux transition-colors">
                  Términos y Condiciones
                </Link>{" "}
                de la plataforma.
              </label>
            </div>

            {/* Error */}
            {error && (
              <p className="font-body text-sm text-error text-center">{error}</p>
            )}

            {/* Botón */}
            <div className="flex flex-col items-center gap-3 mt-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={cargando || !formularioValido}
                className="w-full py-3 bg-primary text-white font-body text-base rounded-full hover:bg-aux transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {cargando ? "Creando cuenta..." : "Crear cuenta"}
              </button>
              <p className="font-body text-sm text-text-light">
                ¿Ya tienes una cuenta?{" "}
                <Link to="/login" className="text-primary underline hover:text-aux transition-colors">
                  Inicia sesión
                </Link>
              </p>
            </div>

          </div>
        </div>

        {/* Imagen derecha */}
        <div className="relative overflow-hidden">
          <img
            src={signupImg}
            alt="Emprendedora"
            className="w-full h-full object-cover"
          />
        </div>

      </section>

      {/* Seccion inferior */}
      <section className="bg-aux px-24 pt-10 py-16">
      <div className="flex flex-col gap-12">

          {/* Descubre más */}
          <div className="flex flex-col gap-4">
          <h2 className="font-heading text-xl text-bg-light text-right">
              Descubre más sobre Centella
          </h2>
          <p className="font-body text-base text-bg-light text-center leading-relaxed mx-auto pt-5">
              Centella nació para darle visibilidad a las mujeres emprendedoras de Ciudad Juárez
              que crean productos únicos y servicios de calidad. Aquí encontrarás joyería,
              bisutería, artesanías y mucho más, todo hecho con dedicación y talento local.
              Cada compra que haces apoya directamente a una microempresaria de tu comunidad.
          </p>
          </div>

          <div className="grid grid-cols-2 gap-16 items-start">
          {/* textos */}
          <div className="flex flex-col gap-10">

              <div className="flex flex-col gap-3">
              <h3 className="font-heading text-lg text-bg-light">
                  Para las emprendedoras
              </h3>
              <p className="font-body text-base text-bg-light leading-relaxed">
                  Centella te ofrece un espacio propio para mostrar tu negocio al mundo.
                  Crea tu perfil, publica tus productos y servicios, gestiona tus pedidos
                  y accede a métricas que te ayudarán a entender y hacer crecer tu
                  emprendimiento, sin necesidad de ser experta en tecnología.
              </p>
              </div>

              <div className="flex flex-col gap-3">
              <h3 className="font-heading text-lg text-bg-light">
                  Para los clientes
              </h3>
              <p className="font-body text-base text-bg-light leading-relaxed">
                  En Centella puedes explorar, descubrir y adquirir productos y servicios
                  de emprendedoras locales de una manera sencilla y segura. Filtra por
                  categoría o precio, lee reseñas de otros compradores y realiza tu pago
                  con el método que más te convenga, todo desde un solo lugar.
              </p>
              </div>

          </div>

          {/* imagen */}
          <img
              src={aboutUs}
              alt="Centella"
              className="w-full h-full object-cover rounded-lg"
          />

          </div>
      </div>
      </section>

      <Footer />

    </div>
  )
}