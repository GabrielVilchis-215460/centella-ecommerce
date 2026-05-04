import { useState, useRef, useEffect } from "react"
import { useLocation, useNavigate, Link } from "react-router-dom"
import {
  IconShoppingCart,
  IconSearch,
  IconMenu2,
  IconUser,
  IconHistory,
  IconSettings,
  IconLogout,
} from "@tabler/icons-react"
import { useAuth } from "../../context/AuthContext"
import logo from "../../assets/Logo_sm_white.png"
import { CartDropdown } from "../common/CartDropdown"
import { useCart } from "../../context/CartContext"

// Nav 
const NAV_EMPRENDEDORA = [
  { label: "Panel",     path: "/dashboard" },
  { label: "Productos", path: "/dashboard/productos" },
  { label: "Servicios", path: "/dashboard/servicios" },
  { label: "Pedidos",   path: "/dashboard/pedidos" },
]

const NAV_ADMIN = [
  { label: "Panel",           path: "/admin" },
  { label: "Emprendedoras",   path: "/admin/emprendedoras" },
  { label: "Insignias",       path: "/admin/insignias" },
  { label: "Moderación",      path: "/admin/moderacion" },
]

// Dropdown de perfil
function ProfileDropdown({ onClose }) {
  const { usuario, logout, esCliente, esEmprendedora } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
    onClose()
  }

  return (
    <div className="absolute right-0 top-[calc(100%+8px)] w-56 bg-bg-light rounded-lg shadow-lg z-50 overflow-hidden">

      {/* Nombre */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-bg-dark">
        <div className="w-9 h-9 rounded-full overflow-hidden bg-bg-dark shrink-0">
          {usuario?.foto_perfil_url
            ? <img src={usuario.foto_perfil_url} alt="Foto" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center">
                <IconUser size={18} stroke={1.5} color="var(--color-text-light)" />
              </div>
          }
        </div>
        <span className="font-body text-base font-regular text-text-dark truncate">
          {usuario?.nombre} {usuario?.apellido}
        </span>
      </div>

      {/* Opciones por rol */}
      <div className="flex flex-col py-2">

        {esCliente() && ( // historial solo para los clientes
          <Link
            to="/historial"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 font-body text-sm text-text-regular hover:bg-bg-dark transition-colors"
          >
            <IconHistory size={18} stroke={1.5} />
            Historial de compras
          </Link>
        )}

        {!esCliente() && (  // ajustes para clientes y emprendedoras
          esEmprendedora() && (
            <Link
              to="/perfil/ajustes"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 font-body text-sm text-text-regular hover:bg-bg-dark transition-colors"
            >
              <IconSettings size={18} stroke={1.5} />
              Ajustes
            </Link>
          )
        )}

        {esCliente() && (
          <Link
            to="/perfil/ajustes"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 font-body text-sm text-text-regular hover:bg-bg-dark transition-colors"
          >
            <IconSettings size={18} stroke={1.5} />
            Ajustes
          </Link>
        )}

        <button //todos pueden cerrar sesion
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 font-body text-sm text-text-regular hover:bg-bg-dark transition-colors w-full text-left"
        >
          <IconLogout size={18} stroke={1.5} />
          Cerrar sesión
        </button>

      </div>
    </div>
  )
}

// Header Cliente
function HeaderCliente() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [busqueda, setBusqueda]         = useState("")
  const navigate                        = useNavigate()
  const dropdownRef                     = useRef(null)
  const carritoRef                      = useRef(null)
  const [carritoAbierto, setCarritoAbierto] = useState(false)

  // ← Consumir contexto en lugar de estado local
  const { items, eliminarItem, actualizarCantidad } = useCart()

  useEffect(() => {
    const handler = (e) => {
      if (carritoRef.current && !carritoRef.current.contains(e.target))
        setCarritoAbierto(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleBuscar = (e) => {
    e.preventDefault()
    if (busqueda.trim()) navigate(`/catalogo?q=${busqueda}`)
  }

  return (
    <header className="w-full bg-primary px-6 py-3 flex items-center gap-10 sticky top-0 z-40">
      <Link to="/">
        <img src={logo} alt="Centella" className="h-10 w-auto" />
      </Link>

      <form onSubmit={handleBuscar} className="flex-1 flex items-center bg-bg-light rounded-full px-6 py-2 gap-2">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="¿Buscando algo en específico?"
          className="flex-1 bg-transparent font-body text-sm text-text-light placeholder:text-text-light outline-none"
        />
        <button type="submit">
          <IconSearch size={20} stroke={2} color="var(--color-text-regular)" />
        </button>
      </form>

      <div className="flex items-center gap-8">

        {/* Carrito */}
        <div className="relative" ref={carritoRef}>
          <button 
            onClick={() => setCarritoAbierto(!carritoAbierto)}
            className="flex items-center"
          >
            <IconShoppingCart size={26} stroke={1.5} color="white" />
          </button>
          {carritoAbierto && (
            <CartDropdown
              items={items}                        // ← del contexto
              onEliminar={eliminarItem}            // ← del contexto
              onCantidadChange={actualizarCantidad} // ← del contexto
              onClose={() => setCarritoAbierto(false)}
            />
          )}
        </div>

        {/* Perfil */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1 bg-bg-light rounded-full px-3 py-2"
          >
            <IconMenu2 size={18} stroke={2} color="var(--color-primary)" />
            <IconUser size={18} stroke={2} color="var(--color-primary)" />
          </button>
          {dropdownOpen && (
            <ProfileDropdown onClose={() => setDropdownOpen(false)} />
          )}
        </div>

      </div>
    </header>
  )
}

// Header con nav (Emprendedora y Admin)
function HeaderNav({ navItems }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const location = useLocation()
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <header className="w-full bg-primary px-6 py-3 flex items-center justify-between sticky top-0 z-40">

      <Link to="/">
        <img src={logo} alt="Centella" className="h-10 w-auto" />
      </Link>

      {/* Nav links */}
      <nav className="flex items-center gap-6">
        {navItems.map((item, i) => {
          const activo = location.pathname === item.path
          return (
            <div key={item.path} className="flex items-center gap-6">
              <Link
                to={item.path}
                className="relative font-body text-base text-white font-regular pb-1"
              >
                {item.label}
                {activo && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white rounded-full" />
                )}
              </Link>
              {i < navItems.length - 1 && (
                <span className="text-white opacity-40">•</span>
              )}
            </div>
          )
        })}
      </nav>

      {/* perfil */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-3 bg-bg-light rounded-full px-3 py-2"
        >
          <IconMenu2 size={18} stroke={2} color="var(--color-primary)" />
          <IconUser size={18} stroke={2} color="var(--color-primary)" />
        </button>

        {dropdownOpen && (
          <ProfileDropdown onClose={() => setDropdownOpen(false)} />
        )}
      </div>

    </header>
  )
}

export function Header() {
  const { esCliente, esEmprendedora, esAdmin } = useAuth()

  if (esCliente())      return <HeaderCliente />
  if (esEmprendedora()) return <HeaderNav navItems={NAV_EMPRENDEDORA} />
  if (esAdmin())        return <HeaderNav navItems={NAV_ADMIN} />
  //return <HeaderCliente />  // ← fallback para no autenticados
}