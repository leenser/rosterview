import { Link } from "react-router-dom"

function Navbar({ page }) {
  return (
    <div className="w-full border-b border-neutral-800 px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3 text-3xl">
        <span className="font-bold text-white">RosterView</span>
        <span className="text-neutral-300">{page}</span>
      </div>

      <div className="flex gap-4 text-2xl">
        <Link to="/" className="text-neutral-300 hover:text-white">Home</Link>
        <Link to="/league" className="text-neutral-300 hover:text-white">League</Link>
      </div>
    </div>
  )
}

export default Navbar
