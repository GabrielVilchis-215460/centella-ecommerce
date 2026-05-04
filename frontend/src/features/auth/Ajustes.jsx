import { useRef } from "react"
import { IconEye, IconEyeOff, IconX, IconAlertTriangle } from "@tabler/icons-react"
import { useState } from "react"
import { Header }          from "../../components/layout/Header"
import { Footer }          from "../../components/layout/Footer"
import { Button }          from "../../components/common/Button"
import { DateSelect }      from "../../components/common/DateSelect"
import { DireccionModal }  from "../../components/common/DireccionModal"
import { Modal } from "../../components/common/Modal"
import { useAjustes }      from "../../hooks/useAjustes"
import { useAuth }         from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"

function SeccionAjustes({ titulo, children }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-heading text-lg text-text-dark">{titulo}</h2>
        <div className="border-t border-text-light/30 mt-2" />
      </div>
      {children}
    </div>
  )
}

export function Ajustes() {
  const { esCliente } = useAuth()
  const fotoRef = useRef(null)

  const [mostrarActual,   setMostrarActual]   = useState(false)
  const [mostrarNueva,    setMostrarNueva]    = useState(false)
  const [mostrarConfirmar,setMostrarConfirmar]= useState(false)

  const {
    cargando, guardando,
    nombre, setNombre,
    apellido, setApellido,
    fecha, setFecha,
    fotoPreview,
    handleFoto, handleEliminarFoto,
    handleGuardarPerfil,
    perfilCambiado,
    errorPerfil, exitoPerfil,
    contrasenaActual, setContrasenaActual,
    contrasenaNueva, setContrasenaNueva,
    confirmarContrasena, setConfirmarContrasena,
    requisitosPass, passValida,
    handleCambiarContrasena,
    errorPass, exitoPass,
    direcciones,
    modalDireccion, setModalDireccion,
    handleEliminarDireccion,
    handleAgregarDireccion,
    modalEliminar, setModalEliminar,
    handleEliminarCuenta,
  } = useAjustes()

  if (cargando) return null

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10 flex flex-col gap-10">

        <h1 className="font-heading text-xl text-text-dark">Perfil</h1>

        {/* ── Información personal ── */}
        <SeccionAjustes titulo="Información Personal">

          {/* Foto de perfil */}
          <div className="flex flex-col gap-2">
            <label className="font-body text-sm text-text-regular">Foto de perfil</label>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-full overflow-hidden bg-bg-dark shrink-0">
                {fotoPreview
                  ? <img src={fotoPreview} alt="Foto" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center font-body text-text-light text-xl">
                      {nombre?.slice(0, 1)?.toUpperCase() || "?"}
                    </div>
                }
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => fotoRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-bg-dark rounded-full font-body text-sm text-text-regular hover:bg-text-light/20 transition-colors"
                >
                  Cambiar foto
                </button>
                {fotoPreview && (
                  <button
                    onClick={handleEliminarFoto}
                    className="font-body text-sm text-error hover:text-text-dark transition-colors"
                  >
                    Eliminar
                  </button>
                )}
              </div>
              <input ref={fotoRef} type="file" accept="image/*" onChange={handleFoto} className="hidden" />
            </div>
          </div>

          {/* Nombre */}
          <div className="flex flex-col gap-1">
            <label className="font-body text-sm text-text-regular">Nombre *</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3 py-2 font-body text-sm text-text-light bg-transparent border border-text-light rounded-md focus:outline-none focus:border-text-regular"
            />
          </div>

          {/* Apellido */}
          <div className="flex flex-col gap-1">
            <label className="font-body text-sm text-text-regular">Apellido *</label>
            <input
              type="text"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              className="w-full px-3 py-2 font-body text-sm text-text-light bg-transparent border border-text-light rounded-md focus:outline-none focus:border-text-regular"
            />
          </div>

          {/* Fecha */}
          <DateSelect
            label="Fecha de nacimiento *"
            value={fecha}
            onChange={setFecha}
            labelClassName="text-sm"
          />

          {errorPerfil && <p className="font-body text-sm text-error">{errorPerfil}</p>}
          {exitoPerfil  && <p className="font-body text-sm text-success">Cambios guardados exitosamente.</p>}

          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleGuardarPerfil}
              disabled={guardando || !perfilCambiado()}
              className="w-auto! px-8"
            >
              {guardando ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>

        </SeccionAjustes>

        {/* ── Seguridad ── */}
        <SeccionAjustes titulo="Seguridad">
          <h3 className="font-body text-base text-text-dark font-medium">Cambiar contraseña</h3>
          <p className="font-body text-sm text-text-light">
            Asegúrate de usar una contraseña segura con al menos 8 caracteres
          </p>

          {/* Contraseña actual */}
          <div className="flex flex-col gap-1">
            <label className="font-body text-sm text-text-regular">Contraseña actual *</label>
            <div className="relative">
              <input
                type={mostrarActual ? "text" : "password"}
                value={contrasenaActual}
                onChange={(e) => setContrasenaActual(e.target.value)}
                className="w-full px-3 py-2 pr-10 font-body text-sm text-text-light bg-transparent border border-text-light rounded-md focus:outline-none focus:border-text-regular"
              />
              <button
                type="button"
                onClick={() => setMostrarActual(!mostrarActual)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light"
              >
                {mostrarActual ? <IconEyeOff size={16} stroke={1.5} /> : <IconEye size={16} stroke={1.5} />}
              </button>
            </div>
          </div>

          {/* Nueva contraseña */}
          <div className="flex flex-col gap-1">
            <label className="font-body text-sm text-text-regular">Nueva contraseña *</label>
            <div className="relative">
              <input
                type={mostrarNueva ? "text" : "password"}
                value={contrasenaNueva}
                onChange={(e) => setContrasenaNueva(e.target.value)}
                className="w-full px-3 py-2 pr-10 font-body text-sm text-text-light bg-transparent border border-text-light rounded-md focus:outline-none focus:border-text-regular"
              />
              <button
                type="button"
                onClick={() => setMostrarNueva(!mostrarNueva)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light"
              >
                {mostrarNueva ? <IconEyeOff size={16} stroke={1.5} /> : <IconEye size={16} stroke={1.5} />}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
              {requisitosPass.map((r) => (
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
            <label className="font-body text-sm text-text-regular">Confirmar nueva contraseña *</label>
            <div className="relative">
              <input
                type={mostrarConfirmar ? "text" : "password"}
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
                className={`
                  w-full px-3 py-2 pr-10 font-body text-sm text-text-light bg-transparent
                  border rounded-md focus:outline-none transition-colors
                  ${confirmarContrasena && contrasenaNueva !== confirmarContrasena
                    ? "border-error" : "border-text-light focus:border-text-regular"
                  }
                `}
              />
              <button
                type="button"
                onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light"
              >
                {mostrarConfirmar ? <IconEyeOff size={16} stroke={1.5} /> : <IconEye size={16} stroke={1.5} />}
              </button>
            </div>
            {confirmarContrasena && contrasenaNueva !== confirmarContrasena && (
              <span className="font-body text-xs text-error">Las contraseñas no coinciden.</span>
            )}
          </div>

          {errorPass && <p className="font-body text-sm text-error">{errorPass}</p>}
          {exitoPass  && <p className="font-body text-sm text-success">Contraseña actualizada exitosamente.</p>}

          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleCambiarContrasena}
              disabled={guardando || !passValida}
              className="w-auto! px-8"
            >
              {guardando ? "Actualizando..." : "Actualizar contraseña"}
            </Button>
          </div>

        </SeccionAjustes>

        {/* ── Direcciones — solo clientes ── */}
        {esCliente() && (
          <SeccionAjustes titulo="Direcciones">
            <h3 className="font-body text-base text-text-dark font-medium">Direcciones guardadas</h3>
            <p className="font-body text-sm text-text-light">
              Gestiona las direcciones de envío para tus pedidos
            </p>

            <div className="flex flex-col gap-3">
              {direcciones.length === 0 ? (
                <p className="font-body text-sm text-text-light">No hay direcciones guardadas.</p>
              ) : (
                direcciones.map((d) => (
                  <div key={d.id_direccion} className="relative bg-bg-light rounded-md px-4 py-3 shadow-sm">
                    <button
                      onClick={() => handleEliminarDireccion(d.id_direccion)}
                      className="absolute top-3 right-3 text-text-light hover:text-error transition-colors"
                    >
                      <IconX size={16} stroke={1.5} />
                    </button>
                    <p className="font-body text-sm text-text-regular">
                      {d.calle} {d.numero_ext}{d.numero_int ? `, ${d.numero_int}` : ""}
                    </p>
                    <p className="font-body text-sm text-text-light">
                      {d.colonia}, {d.ciudad}, {d.estado}, {d.codigo_postal}
                    </p>
                    {d.es_principal && (
                      <span className="font-body text-xs text-primary">Principal</span>
                    )}
                  </div>
                ))
              )}
            </div>

            <Button size="sm" onClick={() => setModalDireccion(true)}>
              +  Nueva dirección
            </Button>

          </SeccionAjustes>
        )}

        {/* ── Eliminar cuenta ── */}
        <SeccionAjustes titulo="Eliminar cuenta">
          <div className="bg-error/10 rounded-md p-4 flex flex-col gap-3 border border-error/80">
            <div className="flex items-start gap-3">
              <IconAlertTriangle size={20} stroke={1.5} color="var(--color-error)" className="shrink-0 mt-0.5" />
              <div>
                <p className="font-body text-sm text-text-dark font-medium">Eliminar cuenta</p>
                <p className="font-body text-sm text-text-light mt-1">
                  Una vez eliminada tu cuenta, no podrás recuperarla. Todos tus datos, pedidos,
                  e información se eliminarán permanentemente.
                </p>
              </div>
            </div>
            <Button size="sm" onClick={() => setModalEliminar(true)} className="w-auto! self-start px-6">
              Eliminar mi cuenta
            </Button>

            {modalEliminar && (
            <Modal titulo="¿Eliminar cuenta?" onClose={() => setModalEliminar(false)} size="sm">
                <div className="flex flex-col gap-4">
                <p className="font-body text-sm text-text-regular">
                    ¿Estás seguro de que deseas desactivar tu cuenta? No podrás iniciar sesión hasta que un administrador la reactive.
                </p>
                <div className="flex gap-3 justify-end">
                    <Button variant="secondary" size="sm" className="!w-auto px-6" onClick={() => setModalEliminar(false)}>
                    Cancelar
                    </Button>
                    <Button size="sm" className="!w-auto px-6 bg-error hover:bg-error/80" onClick={handleEliminarCuenta}>
                    Desactivar cuenta
                    </Button>
                </div>
                </div>
            </Modal>
            )}
          </div>
        </SeccionAjustes>

      </main>

      <Footer />

      {modalDireccion && (
        <DireccionModal
          onClose={() => setModalDireccion(false)}
          onGuardar={handleAgregarDireccion}
        />
      )}

    </div>
  )
}