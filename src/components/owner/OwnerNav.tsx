"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconChartBar,
  IconCreditCard,
  IconLogout,
  IconPackage,
  IconShoppingCart,
  IconUsers,
} from "@tabler/icons-react";

const navItems = [
  { href: "/dono", label: "Dashboard", icon: IconChartBar },
  { href: "/dono/clientes", label: "Clientes", icon: IconUsers },
  { href: "/dono/pedidos", label: "Pedidos", icon: IconShoppingCart },
  { href: "/dono/pagamentos", label: "Pagamentos", icon: IconCreditCard },
  { href: "/dono/usuarios", label: "Produtos", icon: IconPackage },
];

export default function OwnerNav() {
  const pathname = usePathname();

  return (
    <aside className="owner-sidebar">
      <div className="owner-brand">
        <p className="owner-brand-title">ALTAS HORAS</p>
        <p className="owner-brand-subtitle">Painel de Gestao</p>
      </div>

      <div className="owner-user-card">
        <div className="owner-user-avatar">A</div>
        <div>
          <p className="owner-user-name">Administrador</p>
          <p className="owner-user-role">acesso dono</p>
        </div>
      </div>

      <nav className="owner-nav-list">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dono" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`owner-nav-item ${isActive ? "is-active" : ""}`}
            >
              <Icon size={18} stroke={2.1} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <button className="owner-logout-btn" type="button">
        <IconLogout size={16} stroke={2.1} />
        <span>Sair</span>
      </button>
    </aside>
  );
}
