import { useEffect, useState } from 'react'

export function useMediaQuery(query) {
  const getMatches = () =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false

  const [matches, setMatches] = useState(getMatches)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    const onChange = (event) => setMatches(event.matches)

    setMatches(mediaQuery.matches)
    mediaQuery.addEventListener('change', onChange)

    return () => mediaQuery.removeEventListener('change', onChange)
  }, [query])

  return matches
}
