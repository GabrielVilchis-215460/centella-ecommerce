import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./context/AuthContext"

// public
import { Login }    from "./pages/auth/Login"
import { Registro } from "./pages/auth/Registro"

// rutas del cliente
import { Catalogo }         from "./pages/cliente/Catalogo"
import { Checkout }         from "./pages/cliente/Checkout"
import { HistorialCompras } from "./pages/cliente/HistorialCompras"

// rutas de emprendedoras
import { Dashboard }            from "./pages/emprendedora/Dashboard"
import { GestionProductos }     from "./pages/emprendedora/GestionProductos"
import { GestionServicios }     from "./pages/emprendedora/GestionServicios"
import { GestionPedidos }       from "./pages/emprendedora/GestionPedidos"
import { PaginaEmprendimiento } from "./pages/emprendedora/PaginaEmprendimiento"

// rutas de admin
import { AdminPanel }    from "./features/admin/AdminPanel"
import { Emprendedoras } from "./pages/admin/Emprendedoras"
import { Insignias }     from "./pages/admin/Insignias"
import { Moderacion }    from "./pages/admin/Moderacion"

// rutas protegidas
function ProtectedRoute({ children, roles = [] }) {
  const { usuario, cargando } = useAuth()

  if (cargando) return null
  if (!usuario) return <Navigate to="/login" replace />
  if (roles.length > 0 && !roles.includes(usuario.tipo_usuario))
    return <Navigate to="/" replace />

  return children
}

export function AppRoutes() {
  return (
    <Routes>

      {/* Públicas */}
      <Route path="/login"    element={<Login />}    />
      <Route path="/registro" element={<Registro />} />

      {/* Cliente */}
      <Route path="/" element={<Catalogo />} />
      <Route path="/catalogo"                   element={<Catalogo />}         />
      <Route path="/catalogo/producto/:id"      element={<DetalleProducto />}  />
      <Route path="/catalogo/servicio/:id"      element={<DetalleServicio />}  />
      <Route path="/catalogo/emprendedora/:id"  element={<DetalleEmprendedora />} />
      <Route path="/checkout" element={
      <ProtectedRoute roles={["cliente"]}>
          <Checkout />
      </ProtectedRoute>
      } />
      <Route path="/checkout/pago" element={
      <ProtectedRoute roles={["cliente"]}>
          <Pago />
      </ProtectedRoute>
      } />
      <Route path="/checkout/confirmacion" element={
      <ProtectedRoute roles={["cliente"]}>
          <Confirmacion />
      </ProtectedRoute>
      } />
      <Route path="/historial" element={
        <ProtectedRoute roles={["cliente"]}>
          <HistorialCompras />
        </ProtectedRoute>
      } />

      {/* Emprendedora */}
      <Route path="/dashboard" element={
        <ProtectedRoute roles={["emprendedora"]}>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/productos" element={
        <ProtectedRoute roles={["emprendedora"]}>
          <GestionProductos />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/servicios" element={
        <ProtectedRoute roles={["emprendedora"]}>
          <GestionServicios />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/pedidos" element={
        <ProtectedRoute roles={["emprendedora"]}>
          <GestionPedidos />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/pagina" element={
        <ProtectedRoute roles={["emprendedora"]}>
          <PaginaEmprendimiento />
        </ProtectedRoute>
      } />

      {/* Admin */}
      <Route path="/admin" element={
        <ProtectedRoute roles={["administrador"]}>
          <AdminPanel />
        </ProtectedRoute>
      } />
      <Route path="/admin/emprendedoras" element={
        <ProtectedRoute roles={["administrador"]}>
          <Emprendedoras />
        </ProtectedRoute>
      } />
      <Route path="/admin/insignias" element={
        <ProtectedRoute roles={["administrador"]}>
          <Insignias />
        </ProtectedRoute>
      } />
      <Route path="/admin/moderacion" element={
        <ProtectedRoute roles={["administrador"]}>
          <Moderacion />
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  )
}