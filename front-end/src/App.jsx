import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Team from "./pages/Team"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/team/:slug" element={<Team />} />
    </Routes>
  )
}

export default App