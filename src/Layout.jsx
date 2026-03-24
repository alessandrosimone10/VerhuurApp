// src/Layout.jsx
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { LayoutDashboard, List, Package, FileText, Users, Plus, Settings } from "lucide-react";

const nav = [
  { label: "Dashboard", page: "Dashboard", icon: LayoutDashboard },
  { label: "Verhuringen", page: "Verhuringen", icon: List },
  { label: "Rackets", page: "Rackets", icon: Package },
  { label: "Klanten", page: "Klanten", icon: Users },
  { label: "Facturen", page: "Facturen", icon: FileText },
  { label: "Instellingen", page: "Instellingen", icon: Settings },
];

export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link to={createPageUrl("Dashboard")} className="font-bold text-lg text-gray-900 flex items-center gap-2">
            🎾 <span className="hidden sm:inline">Verhuurbeheer</span>
          </Link>
          <nav className="flex items-center gap-1">
            {nav.map(n => {
              const active = currentPageName === n.page;
              return (
                <Link key={n.page} to={createPageUrl(n.page)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${active ? "bg-green-50 text-green-700" : "text-gray-600 hover:bg-gray-100"}`}>
                  <n.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{n.label}</span>
                </Link>
              );
            })}
            <Link to={createPageUrl("NieuweVerhuur")}
              className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nieuwe Verhuur</span>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}