import LeagueOverviewSection from "../components/league/LeagueOverviewSection";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer"

export default function League() {
  return (
    <div className="min-h-screen bg-neutral-950">
      <NavBar page="League" />
      <LeagueOverviewSection />
      <Footer />
    </div>
  )
}
