'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Briefcase, 
  GraduationCap, 
  Building2, 
  FileText, 
  LogOut,
  Users,
  Inbox,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/lib/theme-context';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/internships', label: 'Prácticas', icon: Briefcase },
  { href: '/dashboard/thesis', label: 'Tesis', icon: GraduationCap },
  { href: '/dashboard/users', label: 'Usuarios', icon: Users },
  { href: '/dashboard/requests', label: 'Solicitudes', icon: Inbox },
  { href: '/dashboard/companies', label: 'Empresas', icon: Building2 },
  { href: '/dashboard/reports', label: 'Reportes', icon: FileText },
];

interface SidebarProps {
  user: {
    nombre_completo?: string;
    correo?: string;
    rol?: string;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) setCollapsed(saved === 'true');
  }, []);

  const handleCollapse = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', String(newState));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const getInitials = () => {
    if (user.nombre_completo) return user.nombre_completo.charAt(0).toUpperCase();
    return 'A';
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Botón hamburguesa - móvil */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-primary text-primary-foreground p-2 rounded-lg shadow-lg"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay móvil */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={closeMobile} />
      )}

      {/* Sidebar */}
      <div className={cn(
        "hidden lg:flex lg:relative z-30 h-screen bg-card border-r flex-col transition-all duration-300",
        collapsed ? "w-20" : "w-64",
        "fixed top-0 left-0 z-50 h-screen transition-transform duration-300",
        mobileOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0"
      )}>
        
        {/* Header */}
        <div className={cn(
          "p-4 border-b",
          collapsed ? "px-2" : ""
        )}>
          <div className={cn(
            "flex items-center",
            collapsed ? "justify-center" : "justify-between"
          )}>
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold text-primary">UNT Sistema</h1>
                <p className="text-xs text-muted-foreground">Gestión Académica</p>
              </div>
            )}
            {collapsed && (
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">U</span>
              </div>
            )}
            <button
              onClick={handleCollapse}
              className="hidden lg:flex items-center justify-center w-6 h-6 rounded-md hover:bg-accent transition-colors"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
            {mobileOpen && (
              <button onClick={closeMobile} className="lg:hidden">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Menú */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobile}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-foreground hover:bg-accent',
                  collapsed && "justify-center"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                {!collapsed && <span className="text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Botón tema y perfil */}
        <div className={cn(
          "p-3 border-t space-y-2",
          collapsed ? "px-2" : ""
        )}>

          {/* Perfil */}
          <div className={cn(
            "flex items-center gap-3 pt-2",
            collapsed ? "justify-center" : ""
          )}>
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold shrink-0">
              {getInitials()}
            </div>
            {!collapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{user.nombre_completo || 'Usuario'}</p>
                <p className="text-xs text-muted-foreground truncate">{user.correo || 'No disponible'}</p>
              </div>
            )}
          </div>

          {/* Cerrar sesión */}
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg w-full transition-colors",
              collapsed && "justify-center"
            )}
            title={collapsed ? "Cerrar Sesión" : undefined}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="text-sm">Cerrar Sesión</span>}
          </button>
        </div>
      </div>
    </>
  );
}