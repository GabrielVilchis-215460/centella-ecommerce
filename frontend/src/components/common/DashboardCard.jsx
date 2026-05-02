import { useNavigate } from "react-router-dom"

export function DashboardCard({ label, icon: IconComponent, to }) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(to)}
      className="
        group
        flex flex-col justify-between
        h-36 p-4
        bg-bg-light hover:bg-primary
        rounded-xl shadow-md
        transition-colors duration-(--transition-fast)
        text-left
      "
    >
      {/* icono */}
      <div className="flex justify-end">
        <IconComponent
          size={30}
          stroke={1.75}
          className="text-text-regular group-hover:text-white transition-colors"
        />
      </div>

      {/* Texto */}
      <span className="
        font-body text-md font-regular
        text-text-dark group-hover:text-white
        transition-colors leading-snug
      ">
        {label}
      </span>

    </button>
  )
}