import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Team from "./pages/Team"
import League from "./pages/League"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/team/:slug" element={<Team />} />
      <Route path="/league" element={<League />} />
    </Routes>
  )
}

export default App