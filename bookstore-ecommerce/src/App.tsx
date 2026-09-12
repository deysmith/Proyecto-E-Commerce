import { HashRouter, Routes, Route } from "react-router-dom"
import HomePage from "./pages/HomePage"
import DetailPage from "./pages/DetailPage"
import { InstantSearch } from "react-instantsearch"
import { searchClient } from "./services/algoliaService"

export default function App() {
  return (
    <HashRouter>
      <InstantSearch
        searchClient={searchClient}
        indexName={import.meta.env.VITE_INDEX_NAME}
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/producto/:id" element={<DetailPage />} />
        </Routes>
      </InstantSearch>
    </HashRouter>
  )
}