import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./context/AuthContext"

/* ----- IR DESCOMENTANDO CADA RUTA CONFORME SE VAYA INCORPORANDO O YAMA ------*/
// public
import { Login }    from "./features/auth/Login"
import { Registro } from "./features/auth/Registro"
import { Terminos } from "./features/auth/Terminos"
import { RecuperarContrasena } from "./features/auth/RecuperarContrasena"
import { VerificarCodigo }     from "./features/auth/VerificarCodigo"
import { NuevaContrasena }     from "./features/auth/NuevaContrasena"
import { CrearPerfil } from "./features/auth/CrearPerfil"
//gen
import { Ajustes } from "./features/auth/Ajustes"

// rutas del cliente
import { Catalogo }         from "./features/cliente/Catalogo"
import { Checkout }         from "./features/cliente/Checkout"
import { CheckoutPago } from "./features/cliente/CheckoutPago"
import { ConfirmacionPago } from "./features/cliente/ConfirmacionPago"
import { CheckoutConfirmacion } from "./features/cliente/CheckoutConfirmacion"
import { HistorialCompras } from "./features/cliente/HistorialCompras"

// rutas de emprendedoras
import { Dashboard }            from "./features/emprendedora/Dashboard"
// import { GestionProductos }     from "./features/emprendedora/GestionProductos"
// import { GestionServicios }     from "./features/emprendedora/GestionServicios"
import { GestionPedidos }       from "./features/emprendedora/GestionPedidos"
import { DetalleEmprendedora } from "./features/emprendedora/DetalleEmprendedora"
import { GestionPagina } from "./features/emprendedora/GestionPagina"
import { AjustesEmprendimiento } from "./features/emprendedora/AjustesEmprendimiento"

// rutas de admin
import { AdminPanel }    from "./features/admin/AdminPanel"
//import { Emprendedoras } from "./features/admin/Emprendedoras"
//import { Insignias }     from "./features/admin/Insignias"
//import { Moderacion }    from "./features/admin/Moderacion"

// rutas protegidas
function ProtectedRoute({ children, roles = [] }) {
  const { usuario, cargando } = useAuth()

  if (cargando) return null
  if (!usuario) return <Navigate to="/login" replace />
  if (roles.length > 0 && !roles.includes(usuario.tipo_usuario))
    return <Navigate to="/" replace />

  return children
}

function RutaRaiz() {
  const { usuario } = useAuth()
  if (usuario.tipo_usuario === "administrador") return <Navigate to="/admin" replace />
  if (usuario.tipo_usuario === "emprendedora")  return <Navigate to="/dashboard" replace />
  return <Navigate to="/catalogo" replace />
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={
        <ProtectedRoute>
          <RutaRaiz />
        </ProtectedRoute>
      } />

      {/* Públicas */}
      <Route path="/login"    element={<Login />}    />
      <Route path="/registro" element={<Registro />} />
      <Route path="/terminos" element={<Terminos />} />
      <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
      <Route path="/verificar-correo"     element={<VerificarCodigo />}     />
      <Route path="/verificar-codigo"     element={<VerificarCodigo />}     />
      <Route path="/nueva-contrasena"     element={<NuevaContrasena />}     />
      <Route path="/crear-perfil" element={<CrearPerfil />} />

      <Route path="/perfil/ajustes" element={
        <ProtectedRoute roles={["cliente", "emprendedora"]}>
          <Ajustes />
        </ProtectedRoute>
      } />

      {/* Cliente */}
      
      <Route path="/catalogo" element={<Catalogo />} />
      {/*<Route path="/catalogo" element={<Catalogo />}         />
      {/*<Route path="/catalogo/producto/:id"      element={<DetalleProducto />}  />
      <Route path="/catalogo/servicio/:id"      element={<DetalleServicio />}  />*/}
      <Route path="/catalogo/emprendedora/:id" element={<DetalleEmprendedora />} />
      <Route path="/checkout" element={
        <ProtectedRoute roles={["cliente"]}>
            <Checkout />
        </ProtectedRoute>
      } />
      <Route path="/checkout/pago" element={
        <ProtectedRoute roles={["cliente"]}>
            <CheckoutPago />
        </ProtectedRoute>
      } />
      <Route path="/pagos/confirm/stripe/:id_pedido" element={
        <ProtectedRoute roles={["cliente"]}>
          <ConfirmacionPago />
        </ProtectedRoute>
      } />
      <Route path="/pagos/confirm/paypal/:id_pedido" element={
        <ProtectedRoute roles={["cliente"]}>
          <ConfirmacionPago />
        </ProtectedRoute>
      } />
      <Route path="/checkout/confirmacion" element={
        <ProtectedRoute roles={["cliente"]}>
          <CheckoutConfirmacion />
        </ProtectedRoute>
      } />
      {/*<Route path="/checkout/confirmacion" element={
      <ProtectedRoute roles={["cliente"]}>
          <Confirmacion />
      </ProtectedRoute>
      } />*/}
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
      {/*<Route path="/dashboard/productos" element={
        <ProtectedRoute roles={["emprendedora"]}>
          <GestionProductos />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/servicios" element={
        <ProtectedRoute roles={["emprendedora"]}>
          <GestionServicios />
        </ProtectedRoute>
      } />*/}
      <Route path="/dashboard/pedidos" element={
        <ProtectedRoute roles={["emprendedora"]}>
          <GestionPedidos />
        </ProtectedRoute>
      } />
      {/*<Route path="/dashboard/pagina" element={
        <ProtectedRoute roles={["emprendedora"]}>
          <Pagina />
        </ProtectedRoute>
      } />*/}
      <Route path="/dashboard/gestionpagina" element={
        <ProtectedRoute roles={["emprendedora"]}>
          <GestionPagina />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/GestionPerfil" element={
        <ProtectedRoute roles={["emprendedora"]}>
          <AjustesEmprendimiento />
        </ProtectedRoute>
      } />

      {/* Admin */}
      <Route path="/admin" element={
        <ProtectedRoute roles={["administrador"]}>
          <AdminPanel />
        </ProtectedRoute>
      } />
      {/*
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
        */}
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  )
}