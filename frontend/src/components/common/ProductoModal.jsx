import { useState } from "react"
import { IconCirclePlus, IconTrash, IconPhoto, IconChevronUp, IconChevronDown, IconPencil } from "@tabler/icons-react"
import { Modal } from "./Modal"
import { Select } from "./Select"
import { Checkbox } from "./Checkbox"
import { Switch } from "./Switch"
import { NumberInput } from "./NumberInput"
import { AtributoModal } from "./AtributoModal"

// tiene como prop ahora las categorias
export function ProductoModal({ onClose, onGuardar, producto = null, categorias = [] }) {
  const modo = producto ? "editar" : "agregar"

  const [nombre,      setNombre]      = useState(producto?.nombre      || "")
  const [descripcion, setDescripcion] = useState(producto?.descripcion || "")
  const [precio,      setPrecio]      = useState(producto?.precio      || 0)
  const [categoria,   setCategoria]   = useState(producto?.categoria   || "")
  const [stock,       setStock]       = useState(producto?.stock       || 0)
  const [paquete,     setPaquete]     = useState(producto?.paquete     ?? true)
  const [puntoMedio,  setPuntoMedio]  = useState(producto?.puntoMedio  ?? false)
  const [activo,      setActivo]      = useState(producto?.activo      ?? true)
  const [imagenes,    setImagenes]    = useState(producto?.imagenes    || [])
  const [atributos,   setAtributos]   = useState(producto?.atributos   || [])
  const [atributoModal, setAtributoModal] = useState(null) // null | "nuevo" | { index, data }
  const [atributosEliminados, setAtributosEliminados] = useState([])
  const [imagenesEliminadas, setImagenesEliminadas]   = useState([])

  const MAX_IMAGENES = 5

  // imagenes
  const handleAgregarImagen = (e) => {
    const files = Array.from(e.target.files)
    const nuevas = files
      .slice(0, MAX_IMAGENES - imagenes.length)
      .map((f) => ({ file: f, url: URL.createObjectURL(f) }))
    setImagenes((prev) => [...prev, ...nuevas])
  }

  const handleEliminarImagen = (i) => {
    const img = imagenes[i]
    if (img.id_imagen) {
      setImagenesEliminadas((prev) => [...prev, img.id_imagen])
    }
    setImagenes((prev) => prev.filter((_, idx) => idx !== i))
  }

  const moverImagen = (i, dir) => {
    const nuevo = [...imagenes]
    const destino = i + dir
    if (destino < 0 || destino >= nuevo.length) return
    ;[nuevo[i], nuevo[destino]] = [nuevo[destino], nuevo[i]]
    setImagenes(nuevo)
  }

  // atributos
  const handleGuardarAtributo = (data) => {
    const atributoFormateado = {
      id_atributo: data.id_atributo,
      tipo: data.tipo,
      valor: data.valor
    }

    if (atributoModal === "nuevo") {
      setAtributos((prev) => [...prev, atributoFormateado])
    } else {
      setAtributos((prev) =>
        prev.map((a, i) => i === atributoModal.index ? atributoFormateado : a)
      )
    }
    setAtributoModal(null)
  }

  const handleEliminarAtributo = (i) => {
    const atr = atributos[i]
    if (atr.id_atributo) {
      setAtributosEliminados((prev) => [...prev, atr.id_atributo])
    }
    setAtributos((prev) => prev.filter((_, idx) => idx !== i))
  }

  const handleGuardar = () => {
    // debug
    //console.log("Valor de categoría en estado:", categoria);
    if (!nombre.trim() || !precio || !categoria || categoria === "") {
      alert("Por favor selecciona una categoría válida");
      return;
    }

    if (!nombre.trim() || !precio || !categoria || categoria === "") {
      alert("Por favor completa los campos obligatorios y selecciona una categoría válida");
      return;
    }

    if (!paquete && !puntoMedio) {
      alert("Por favor selecciona al menos un tipo de entrega (Paquete o Punto medio).");
      return;
    }
    /*const datosParaEnviar = {
      nombre: nombre,
      descripcion: descripcion,
      precio: Number(precio),
      id_categoria: idCat, // Enviamos el entero validado[cite: 3]
      cantidad_stock: Number(stock),
      activo: Boolean(activo),
      tipo_entrega: paquete && puntoMedio ? "ambas" : paquete ? "envio" : "fisica"
    };*/
    const datosParaEnviar = {
      nombre: nombre,
      descripcion: descripcion,
      precio: precio,
      categoria: categoria,
      stock: stock,
      paquete: paquete,    
      puntoMedio: puntoMedio, 
      activo: activo,
      imagenes: imagenes,   
      atributos: atributos,
      atributosEliminados: atributosEliminados, 
      imagenesEliminadas: imagenesEliminadas  
    };

    onGuardar(datosParaEnviar);
    onClose();
  };
  
  const formularioValido = nombre.trim() && precio > 0 && categoria && (paquete || puntoMedio);

  return (
    <>
      <Modal
        titulo={modo === "agregar" ? "Crear producto" : "Editar producto"}
        onClose={onClose}
        size="lg"
      >
        <div className="grid grid-cols-2 gap-8">

          {/* col izquierda*/}
          <div className="flex flex-col gap-5">

            {/* Nombre */}
            <div className="flex flex-col gap-1">
              <label className="font-body text-sm text-text-regular">Nombre del producto</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-4 py-3 font-body text-sm text-text-regular bg-transparent border border-text-light rounded-md placeholder:text-text-light focus:outline-none focus:border-text-regular"
              />
            </div>

            {/* Descripción */}
            <div className="flex flex-col gap-1">
              <label className="font-body text-sm text-text-regular">Descripción del producto</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 font-body text-sm text-text-regular bg-transparent border border-text-light rounded-md placeholder:text-text-light focus:outline-none focus:border-text-regular resize-none"
              />
            </div>

            {/* Precio y Categoría */}
            <div className="grid grid-cols-2 gap-4">
              <NumberInput
                label="Precio"
                value={precio}
                onChange={setPrecio}
                min={0}
                prefix="$"
              />
              {/* ya no tiene el categorias mock */}
              <Select
                label="Categoría"
                labelClassName="text-sm"
                placeholder="Categorias"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                options={categorias.map((c) => ({ value: String(c.id_categoria), label: c.nombre }))}
                className="text-sm py-0"
              />
            </div>

            {/* Stock, Tipo entrega, Activo */}
            <div className="flex items-end gap-6">
              <NumberInput
                label="Cantidad en stock"
                value={stock}
                onChange={setStock}
                min={0}
                className="w-28"
              />
              <div className="flex flex-col gap-2">
                <label className="font-body text-sm text-text-regular">Tipo de entrega</label>
                <Checkbox label="Paquete"     checked={paquete}    onChange={setPaquete}    />
                <Checkbox label="Punto medio" checked={puntoMedio} onChange={setPuntoMedio} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-body text-sm text-text-regular">Producto activo</label>
                <Switch checked={activo} onChange={setActivo} />
              </div>
            </div>

          </div>

          {/* col derecha */}
          <div className="flex flex-col gap-5">

            {/* Imágenes */}
            <div className="flex flex-col gap-2">
              <label className="font-body text-sm text-text-regular">Imágenes</label>

              {/* Lista de imágenes */}
              <div className="flex flex-col gap-2 max-h-52 overflow-y-auto">
                {imagenes.map((img, i) => (
                  <div key={img.id_imagen ? `img-bd-${img.id_imagen}` : `img-local-${img.url}`} className="flex items-center gap-2 border border-text-light rounded-md p-2">
                    <img src={img.url} alt="" className="w-10 h-10 object-cover rounded-md shrink-0" />
                    <span className="font-body text-sm text-text-light truncate flex-1">
                      {img.file?.name || "imagen.jpg"}
                    </span>
                    <div className="flex flex-col shrink-0">
                      <button onClick={() => moverImagen(i, -1)} disabled={i === 0} className="disabled:opacity-30 hover:text-text-dark text-text-light transition-colors">
                        <IconChevronUp size={14} stroke={1.5} />
                      </button>
                      <button onClick={() => moverImagen(i, 1)} disabled={i === imagenes.length - 1} className="disabled:opacity-30 hover:text-text-dark text-text-light transition-colors">
                        <IconChevronDown size={14} stroke={1.5} />
                      </button>
                    </div>
                    <button onClick={() => handleEliminarImagen(i)} className="text-text-light hover:text-error transition-colors shrink-0">
                      <IconTrash size={16} stroke={1.5} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Botón agregar imagen */}
              {imagenes.length < MAX_IMAGENES && (
                <label className="flex items-center justify-center gap-2 w-full py-2 font-body text-sm text-text-light hover:text-text-regular border border-dashed border-text-light hover:border-text-regular rounded-md transition-colors cursor-pointer">
                  <IconPhoto size={16} stroke={1.5} />
                  Agregar ({imagenes.length}/{MAX_IMAGENES})
                  <input type="file" accept="image/*" multiple onChange={handleAgregarImagen} className="hidden" />
                </label>
              )}
            </div>

            {/* Atributos */}
            <div className="flex flex-col gap-2">
              <label className="font-body text-sm text-text-regular">Atributos</label>

              {/* Lista de atributos */}
              <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
                {atributos.map((atr, i) => (
                  <div key={i} className="flex items-start justify-between border border-text-light rounded-md px-3 py-2">
                    <div className="flex flex-col">
                      {/* Cambiamos 'atr.nombre' por 'atr.tipo' y quitamos el .join() usando 'atr.valor' */}
                      <span className="font-body text-sm text-text-dark font-medium">{atr.tipo}</span>
                      <span className="font-body text-xs text-text-light">{atr.valor}</span>  
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => setAtributoModal({ index: i, data: atr })}
                        className="text-text-light hover:text-text-dark transition-colors"
                      >
                        <IconPencil size={16} stroke={1.5} />
                      </button>
                      <button
                        onClick={() => handleEliminarAtributo(i)}
                        className="text-text-light hover:text-error transition-colors"
                      >
                        <IconTrash size={16} stroke={1.5} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Botón agregar atributo */}
              <button
                onClick={() => setAtributoModal("nuevo")}
                className="flex items-center justify-center gap-2 w-full py-2 font-body text-sm text-text-light hover:text-text-regular border border-dashed border-text-light hover:border-text-regular rounded-md transition-colors"
              >
                <IconCirclePlus size={16} stroke={1.5} />
                Agregar
              </button>
            </div>

          </div>
        </div>

        {/* Botón guardar */}
        <div className="flex justify-end mt-6">
          <button
            onClick={handleGuardar}
            disabled={!formularioValido}
            className="px-10 py-3 bg-primary text-white font-body text-base rounded-full hover:bg-aux transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {modo === "agregar" ? "Crear producto" : "Guardar cambios"}
          </button>
        </div>

      </Modal>

      {/* AtributoModal anidado */}
      {atributoModal && (
        <AtributoModal
          onClose={() => setAtributoModal(null)}
          onGuardar={handleGuardarAtributo}
          atributo={atributoModal === "nuevo" ? null : atributoModal.data}
        />
      )}
    </>
  )
}