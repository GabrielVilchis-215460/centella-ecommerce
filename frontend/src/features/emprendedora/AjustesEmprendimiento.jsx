import { useRef } from "react"
import { useNavigate } from "react-router-dom"
import { IconArrowLeft, IconPhotoPlus } from "@tabler/icons-react"
import { Header }           from "../../components/layout/Header"
import { Footer }           from "../../components/layout/Footer"
import { Button }           from "../../components/common/Button"
import { Select }           from "../../components/common/Select"
import { StatusBadge }      from "../../components/common/StatusBadge"
import { SocialButton }     from "../../components/common/SocialButton"
import { useAjustesEmprendimiento } from "../../hooks/useAjustesEmprendimiento"
import { COLORES_PERFIL }   from "../../hooks/useCrearPerfil"

export function AjustesEmprendimiento() {
  const navigate  = useNavigate()
  const logoRef   = useRef(null)

  const {
    cargando, guardando, error, exito,
    logoPreview, handleLogo,
    nombreNegocio, setNombreNegocio,
    descripcion, setDescripcion,
    colorHex, setColorHex,
    enlaces, handleEnlaceChange,
    estadoVerificacion, insignia, solicitudInsignia,
    haycambios,
    handleGuardar,
    handleSolicitarVerificacion,
    handleSolicitarInsignia,
  } = useAjustesEmprendimiento()

  if (cargando) return null

  const estadoVerifColor = {
    verificada:  "green",
    pendiente:   "orange",
    suspendida:  "red",
  }[estadoVerificacion] ?? "gray"

  const estadoInsigniaColor = insignia ? "green" : solicitudInsignia ? "orange" : "gray"
  const estadoInsigniaTexto = insignia ? "Activa" : solicitudInsignia ? "Pendiente" : "No solicitada"

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">

        {/* Título con flecha */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-text-light hover:text-text-dark transition-colors"
          >
            <IconArrowLeft size={20} stroke={1.5} />
          </button>
          <h1 className="font-heading text-2xl text-text-dark">
            Ajustes - Perfil de emprendimiento
          </h1>
        </div>

        <div className="grid grid-cols-2 gap-10">

          {/* ── Columna izquierda ── */}
          <div className="flex flex-col gap-5">

            {/* Nombre */}
            <div className="flex flex-col gap-1">
              <label className="font-body text-sm text-text-regular">Nombre del negocio</label>
              <input
                type="text"
                value={nombreNegocio}
                onChange={(e) => setNombreNegocio(e.target.value)}
                className="w-full px-3 py-2 font-body text-sm text-text-light bg-transparent border border-text-light rounded-md focus:outline-none focus:border-text-regular"
              />
            </div>

            {/* Descripción */}
            <div className="flex flex-col gap-1">
              <label className="font-body text-sm text-text-regular">Descripción breve del negocio</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 font-body text-sm text-text-light bg-transparent border border-text-light rounded-md focus:outline-none focus:border-text-regular resize-none"
              />
            </div>

            {/* Color */}
            <div className="flex flex-col gap-1">
              <label className="font-body text-sm text-text-regular">Color de perfil</label>
              <Select
                placeholder="Selecciona un color"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                options={COLORES_PERFIL.map((c) => ({ value: c.hex, label: c.nombre }))}
              />
            </div>

          </div>

          {/* ── Columna derecha ── */}
          <div className="flex flex-col gap-5">

            {/* Logo */}
            <div className="flex flex-col gap-2">
              <label className="font-body text-sm text-text-regular">Logo</label>
              <button
                onClick={() => logoRef.current?.click()}
                className="relative w-36 h-36 rounded-md bg-bg-light border border-text-light/30 flex items-center justify-center overflow-hidden group"
              >
                {logoPreview
                  ? <>
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="font-body text-xs text-white text-center px-2">Cambiar imagen</span>
                      </div>
                    </>
                  : <IconPhotoPlus size={32} stroke={1.5} color="var(--color-text-light)" />
                }
              </button>
              <input ref={logoRef} type="file" accept="image/*" onChange={handleLogo} className="hidden" />
            </div>

            {/* Redes sociales */}
            <div className="flex flex-col gap-2">
              <label className="font-body text-sm text-text-regular">Redes sociales</label>
              <div className="grid grid-cols-2 gap-3">
                {["web", "whatsapp", "facebook", "instagram"].map((red) => (
                  <SocialButton
                    key={red}
                    red={red}
                    enlace={enlaces[red] ?? null}
                    onEnlaceChange={handleEnlaceChange}
                  />
                ))}
              </div>
            </div>

            {/* Estado verificación */}
            <div className="flex flex-col gap-2">
              <label className="font-body text-sm text-text-regular">Estatus verificación</label>
              <div className="flex items-center gap-3">
                <StatusBadge texto={estadoVerificacion} color={estadoVerifColor} />
                {estadoVerificacion !== "verificada" && estadoVerificacion !== "pendiente" && (
                  <button
                    onClick={handleSolicitarVerificacion}
                    className="font-body text-sm text-primary underline hover:text-aux transition-colors"
                  >
                    Solicitar verificación
                  </button>
                )}
              </div>
            </div>

            {/* Estado insignia */}
            <div className="flex flex-col gap-2">
              <label className="font-body text-sm text-text-regular">Estatus insignia "Hecho en Juárez"</label>
              <div className="flex items-center gap-3">
                <StatusBadge texto={estadoInsigniaTexto} color={estadoInsigniaColor} />
                {!insignia && !solicitudInsignia && (
                  <button
                    onClick={handleSolicitarInsignia}
                    className="font-body text-sm text-primary underline hover:text-aux transition-colors"
                  >
                    Solicitar insignia
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

        {error && <p className="font-body text-sm text-error mt-4">{error}</p>}
        {exito  && <p className="font-body text-sm text-success mt-4">Cambios guardados exitosamente.</p>}

        {/* Botón guardar */}
        <div className="flex justify-end mt-8">
          <Button
            size="sm"
            onClick={handleGuardar}
            disabled={guardando || !haycambios()}
            className="w-auto! px-10"
          >
            {guardando ? "Guardando..." : "Guardar"}
          </Button>
        </div>

      </main>

      <Footer />
    </div>
  )
}