import { HashRouter, Routes, Route } from "react-router-dom"
import HomePage from "./pages/HomePage"
import DetailPage from "./pages/DetailPage"

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />}/>
        <Route path="/producto/:id" element={<DetailPage />}/>
      </Routes>
    </HashRouter>
  )
}