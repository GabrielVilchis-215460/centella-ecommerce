import logo from "../../assets/Logo_full_black.png"

export function Footer() {
  const año = new Date().getFullYear()

  return (
    <footer className="w-full bg-transparent">

      {/* Contenido principal */}
      <div className="flex items-center justify-between px-8 py-4">
        <img src={logo} alt="Centella" className="h-10 w-auto" />
        <span className="font-heading text-md text-text-dark italic ">
          Iluminando tu camino al éxito
        </span>
      </div>

      {/* Divisor */}
      <div className="border-t border-text-regular opacity-60 mx-8" />

      {/* Copyright */}
      <div className="flex justify-center px-8 py-4">
        <span className="font-body text-sm text-text-light">
          © {año} Centella | Todos los derechos reservados
        </span>
      </div>

    </footer>
  )
}