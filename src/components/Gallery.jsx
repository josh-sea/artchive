import { useEffect, useRef, useState } from 'react'
import useArtworks from '../hooks/useArtworks'
import Lightbox from './Lightbox'

// Pinterest-style masonry board (CSS columns) with infinite scroll and a
// lightbox. `filter` is {} for everything, {profileId} or {tag} for a
// filtered board.
export default function Gallery({ filter = {}, profiles = [], emptyMessage }) {
  const { items, hasMore, loading, loadMore, removeItem, patchItem } = useArtworks(filter)
  const [openIndex, setOpenIndex] = useState(null)
  const sentinelRef = useRef(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMore) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { rootMargin: '800px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, loadMore])

  if (!loading && items.length === 0) {
    return <div className="gallery-empty">{emptyMessage || 'No artwork here yet.'}</div>
  }

  return (
    <>
      <div className="masonry">
        {items.map((art, i) => (
          <button key={art.id} className="masonry-tile" onClick={() => setOpenIndex(i)}>
            <img src={art.thumbURL || art.imageURL} alt={art.note || 'artwork'} loading="lazy" />
          </button>
        ))}
      </div>
      {loading && <div className="gallery-loading">Loading…</div>}
      <div ref={sentinelRef} />
      {openIndex != null && items[openIndex] && (
        <Lightbox
          artwork={items[openIndex]}
          profiles={profiles}
          hasPrev={openIndex > 0}
          hasNext={openIndex < items.length - 1}
          onPrev={() => setOpenIndex(openIndex - 1)}
          onNext={() => setOpenIndex(openIndex + 1)}
          onClose={() => setOpenIndex(null)}
          onDeleted={(id) => {
            removeItem(id)
            setOpenIndex(null)
          }}
          onUpdated={patchItem}
        />
      )}
    </>
  )
}
