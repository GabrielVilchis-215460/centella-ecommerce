import { useRef, useCallback } from "react"
import { Navigate } from "react-router-dom"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import {
  IconChevronLeft,
  IconChevronRight,
  IconRosette,
  IconShieldCheck,
  IconPhoto,
  IconLoader2,
  IconBold,
  IconItalic,
  IconList,
  IconListNumbers,
  IconH1,
  IconH2,
  IconLink,
  IconSeparator,
  IconArrowLeft,
  IconCarambola,
  IconRosetteDiscountCheck
} from "@tabler/icons-react"
import { Icon }             from "../../components/common/Icon"
import { Header }           from "../../components/layout/Header"
import { Footer }           from "../../components/layout/Footer"
import { ProductCard }      from "../../components/common/ProductCard"
import { useAuth }          from "../../context/AuthContext"
import { useGestionPagina } from "../../hooks/useGestionPagina"
import { emprendedoraService } from "../../services/emprendedoraService"
import { Button } from "../../components/common/Button"
import { ServiceCard } from "../../components/common/ServiceCard"

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-md bg-bg-dark ${className}`} />
}

// ─── Encabezado ───────────────────────────────────────────────────────────────

function EncabezadoEmprendedora({ logoUrl, nombreNegocio, etiquetas, rating, insignia, verificada, cargando, accion }) {
  if (cargando) {
    return (
      <div className="flex items-start gap-5 py-6 px-6">
        <Skeleton className="h-24 w-24 rounded-xl flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-5 py-6 px-6">
        {/* Flecha volver */}
        <button
          onClick={() => window.history.back()}
          className="flex-shrink-0 mt-2 hover:opacity-70 transition-opacity"
        >
          <Icon icon={IconArrowLeft} size={20} color="var(--color-text-regular)" />
        </button>

        {logoUrl ? (
          <img
            src={logoUrl}
            alt={nombreNegocio}
            className="h-24 w-24 flex-shrink-0 rounded-xl object-contain bg-white shadow-sm p-1"
          />
        ) : (
          <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center
                          rounded-xl bg-bg-dark text-text-light text-sm font-bold uppercase">
            {(nombreNegocio ?? "?").slice(0, 2)}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-heading text-xl font-bold text-text-dark">{nombreNegocio}</h1>
            {verificada && (<Icon icon={IconRosetteDiscountCheck} size={24} color="var(--color-text-regular)" />)}
          </div>
          {etiquetas.length > 0 && (
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {etiquetas.map((e, i) => (
                <span key={e} className="font-body text-sm text-text-light">
                  {e}{i < etiquetas.length - 1 && <span className="ml-2">•</span>}
                </span>
              ))}
              {rating && (
                <div className="flex items-center gap-1">
                  <Icon icon={IconCarambola} size={14} color="var(--color-text-light)" />
                  <span className="font-body text-sm text-text-light">
                    {Number(rating.promedio_vendedora ?? 0).toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          )}
      </div>
      {accion && <div className="flex-shrink-0">{accion}</div>}
    </div>
  )
}

// ─── Toolbar del editor ───────────────────────────────────────────────────────

function ToolbarBtn({ onClick, active, title, children }) {
  return (
    <button
      onMouseDown={(e) => {
        e.preventDefault()  // ← evita que el editor pierda el foco
        onClick()
      }}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? "bg-primary text-white"
          : "text-text-regular hover:bg-bg-dark"
      }`}
    >
      {children}
    </button>
  )
}

