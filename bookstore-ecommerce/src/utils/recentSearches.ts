const STORAGE_KEY = "booksmart_recent_searches"
const MAX_RECENT_SEARCHES = 5

export function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function addRecentSearch(term: string) {
  const trimmed = term.trim()
  if (!trimmed) return

  const withoutDuplicates = getRecentSearches().filter(
    (item) => item.toLowerCase() !== trimmed.toLowerCase()
  )

  const updated = [trimmed, ...withoutDuplicates].slice(0, MAX_RECENT_SEARCHES)

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}