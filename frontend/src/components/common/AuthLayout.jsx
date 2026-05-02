import { Link } from "react-router-dom"
import { IconArrowLeft } from "@tabler/icons-react"
import { Footer } from "../layout/Footer"
import logoSm from "../../assets/logo_sm_black.png"

export function AuthLayout({ children, backTo = "/login" }) {
  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative">

        {/* Flecha */}
        <Link
          to={backTo}
          className="absolute top-12 left-12 flex items-center gap-1 font-body text-sm text-text-light hover:text-text-dark transition-colors"
        >
          <IconArrowLeft size={32} stroke={1.5  } />
        </Link>

        {/* Logo */}
        <div className="flex flex-col items-center gap-8 w-full max-w-md">
          <img src={logoSm} alt="Centella" className="h-12 w-auto" />
          {children}
        </div>

      </main>
      <Footer />
    </div>
  )
}