function EditorToolbar({ editor, onImageClick, subiendo }) {
  if (!editor) return null

  const addLink = () => {
    const url = window.prompt("URL del enlace:")
    if (url) editor.chain().focus().setLink({ href: url }).run()
  }

  return (
    <div className="flex items-center gap-1 flex-wrap px-3 py-2 border-b border-bg-dark bg-bg">
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="Negrita"
      >
        <Icon icon={IconBold} size={16} color="currentColor" />
      </ToolbarBtn>

      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="Cursiva"
      >
        <Icon icon={IconItalic} size={16} color="currentColor" />
      </ToolbarBtn>

      <div className="w-px h-4 bg-bg-dark mx-1" />

      <ToolbarBtn
        onClick={() => {
          editor.chain().focus().toggleHeading({ level: 1 }).run()
        }}
        active={editor.isActive("heading", { level: 1 })}
        title="Título 1"
      >
        <Icon icon={IconH1} size={16} color="currentColor" />
      </ToolbarBtn>

      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        title="Título 2"
      >
        <Icon icon={IconH2} size={16} color="currentColor" />
      </ToolbarBtn>

      <div className="w-px h-4 bg-bg-dark mx-1" />

      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        title="Lista"
      >
        <Icon icon={IconList} size={16} color="currentColor" />
      </ToolbarBtn>

      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        title="Lista numerada"
      >
        <Icon icon={IconListNumbers} size={16} color="currentColor" />
      </ToolbarBtn>

      <div className="w-px h-4 bg-bg-dark mx-1" />

      <ToolbarBtn onClick={addLink} title="Enlace">
        <Icon icon={IconLink} size={16} color="currentColor" />
      </ToolbarBtn>

      <ToolbarBtn
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Separador"
      >
        <Icon icon={IconSeparator} size={16} color="currentColor" />
      </ToolbarBtn>

      <div className="w-px h-4 bg-bg-dark mx-1" />

      {/* Botón imagen */}
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={onImageClick}
        disabled={subiendo}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded text-sm
                   text-text-regular hover:bg-bg-dark transition-colors disabled:opacity-50"
        title="Insertar imagen"
      >
        {subiendo
          ? <Icon icon={IconLoader2} size={16} color="currentColor" />
          : <Icon icon={IconPhoto} size={16} color="currentColor" />
        }
        {subiendo ? "Subiendo..." : "Imagen"}
      </button>
    </div>
  )
}

// ─── Carrusel productos ───────────────────────────────────────────────────────

