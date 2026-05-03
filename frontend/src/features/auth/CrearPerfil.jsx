import { useRef } from "react"
import { Link } from "react-router-dom"
import { IconPhotoPlus } from "@tabler/icons-react"
import { useCrearPerfil, COLORES_PERFIL } from "../../hooks/useCrearPerfil"
import { DateSelect }    from "../../components/common/DateSelect"
import { SocialButton } from "../../components/common/SocialButton"
import { Select }       from "../../components/common/Select"
import logoWhite        from "../../assets/logo_sm_white.png"
import bgGeneral        from "../../assets/create_general.png"
import bgAdvanced       from "../../assets/create_advanced.jpg"

export function CrearPerfil() {
  const {
    paso,
    nombre, setNombre,
    apellido, setApellido,
    fecha, setFecha,
    fotoPreview, handleFotoPerfil,
    paso1Valido,
    handleSiguientePaso1,
    nombreNegocio, setNombreNegocio,
    descripcion, setDescripcion,
    colorHex, setColorHex,
    logoPreview, handleLogo,
    enlaces, handleEnlaceChange,
    paso2Valido,
    handleSiguientePaso2,
    cargando, error,
    setPaso,
  } = useCrearPerfil()

  const fotoRef = useRef(null)
  const logoRef = useRef(null)

  const bgActual = paso === 1 ? bgGeneral : bgAdvanced
  const colorFondo = paso === 1 ? "var(--color-primary)" : "var(--color-secondary)"

  return (
    <div className="min-h-screen relative flex items-center justify-center p-8">

      {/* Fondo — imagen + overlay de color */}
      <div className="absolute inset-0">
        <img src={bgActual} alt="" className="w-full h-full object-cover opacity-70" />
        <div className="absolute inset-0" style={{ backgroundColor: colorFondo, opacity: 0.25 }} />
      </div>

      {/* Tarjeta */}
      <div
        className="relative w-full max-w-2xl rounded-xl p-8 flex flex-col gap-6"
        style={{
            backgroundColor: paso === 1
            ? "rgba(135, 43, 61, 0.75)"
            : "rgba(90, 66, 138, 0.75)"
        }}
      >

        {/* Header */}
        <div className="relative flex items-center justify-center">
          <img src={logoWhite} alt="Centella" className="absolute left-0 h-10 w-auto" />
          <h1 className="font-heading text-2xl text-white">
            {paso === 1 ? "Crea tu perfil" : "Crea tu perfil de emprendimiento"}
          </h1>
        </div>

        {/* ── Paso 1 — Perfil general ── */}
        {paso === 1 && (
          <div className="flex flex-col gap-5">

            {/* Foto de perfil */}
            <div className="flex justify-center">
              <button
                onClick={() => fotoRef.current?.click()}
                className="relative w-32 h-32 rounded-full bg-bg-light flex items-center justify-center overflow-hidden group"
              >
                {fotoPreview
                    ? <>
                        <img src={fotoPreview} alt="Foto" className="w-full h-full object-cover" />
                        {/* Overlay en hover */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="font-body text-xs text-white text-center leading-snug px-2">
                            Cambiar imagen
                        </span>
                        </div>
                    </>
                    : <IconPhotoPlus size={32} stroke={1.5} color="var(--color-text-light)" />
                }
              </button>
              <input ref={fotoRef} type="file" accept="image/*" onChange={handleFotoPerfil} className="hidden" />
            </div>

            {/* Nombre */}
            <div className="flex flex-col gap-1">
              <label className="font-body text-sm text-white">Nombre</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-3 py-2 font-body text-sm text-white bg-transparent border border-white/50 rounded-md focus:outline-none focus:border-white placeholder:text-white/50"
              />
            </div>

            {/* Apellido */}
            <div className="flex flex-col gap-1">
              <label className="font-body text-sm text-white">Apellido</label>
              <input
                type="text"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                className="w-full px-3 py-2 font-body text-sm text-white bg-transparent border border-white/50 rounded-md focus:outline-none focus:border-white placeholder:text-white/50"
              />
            </div>

            {/* Fecha de nacimiento */}
            <div className="flex flex-col gap-1">
              <label className="font-body text-sm text-white">Fecha de nacimiento</label>
              <DateSelect variant="light" value={fecha} onChange={setFecha} />
            </div>

            {error && <p className="font-body text-sm text-white text-center">{error}</p>}

          </div>
        )}

        {/* ── Paso 2 — Perfil emprendimiento ── */}
        {paso === 2 && (
          <div className="grid grid-cols-[1fr_1.5fr] gap-4 px-4">

            {/* Columna izquierda */}
            <div className="flex flex-col gap-4">

              {/* Logo */}
              <div className="flex flex-col gap-2">
                <label className="font-body text-sm text-white">Logo</label>
                <button
                  onClick={() => logoRef.current?.click()}
                  className="relative w-40 h-40 rounded-md bg-bg-light flex items-center justify-center overflow-hidden group"
                >
                  {logoPreview
                    ? <>
                        <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="font-body text-xs text-white text-center leading-snug px-2">
                            Cambiar imagen
                        </span>
                        </div>
                    </>
                    : <IconPhotoPlus size={32} stroke={1.5} color="var(--color-text-light)" />
                  }
                </button>
                <input ref={logoRef} type="file" accept="image/*" onChange={handleLogo} className="hidden" />
              </div>

              {/* Redes sociales */}
              <div className="flex flex-col gap-2">
                <label className="font-body text-sm text-white">Agrega tus redes sociales</label>
                <div className="grid grid-cols-2 gap-2 w-45">
                  {["web", "whatsapp", "facebook", "instagram"].map((red) => (
                    <SocialButton
                      key={red}
                      red={red}
                      enlace={enlaces[red]}
                      onEnlaceChange={handleEnlaceChange}
                      variant="light"
                    />
                  ))}
                </div>
              </div>

            </div>

            {/* Columna derecha */}
            <div className="flex flex-col gap-5">

              {/* Nombre del negocio */}
              <div className="flex flex-col gap-1">
                <label className="font-body text-sm text-white">Nombre del negocio</label>
                <input
                  type="text"
                  value={nombreNegocio}
                  onChange={(e) => setNombreNegocio(e.target.value)}
                  className="w-full px-3 py-2 font-body text-sm text-white bg-transparent border border-white/50 rounded-md focus:outline-none focus:border-white"
                />
              </div>

              {/* Descripción */}
              <div className="flex flex-col gap-1">
                <label className="font-body text-sm text-white">Descripción breve del negocio</label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 font-body text-sm text-white bg-transparent border border-white/50 rounded-md focus:outline-none focus:border-white resize-none"
                />
              </div>

              {/* Color del perfil */}
              <div className="flex flex-col gap-1">
                <label className="font-body text-sm text-white">Selecciona un color para tu perfil</label>
                <Select
                  placeholder="Selecciona un color"
                  value={colorHex}
                  variant="light"
                  onChange={(e) => setColorHex(e.target.value)}
                  options={COLORES_PERFIL.map((c) => ({
                    value: c.hex,
                    label: c.nombre,
                  }))}
                  className="text-white border-white/50 bg-transparent"
                />
              </div>

            </div>
          </div>
        )}

        {error && paso === 2 && (
          <p className="font-body text-sm text-white text-center">{error}</p>
        )}

      </div>

      {/* Botones fuera de la tarjeta — abajo */}
      <div className="absolute bottom-8 left-8 right-8 flex justify-between items-center">
        {paso === 2 && (
          <button
            onClick={() => setPaso(1)}
            className="px-8 py-3 bg-bg-dark text-text-dark font-body text-base rounded-full hover:bg-bg transition-colors"
          >
            Volver
          </button>
        )}

        <div className="ml-auto">
          <button
            onClick={paso === 1 ? handleSiguientePaso1 : handleSiguientePaso2}
            disabled={cargando || (paso === 1 ? !paso1Valido : !paso2Valido)}
            className={`
                px-8 py-3 text-white font-body text-base rounded-full transition-colors
                disabled:opacity-40 disabled:cursor-not-allowed
                ${paso === 1
                ? "bg-primary hover:bg-aux"
                : "bg-secondary-dark hover:bg-secondary"
                }
            `}
            >
            {cargando ? "Guardando..." : "Siguiente"}
          </button>
        </div>
      </div>

    </div>
  )
}