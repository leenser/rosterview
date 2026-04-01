import { Link, useLocation } from "react-router-dom"

function NavBar({ page }) {
  const location = useLocation()

  const links = [
    { label: "Home", to: "/" },
    { label: "League", to: "/league" },
  ]

  return (
    <nav className="w-full border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md px-8 py-0 flex items-center justify-between sticky top-0 z-50">
      
      {/* Logo */}
      <Link to="/" className="flex items-center py-4">
        <span className="text-white font-bold text-2xl tracking-tight">MLS </span>
        <span className="text-blue-400 font-bold text-2xl tracking-tight"> RosterView</span>
      </Link>

      {/* Nav Links */}
      <div className="flex items-center h-full">
        {links.map(({ label, to }) => {
          const isActive =
            to === "/" ? location.pathname === "/" : location.pathname.startsWith(to)

          return (
            <Link
              key={label}
              to={to}
              className={`relative flex items-center px-4 py-5 text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? "text-white"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              {label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default NavBar