function CarruselProductos({ productos, cargando }) {
  const ref = useRef(null)
  const scroll = (dir) => {
    if (ref.current) ref.current.scrollBy({ left: dir * 220, behavior: "smooth" })
  }

  if (cargando) {
    return (
      <div className="flex gap-4 overflow-hidden px-6">
        {[1,2,3,4].map((i) => <Skeleton key={i} className="h-56 w-48 flex-shrink-0 rounded-xl" />)}
      </div>
    )
  }

  if (!productos.length) {
    return <p className="px-6 text-sm text-text-light">No tienes productos activos aún.</p>
  }

  return (
    <div className="relative">
      <button
        onClick={() => scroll(-1)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-bg-light shadow-md
                   rounded-full p-1 hover:bg-bg-dark transition-colors"
      >
        <Icon icon={IconChevronLeft} size={20} color="var(--color-text-regular)" />
      </button>
      <div ref={ref} className="flex gap-4 overflow-x-auto scrollbar-hide px-8 scroll-smooth">
        {productos.map((p) => (
          <div key={p.id_producto} className="flex-shrink-0 w-48">
            <ProductCard
              nombre={p.nombre}
              precio={Number(p.precio)}
              calificacion={Number(p.calificacion_promedio ?? 0)}
              imagen={p.imagen_url ?? null}
              onAgregar={() => {}}
            />
          </div>
        ))}
      </div>
      <button
        onClick={() => scroll(1)}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-bg-light shadow-md
                   rounded-full p-1 hover:bg-bg-dark transition-colors"
      >
        <Icon icon={IconChevronRight} size={20} color="var(--color-text-regular)" />
      </button>
    </div>
  )
}

function CarruselServicios({ servicios, cargando, colorNegocio }) {
  const ref = useRef(null)
  const scroll = (dir) => {
    if (ref.current) ref.current.scrollBy({ left: dir * 220, behavior: "smooth" })
  }

  if (cargando) {
    return (
      <div className="flex gap-4 overflow-hidden px-6">
        {[1,2,3].map((i) => <Skeleton key={i} className="h-40 w-48 flex-shrink-0 rounded-xl" />)}
      </div>
    )
  }

  if (!servicios.length) return null

  return (
    <div className="relative">
      <button
        onClick={() => scroll(-1)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-bg-light shadow-md
                   rounded-full p-1 hover:bg-bg-dark transition-colors"
      >
        <Icon icon={IconChevronLeft} size={20} color="var(--color-text-regular)" />
      </button>
      <div ref={ref} className="flex gap-4 overflow-x-auto scrollbar-hide px-8 scroll-smooth">
        {servicios.map((s) => (
          <div key={s.id_servicio} className="flex-shrink-0 w-56">
            <ServiceCard
              nombre={s.nombre}
              descripcion={s.descripcion}
              precio={Number(s.precio)}
              calificacion={Number(s.calificacion_promedio ?? 0)}
              categoria={s.nombre_categoria}
              color={colorNegocio}
              onClick={() => {}}
            />
          </div>
        ))}
      </div>
      <button
        onClick={() => scroll(1)}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-bg-light shadow-md
                   rounded-full p-1 hover:bg-bg-dark transition-colors"
      >
        <Icon icon={IconChevronRight} size={20} color="var(--color-text-regular)" />
      </button>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function GestionPagina() {
  const { usuario, cargando: cargandoAuth } = useAuth()
  const {
    cargando, guardando, error,
    nombreNegocio, logoUrl, insignia, verificada,
    etiquetas, rating,
    htmlContenido, productos,
    guardarCambios,
    idEmprendedora, servicios
  } = useGestionPagina()

  const imageInputRef = useRef(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false }),
    ],
    content: htmlContenido,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none outline-none min-h-[200px] px-4 py-3 font-body text-text-regular",
      },
    },
  }, [htmlContenido])

  const handleImageFile = useCallback(async (file) => {
    if (!idEmprendedora || !editor) return
    try {
      const result = await emprendedoraService.subirImagenPagina(file, idEmprendedora)
      if (result.success) {
        editor.chain().focus().setImage({ src: result.url }).run()
      }
    } catch (err) {
      console.error("Error subiendo imagen:", err)
    }
  }, [editor, idEmprendedora])

  if (!cargandoAuth && usuario?.tipo_usuario !== "emprendedora") {
    return <Navigate to="/" replace />
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="flex min-h-[60vh] items-center justify-center">
          <p className="text-error text-sm">{error}</p>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-4 space-y-6 bg-bg">

        <EncabezadoEmprendedora
          logoUrl={logoUrl}
          nombreNegocio={nombreNegocio}
          etiquetas={etiquetas}
          rating={rating}
          insignia={insignia}
          verificada={verificada}
          cargando={cargando}
          accion={
            <Button
              size="sm"
              disabled={guardando || cargando}
              onClick={() => guardarCambios(editor?.getHTML() ?? "")}
              className="mt-8 flex items-center gap-2 w-auto!"
            >
              {guardando ? "Guardando..." : "Guardar cambios"}
            </Button>
}
        />
        {/* Editor */}
        <div className="rounded-xl bg-bg-light shadow-sm overflow-hidden">
          {cargando ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <>
              {/* Input oculto para imagen */}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleImageFile(e.target.files[0])
                  e.target.value = ""
                }}
              />

              <EditorToolbar
                editor={editor}
                onImageClick={() => imageInputRef.current?.click()}
                subiendo={false}
              />

              <EditorContent editor={editor} />
            </>
          )}
        </div>

        {/* Productos */}
        <div className="space-y-3">
          <h2 className="font-heading text-md font-semibold text-text-dark px-6">Productos</h2>
          <hr className="border-bg-dark mx-6" />
          <CarruselProductos productos={productos} cargando={cargando} />
        </div>

        {/* Servicios */}
        {(cargando || servicios.length > 0) && (
          <div className="space-y-3">
            <h2 className="font-heading text-md font-semibold text-text-dark px-6">Servicios</h2>
            <hr className="border-bg-dark mx-6" />
            <CarruselServicios servicios={servicios} cargando={cargando} />
          </div>
        )}
      </main>

      <Footer />
    </>
  )
}