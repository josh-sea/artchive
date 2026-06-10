import { useState } from 'react'
import { Link } from 'react-router-dom'
import Avatar from '../components/Avatar'
import ProfileForm from '../components/ProfileForm'
import useProfiles from '../hooks/useProfiles'
import { useAuth } from '../context/AuthContext'
import { createProfile, deleteProfile, updateProfile } from '../lib/db'
import { ageAt } from '../lib/dates'

export default function Kids() {
  const { user } = useAuth()
  const profiles = useProfiles()
  const [editingId, setEditingId] = useState(null) // 'new' or a profile id

  if (profiles === null) return <div className="page-loading">Loading…</div>

  async function handleDelete(profile) {
    if (!window.confirm(`Remove ${profile.name}’s profile? Their artwork stays in the archive.`)) return
    await deleteProfile(user.uid, profile)
  }

  return (
    <>
      <div className="page-header">
        <h1>Kids</h1>
        {editingId === null && (
          <button className="btn btn-primary" onClick={() => setEditingId('new')}>
            + Add a kid
          </button>
        )}
      </div>

      {editingId === 'new' && (
        <ProfileForm
          onSave={async (data, photo) => {
            await createProfile(user.uid, data, photo)
            setEditingId(null)
          }}
          onCancel={() => setEditingId(null)}
        />
      )}

      <div className="kid-cards">
        {profiles.map((p) =>
          editingId === p.id ? (
            <ProfileForm
              key={p.id}
              initial={p}
              onSave={async (data, photo) => {
                await updateProfile(user.uid, p.id, data, photo)
                setEditingId(null)
              }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div key={p.id} className="kid-card card">
              <Link to={`/kid/${p.id}`} className="kid-card-main">
                <Avatar profile={p} size={72} />
                <div>
                  <h2>{p.name}</h2>
                  {p.birthday && <p className="hint">age {ageAt(p.birthday, new Date())}</p>}
                  {(p.schoolYears || []).length > 0 && (
                    <p className="hint">
                      {p.schoolYears
                        .map((y) => [y.grade, y.teacher].filter(Boolean).join(' · '))
                        .join(', ')}
                    </p>
                  )}
                </div>
              </Link>
              <div className="kid-card-actions">
                <button className="btn-link" onClick={() => setEditingId(p.id)}>Edit</button>
                <button className="btn-link btn-link-danger" onClick={() => handleDelete(p)}>
                  Delete
                </button>
              </div>
            </div>
          )
        )}
      </div>

      {profiles.length === 0 && editingId === null && (
        <p className="gallery-empty">No kids yet — add the first artist above.</p>
      )}
    </>
  )
}
