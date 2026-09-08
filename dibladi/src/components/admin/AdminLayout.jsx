import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LogOut, LayoutDashboard, Users, ShoppingBag, Truck, Tag, Store, Search } from 'lucide-react'
import useAuth from '../../hooks/useAuth'
import { useState } from 'react'

function SidebarLink({ to, icon: Icon, children }) {
  const location = useLocation()
  const active = location.pathname === to

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
        active ? 'bg-[#B30808] text-white' : 'text-[#D1D1D1] hover:bg-white/10'
      }`}
    >
      <Icon size={18} />
      <span>{children}</span>
    </Link>
  )
}

function AdminLayout({ children }) {
  const { logout, currentUser } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  function handleLogout() {
    logout()
    navigate('/connexion')
  }

  function onSearchSubmit(e) {
    e.preventDefault()
    const q = search.trim()
    if (!q) return

    // client:<id> -> open client detail
    const clientMatch = q.match(/^\s*(?:client:|c:)\s*(\d+)$/i)
    if (clientMatch) {
      const id = clientMatch[1]
      navigate(`/admin/clients/${id}`)
      return
    }

    // If looks like an order number (contains dash or letters), search by orderNumber
    if (/\D/.test(q) && q.includes('-')) {
      navigate(`/admin/commandes?orderNumber=${encodeURIComponent(q)}`)
      return
    }

    // If purely numeric -> treat as orderId
    if (/^\d+$/.test(q)) {
      navigate(`/admin/commandes?orderId=${q}`)
      return
    }

    // Fallback: keep existing vendor search behavior
    navigate(`/admin/vendeurs?search=${encodeURIComponent(q)}`)
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-[240px] bg-[#1A1A1A] text-white flex flex-col justify-between">
        <div>
          <div className="p-4">
            <div className="text-2xl font-extrabold text-[#B30808]" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Dibladi
            </div>
            <div className="text-xs text-[#BFBFBF] mt-1">Administration</div>
          </div>

          <nav className="mt-6 flex flex-col gap-2 px-3">
            <SidebarLink to="/admin/dashboard" icon={LayoutDashboard}>Dashboard</SidebarLink>
            <SidebarLink to="/admin/vendeurs" icon={Users}>Vendeurs</SidebarLink>
            <SidebarLink to="/admin/clients" icon={Users}>Clients</SidebarLink>
            <SidebarLink to="/admin/commandes" icon={ShoppingBag}>Commandes</SidebarLink>
            <SidebarLink to="/admin/livraisons" icon={Truck}>Livraisons</SidebarLink>
            <SidebarLink to="/admin/categories" icon={Tag}>Catégories</SidebarLink>
            <SidebarLink to="/admin/demandes" icon={Store}>Demandes vendeurs</SidebarLink>
          </nav>
        </div>

        <div className="p-4">
          <button onClick={handleLogout} className="flex items-center gap-2 text-[#B30808]">
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      </aside>

      <main className="flex-1 bg-[#F5F5F5] min-h-screen overflow-auto">
        <div className="p-4 border-b border-gray-200 bg-white">
          <form onSubmit={onSearchSubmit} className="max-w-md">
            <label className="relative block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un vendeur par ID..."
                className="w-full pl-9 pr-3 py-2 rounded border border-[#E0E0E0]"
              />
            </label>
          </form>
        </div>

        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}

export default AdminLayout
