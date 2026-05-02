import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { IconEye, IconEyeOff } from "@tabler/icons-react"
import { useAuth } from "../../context/AuthContext"
import { Footer } from "../../components/layout/Footer"
import logoFullColor from "../../assets/logo_full_color.png"
import loginImg     from "../../assets/login.png"
import aboutUs    from "../../assets/about_us.png"
import { useLogin } from "../../hooks/useLogin"

export function Login() {
  const {
    email, setEmail,
    contrasena, setContrasena,
    error, cargando,
    handleSubmit,
  } = useLogin()

  const [mostrarPass, setMostrarPass] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-bg">

      {/* Seccion superior*/}
      <section className="grid min-h-[85vh]" style={{ gridTemplateColumns: "40% 60%" }}>

        {/* Imagen */}
        <div className="flex flex-col overflow-hidden">
          <img
            src={loginImg}
            alt="Emprendedora"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Formulario derecha */}
        <div className="flex flex-col justify-center px-16 py-12">
          
          {/* Titulo */}
          <div className="text-center mb-8">
            <h1 className="font-heading text-2xl text-text-dark">
              Bienvenido de vuelta a
            </h1>
            <div className="flex items-center justify-center gap-2 mt-1">
              <img src={logoFullColor} alt="Centella" className="h-10 w-auto" />
            </div>
            <p className="font-body text-sm text-text-regular mt-8 max-w-sm mx-auto">
              Inicia sesión para ver que hay nuevo en la mejor plataforma de
              comercio en Ciudad Juárez
            </p>
          </div>

          {/* Formulario */}
          <form className="flex flex-col gap-5 max-w-md mx-auto w-full">

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="font-body text-sm text-text-regular">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 font-body text-sm text-text-light bg-transparent border border-text-light rounded-md focus:outline-none focus:border-text-regular"
              />
            </div>

            {/* Contraseña */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="font-body text-sm text-text-regular">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setMostrarPass(!mostrarPass)}
                  className="flex items-center gap-1 font-body text-sm text-text-light hover:text-text-regular transition-colors"
                >
                  {mostrarPass
                    ? <IconEyeOff size={16} stroke={1.5} />
                    : <IconEye    size={16} stroke={1.5} />
                  }
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
              <div className="flex justify-end mt-1">
                <p className="font-body text-sm text-text-light">
                  ¿No recuerdas tu contraseña?{" "}
                  <Link to="/recuperar-contrasena" className="text-primary underline hover:text-secondary transition-colors">Reestablécela</Link>
                </p>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="font-body text-sm text-error text-center">{error}</p>
            )}

            {/* Boton */}
            <div className="flex flex-col items-center gap-3 mt-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={cargando || !email.trim() || !contrasena.trim()}
                className="w-full py-3 bg-primary text-white font-body text-base rounded-full hover:bg-aux transition-colors disabled:cursor-not-allowed"
              >
                {cargando ? "Ingresando..." : "Ingresar"}
              </button>
              <p className="font-body text-sm text-text-light">
                ¿No tienes una cuenta?{" "}
                <Link to="/registro" className="text-primary underline hover:text-secondary transition-colors">
                  Crea una
                </Link>
              </p>
            </div>

          </form>
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