function Footer() {
  return (
    <footer className="mt-16 border-t border-neutral-800 bg-neutral-950 px-8 py-8 text-sm text-neutral-400">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Disclaimer */}
        <div>
          <p className="text-neutral-300 font-semibold mb-1">Disclaimer</p>
          <p>
            All figures shown are estimates and approximations. This site is not affiliated with MLS and should not be used for official purposes.
          </p>
        </div>

        {/* Limitations */}
        <div>
          <p className="text-neutral-300 font-semibold mb-1">Limitations</p>
          <p>
            Transfer fee calculations do not include add-ons, bonuses, or sell-on clauses. Salary cap modeling is simplified and may not reflect all league mechanisms.
          </p>
        </div>

        {/* Data Sources */}
        <div>
          <p className="text-neutral-300 font-semibold mb-1">Data Sources</p>
          <p>
            Salary data from MLSPA. Player roles and roster designations from MLS club roster profiles. Transfer values from Transfermarkt.
          </p>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 pt-2">
          <a
            href="https://twitter.com/dynastats"
            target="_blank"
            className="hover:text-white transition"
          >
            X (Twitter)
          </a>
          <a
            href="https://bsky.app/profile/dynastats.bsky.social"
            target="_blank"
            className="hover:text-white transition"
          >
            Bluesky
          </a>

          <a
            href="mailto:dynastatsx@gmail.com"
            className="hover:text-white transition"
          >
            Email
          </a>
        </div>

      </div>
    </footer>
  )
}

export default Footer