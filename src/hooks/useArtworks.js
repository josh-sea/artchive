import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchArtworksPage } from '../lib/db'

// Paginated artworks for the masonry gallery. `filter` is {profileId} or
// {tag}; changing it resets the list. loadMore is safe to call repeatedly
// from an IntersectionObserver.
export default function useArtworks(filter = {}) {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const stateRef = useRef({ cursor: null, busy: false, generation: 0 })
  const { profileId, tag } = filter

  const loadMore = useCallback(async () => {
    const state = stateRef.current
    if (!user || state.busy) return
    state.busy = true
    const generation = state.generation
    setLoading(true)
    try {
      const page = await fetchArtworksPage(user.uid, { profileId, tag, cursor: state.cursor })
      if (stateRef.current.generation !== generation) return
      state.cursor = page.cursor
      setItems((prev) => [...prev, ...page.items])
      setHasMore(page.hasMore)
    } finally {
      state.busy = false
      if (stateRef.current.generation === generation) setLoading(false)
    }
  }, [user, profileId, tag])

  useEffect(() => {
    stateRef.current = { cursor: null, busy: false, generation: stateRef.current.generation + 1 }
    setItems([])
    setHasMore(true)
    setLoading(true)
    loadMore()
  }, [loadMore])

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const patchItem = useCallback((id, patch) => {
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)))
  }, [])

  return { items, hasMore, loading, loadMore, removeItem, patchItem }
}
