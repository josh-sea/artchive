import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { normalizeTag, watchUserTags } from '../lib/db'

// Chip-style tag editor. Suggests the family's existing tags ("3rd grade",
// "halloween") so the same tag gets reused instead of retyped.
export default function TagInput({ tags, onChange }) {
  const { user } = useAuth()
  const [draft, setDraft] = useState('')
  const [suggestions, setSuggestions] = useState([])

  useEffect(() => {
    if (!user) return
    return watchUserTags(user.uid, setSuggestions)
  }, [user])

  function addTag(raw) {
    const tag = normalizeTag(raw)
    if (tag && !tags.includes(tag)) onChange([...tags, tag])
    setDraft('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(draft)
    } else if (e.key === 'Backspace' && !draft && tags.length) {
      onChange(tags.slice(0, -1))
    }
  }

  return (
    <div className="tag-input">
      <div className="tag-chips">
        {tags.map((tag) => (
          <span key={tag} className="chip">
            {tag}
            <button type="button" onClick={() => onChange(tags.filter((t) => t !== tag))}>
              ×
            </button>
          </span>
        ))}
        <input
          list="tag-suggestions"
          value={draft}
          placeholder={tags.length ? '' : 'e.g. 3rd grade, halloween'}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => draft && addTag(draft)}
        />
        <datalist id="tag-suggestions">
          {suggestions
            .filter((t) => !tags.includes(t))
            .map((t) => (
              <option key={t} value={t} />
            ))}
        </datalist>
      </div>
    </div>
  )
}
