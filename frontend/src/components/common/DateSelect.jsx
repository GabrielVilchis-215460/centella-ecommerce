import { Select } from "./Select"

const DIAS = Array.from({ length: 31 }, (_, i) => ({
  value: String(i + 1).padStart(2, "0"),
  label: String(i + 1).padStart(2, "0"),
}))

const MESES = [
  { value: "01", label: "Enero" },
  { value: "02", label: "Febrero" },
  { value: "03", label: "Marzo" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Mayo" },
  { value: "06", label: "Junio" },
  { value: "07", label: "Julio" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
]

const currentYear = new Date().getFullYear()
const AÑOS = Array.from({ length: 100 }, (_, i) => ({
  value: String(currentYear - i),
  label: String(currentYear - i),
}))

export function DateSelect({ label, value = {}, onChange, error, variant = "default", labelClassName = "" }) {

  const handleChange = (field, fieldValue) => {
    onChange({ ...value, [field]: fieldValue })
  }

  return (
    <div className="flex flex-col gap-1 w-full">

      {label && (
        <label className={`font-body text-base ${
          variant === "light" ? "text-white" : "text-text-regular"
        } ${labelClassName}`}>
          {label}
        </label>
      )}

      <div className="flex gap-3">
        <Select
          placeholder="DD"
          value={value.dia || ""}
          onChange={(e) => handleChange("dia", e.target.value)}
          options={DIAS}
          variant={variant}
        />
        <Select
          placeholder="MM"
          value={value.mes || ""}
          onChange={(e) => handleChange("mes", e.target.value)}
          options={MESES}
          variant={variant}
        />
        <Select
          placeholder="YYYY"
          value={value.año || ""}
          onChange={(e) => handleChange("año", e.target.value)}
          options={AÑOS}
          variant={variant}
        />
      </div>

      {error && (
        <span className="font-body text-sm text-error">
          {error}
        </span>
      )}

    </div>
  )
}