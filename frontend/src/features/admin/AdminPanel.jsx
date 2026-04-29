import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { adminService } from "../../services/adminService";
import { Header } from "../../components/layout/Header.jsx";
import { Footer } from "../../components/layout/Footer.jsx";
import { DashboardCard } from "../../components/common/DashboardCard.jsx";
import { Icon } from "../../components/common/Icon.jsx";
import {
  IconCreditCard,
  IconUsers,
  IconUser,
  IconAward,
  IconShield,
  IconChevronDown,
} from "@tabler/icons-react";
import LogoFullBlack from "../../assets/Logo_full_black.png";

// ─── Hook ─────────────────────────────────────────────────────────────────────
function useDashboard() {
  const { esAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!esAdmin()) return;
    let cancelled = false;

    adminService
      .getDashboard()
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch((e) => {
        if (!cancelled)
          setError(e.response?.data?.detail ?? "Error al cargar el dashboard");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatMoney = (n) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(
    n ?? 0,
  );

const formatNum = (n) => new Intl.NumberFormat("es-MX").format(n ?? 0);

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ iconComponent, value, label, iconBg, iconColor }) {
  return (
    <div className="flex items-center gap-4 bg-bg-light rounded-xl shadow-sm px-4 py-3">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: iconBg }}
      >
        <Icon icon={iconComponent} size={22} stroke={1.6} color={iconColor} />
      </div>
      <div>
        <p className="text-md font-semibold text-text-dark font-body leading-tight">
          {value}
        </p>
        <p className="text-sm text-text-regular font-body mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─── RankList ─────────────────────────────────────────────────────────────────
function RankList({ items, renderValue, emptyText }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, 5);
  const rankColors = ["bg-primary", "bg-primary/80", "bg-primary/60"];

  if (!items.length)
    return (
      <p className="text-sm text-text-light font-body py-3">{emptyText}</p>
    );

  return (
    <div>
      {visible.map((item, i) => (
        <div
          key={item.id_emprendedora ?? item.id_producto}
          className="flex items-center gap-3 py-2 border-b border-bg last:border-0"
        >
          <span
            className={`w-6 h-6 rounded-full text-sm font-semibold font-body flex items-center justify-center shrink-0
  ${
    i === 0
      ? "bg-primary text-white"
      : i === 1
        ? "bg-primary/80 text-white"
        : i === 2
          ? "bg-primary/60 text-white"
          : "bg-bg text-text-light"
  }`}
          >
            {i + 1}
          </span>
          <span className="flex-1 text-sm font-body text-text-dark truncate">
            {item.nombre}
          </span>
          <span className="text-sm font-body text-text-regular whitespace-nowrap">
            {renderValue(item)}
          </span>
        </div>
      ))}

      {items.length > 5 && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex items-center justify-center w-full mt-2 text-text-light hover:text-text-regular transition-colors"
        >
          <IconChevronDown
            size={16}
            className={`transition-transform duration-fast ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      )}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function AdminPanel() {
  const { data, loading, error } = useDashboard();

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center py-20 text-sm font-body text-text-light">
          Cargando dashboard...
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="bg-bg-light border border-states-red rounded-xl px-5 py-4 text-sm font-body text-error">
            ⚠ {error}
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const { summary, top_emprendedoras, top_productos } = data;

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {/* Encabezado */}
        <div className="mb-8 flex items-baseline gap-3">
          <img src={LogoFullBlack} alt="Centella" className="h-10 w-auto" />
          <span className="text-text-light font-light text-xl">·</span>
          <h1 className="text-xl font-heading font-regular text-text-dark">
            Administración
          </h1>
        </div>

        {/* ── Desempeño ── */}
        <h2 className="text-md font-heading font-regular text-text-dark pb-2 border-b border-text-dark mb-5">
          Desempeño de la plataforma
        </h2>

        <div className="grid grid-cols-3 gap-5 mb-10">
          {/* Estado general */}
          <div className="flex flex-col gap-3">
            <p className="text-sm font-body font-regular text-text-regular">
              Estado general
            </p>
            <div className="flex flex-col gap-3">
              <StatCard
                iconComponent={IconCreditCard}
                value={formatMoney(summary.ingresos_totales)}
                label="Ingresos totales"
                iconBg="var(--color-aux)"
                iconColor="white"
              />
              <StatCard
                iconComponent={IconUser}
                value={formatNum(summary.emprendedoras_activas)}
                label="Emprendedoras activas"
                iconBg="var(--color-primary)"
                iconColor="white"
              />
              <StatCard
                iconComponent={IconUsers}
                value={formatNum(summary.clientes_activos)}
                label="Clientes activos"
                iconBg="var(--color-secondary)"
                iconColor="white"
              />
            </div>
          </div>

          {/* Top emprendedoras */}
          <div className="flex flex-col gap-3">
            <p className="text-sm font-body font-regular text-text-regular">
              Top emprendedoras
            </p>
            <div className="bg-bg-light rounded-xl shadow-sm p-5 flex-1">
              <RankList
                items={top_emprendedoras}
                renderValue={(item) => `${formatMoney(item.ingresos)} ingresos`}
                emptyText="Sin datos aún"
              />
            </div>
          </div>

          {/* Top productos */}
          <div className="flex flex-col gap-3">
            <p className="text-sm font-body font-regular text-text-regular">
              Top productos
            </p>
            <div className="bg-bg-light rounded-xl shadow-sm p-5 flex-1">
              <RankList
                items={top_productos}
                renderValue={(item) => `${formatNum(item.ventas)} ventas`}
                emptyText="Sin datos aún"
              />
            </div>
          </div>
        </div>

        {/* ── Acciones ── */}
        <h2 className="text-md font-heading font-regular text-text-dark pb-2 border-b border-text-dark mb-5">
          Acciones
        </h2>

        <div className="grid grid-cols-3 gap-4">
          <DashboardCard
            icon={IconUsers}
            label="Gestión de emprendedoras"
            to="/admin/emprendedoras"
          />
          <DashboardCard
            icon={IconAward}
            label="Gestión de insignias"
            to="/admin/insignias"
          />
          <DashboardCard
            icon={IconShield}
            label="Moderación de la plataforma"
            to="/admin/moderacion"
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
