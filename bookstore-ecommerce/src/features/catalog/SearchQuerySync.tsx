import { useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { useSearchBox } from "react-instantsearch"

//Sincroniza el ?q= de la URL del Header con el estado real de búsqueda de Algolia
export function SearchQuerySync() {
  const { refine } = useSearchBox()
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const query = searchParams.get("q")

    if (query) {
      refine(query)
      searchParams.delete("q")
      setSearchParams(searchParams, { replace: true })
    }
  }, [])

  return null
}