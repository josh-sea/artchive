import { useState } from 'react'

// Create/edit form for a kid profile: name, photo, birthday, and a free-form
// list of school years (grade label + teacher) for later "3rd grade" lookups.
export default function ProfileForm({ initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name || '')
  const [birthday, setBirthday] = useState(initial?.birthday || '')
  const [schoolYears, setSchoolYears] = useState(initial?.schoolYears || [])
  const [photoFile, setPhotoFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function updateYear(index, field, value) {
    setSchoolYears(schoolYears.map((y, i) => (i === index ? { ...y, [field]: value } : y)))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await onSave(
        {
          name: name.trim(),
          birthday,
          schoolYears: schoolYears.filter((y) => y.grade || y.teacher),
        },
        photoFile
      )
    } catch {
      setError('Couldn’t save. Please try again.')
      setSaving(false)
    }
  }

  return (
    <form className="profile-form card" onSubmit={handleSubmit}>
      <label>
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <label>
        Birthday <span className="hint">(used to show their age and grade on each piece)</span>
        <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
      </label>
      <label>
        Photo
        <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files[0] || null)} />
      </label>
      <fieldset>
        <legend>School years</legend>
        {schoolYears.map((year, i) => (
          <div key={i} className="school-year-row">
            <input
              placeholder="Grade (e.g. 3rd grade)"
              value={year.grade || ''}
              onChange={(e) => updateYear(i, 'grade', e.target.value)}
            />
            <input
              placeholder="Teacher"
              value={year.teacher || ''}
              onChange={(e) => updateYear(i, 'teacher', e.target.value)}
            />
            <button
              type="button"
              className="btn-link"
              onClick={() => setSchoolYears(schoolYears.filter((_, j) => j !== i))}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn-link"
          onClick={() => setSchoolYears([...schoolYears, { grade: '', teacher: '' }])}
        >
          + Add a school year
        </button>
      </fieldset>
      {error && <p className="form-error">{error}</p>}
      <div className="form-actions">
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button className="btn" type="button" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
      </div>
    </form>
  )
}
