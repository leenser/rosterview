import { Link } from "react-router-dom"

function TeamCard({ name,slug}) {
  return (
    <Link to={`/team/${slug}`}>
        <div className="bg-neutral-800 hover:bg-indigo-800 flex min-h-full flex-col justify-center px-6 py-8 lg:px-8 items-center gap-3">
        <div className="w-16 h-16 flex-shrink-0">
            <img 
                src={`/logos/${slug}.png`}
                alt={name}
                className="w-full h-full object-contain"
            />
        </div>

        <p className="text-2l text-neutral-300 text-center">
            {name}
        </p>
        </div>
    </Link>
  )
}

export default TeamCard