import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { deleteArtwork, updateArtwork } from '../lib/db'
import { ageAt, formatDate, fromDateInputValue, gradeAt, toDateInputValue } from '../lib/dates'
import Avatar from './Avatar'
import TagInput from './TagInput'

export default function Lightbox({
  artwork,
  profiles,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onClose,
  onDeleted,
  onUpdated,
}) {
  const { user } = useAuth()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState(null)

  const workDate = artwork.dateOfWork?.toDate ? artwork.dateOfWork.toDate() : null
  const taggedProfiles = profiles.filter((p) => (artwork.profileIds || []).includes(p.id))

  useEffect(() => {
    function onKey(e) {
      if (editing) return
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && hasPrev) onPrev()
      if (e.key === 'ArrowRight' && hasNext) onNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [editing, hasPrev, hasNext, onPrev, onNext, onClose])

  function startEditing() {
    setDraft({
      date: toDateInputValue(workDate || new Date()),
      profileIds: artwork.profileIds || [],
      tags: artwork.tags || [],
      note: artwork.note || '',
    })
    setEditing(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const patch = await updateArtwork(user.uid, artwork.id, {
        profileIds: draft.profileIds,
        tags: draft.tags,
        note: draft.note,
        dateOfWork: fromDateInputValue(draft.date) || new Date(),
      })
      onUpdated(artwork.id, patch)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this artwork? This can’t be undone.')) return
    await deleteArtwork(user.uid, artwork)
    onDeleted(artwork.id)
  }

  return (
    <div className="lightbox-backdrop" onClick={onClose}>
      <div className="lightbox" onClick={(e) => e.stopPropagation()}>
        <button className="lightbox-close" onClick={onClose} aria-label="Close">×</button>
        {hasPrev && (
          <button className="lightbox-nav lightbox-prev" onClick={onPrev} aria-label="Previous">‹</button>
        )}
        {hasNext && (
          <button className="lightbox-nav lightbox-next" onClick={onNext} aria-label="Next">›</button>
        )}
        <div className="lightbox-image">
          <img src={artwork.imageURL} alt={artwork.note || 'artwork'} />
        </div>
        <aside className="lightbox-details">
          {!editing ? (
            <>
              {taggedProfiles.map((p) => {
                const age = ageAt(p.birthday, workDate)
                const grade = gradeAt(p.birthday, workDate)
                return (
                  <div key={p.id} className="lightbox-kid">
                    <Avatar profile={p} size={40} />
                    <div>
                      <Link to={`/kid/${p.id}`} className="lightbox-kid-name" onClick={onClose}>
                        {p.name}
                      </Link>
                      <div className="lightbox-kid-meta">
                        {age != null && `age ${age}`}
                        {age != null && grade && ' · '}
                        {grade}
                      </div>
                    </div>
                  </div>
                )
              })}
              {workDate && <p className="lightbox-date">{formatDate(workDate)}</p>}
              {artwork.note && <p className="lightbox-note">{artwork.note}</p>}
              {(artwork.tags || []).length > 0 && (
                <div className="tag-chips">
                  {artwork.tags.map((tag) => (
                    <Link key={tag} to={`/explore/${encodeURIComponent(tag)}`} className="chip chip-link" onClick={onClose}>
                      {tag}
                    </Link>
                  ))}
                </div>
              )}
              {taggedProfiles.map((p) => {
                const grade = gradeAt(p.birthday, workDate)
                if (!grade) return null
                return (
                  <Link
                    key={p.id}
                    to={`/explore/${encodeURIComponent(grade)}`}
                    className="btn btn-explore"
                    onClick={onClose}
                  >
                    Explore {grade} →
                  </Link>
                )
              })}
              <div className="lightbox-actions">
                <a className="btn" href={artwork.imageURL} target="_blank" rel="noreferrer">
                  Download
                </a>
                <button className="btn" onClick={startEditing}>Edit</button>
                <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
              </div>
            </>
          ) : (
            <div className="lightbox-edit">
              <label>
                Date it came home
                <input
                  type="date"
                  value={draft.date}
                  onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                />
              </label>
              <fieldset>
                <legend>Whose art?</legend>
                {profiles.map((p) => (
                  <label key={p.id} className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={draft.profileIds.includes(p.id)}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          profileIds: e.target.checked
                            ? [...draft.profileIds, p.id]
                            : draft.profileIds.filter((id) => id !== p.id),
                        })
                      }
                    />
                    {p.name}
                  </label>
                ))}
              </fieldset>
              <label>
                Tags
                <TagInput tags={draft.tags} onChange={(tags) => setDraft({ ...draft, tags })} />
              </label>
              <label>
                Note
                <textarea
                  rows={2}
                  value={draft.note}
                  onChange={(e) => setDraft({ ...draft, note: e.target.value })}
                />
              </label>
              <div className="lightbox-actions">
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button className="btn" onClick={() => setEditing(false)} disabled={saving}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
