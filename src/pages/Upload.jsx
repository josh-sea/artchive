import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Avatar from '../components/Avatar'
import TagInput from '../components/TagInput'
import useProfiles from '../hooks/useProfiles'
import { useAuth } from '../context/AuthContext'
import { uploadArtwork } from '../lib/db'
import { fromDateInputValue, toDateInputValue } from '../lib/dates'

export default function Upload() {
  const { user } = useAuth()
  const profiles = useProfiles()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedKid = searchParams.get('kid')

  const [files, setFiles] = useState([])
  const [profileIds, setProfileIds] = useState(preselectedKid ? [preselectedKid] : [])
  const [tags, setTags] = useState([])
  const [date, setDate] = useState(toDateInputValue(new Date()))
  const [note, setNote] = useState('')
  const [progress, setProgress] = useState(null) // {done, total}
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files])
  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews])

  if (profiles === null) return <div className="page-loading">Loading…</div>

  function addFiles(fileList) {
    setFiles((prev) => [...prev, ...Array.from(fileList)])
  }

  function toggleProfile(id) {
    setProfileIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  async function handleUpload() {
    if (files.length === 0) return
    setError('')
    setProgress({ done: 0, total: files.length })
    const meta = {
      profileIds,
      tags,
      note,
      dateOfWork: fromDateInputValue(date) || new Date(),
    }
    try {
      for (let i = 0; i < files.length; i++) {
        await uploadArtwork(user.uid, files[i], meta)
        setProgress({ done: i + 1, total: files.length })
      }
      navigate(profileIds.length === 1 ? `/kid/${profileIds[0]}` : '/')
    } catch {
      setError('Upload hit a snag — some pieces may not have saved. Please try again.')
      setProgress(null)
    }
  }

  const uploading = progress !== null

  return (
    <div className="upload-page">
      <h1>Add artwork</h1>

      <div className="upload-pickers">
        <button className="btn" onClick={() => fileInputRef.current.click()} disabled={uploading}>
          📁 Choose photos
        </button>
        <button className="btn" onClick={() => cameraInputRef.current.click()} disabled={uploading}>
          📷 Use camera
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => addFiles(e.target.files)}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <div className="upload-previews">
          {previews.map((src, i) => (
            <div key={i} className="upload-preview">
              <img src={src} alt={`upload ${i + 1}`} />
              {!uploading && (
                <button
                  className="upload-preview-remove"
                  onClick={() => setFiles(files.filter((_, j) => j !== i))}
                  aria-label="Remove"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="card upload-meta">
        <fieldset>
          <legend>Whose art is this?</legend>
          <div className="upload-kids">
            {profiles.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`upload-kid ${profileIds.includes(p.id) ? 'selected' : ''}`}
                onClick={() => toggleProfile(p.id)}
                disabled={uploading}
              >
                <Avatar profile={p} size={52} />
                <span>{p.name}</span>
              </button>
            ))}
          </div>
        </fieldset>
        <label>
          Date it came home <span className="hint">(defaults to today — edit for older art)</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} disabled={uploading} />
        </label>
        <label>
          Tags
          <TagInput tags={tags} onChange={setTags} />
        </label>
        <label>
          Note <span className="hint">(optional, applied to all selected photos)</span>
          <input
            value={note}
            placeholder="e.g. Turkey hand from art class"
            onChange={(e) => setNote(e.target.value)}
            disabled={uploading}
          />
        </label>
      </div>

      {error && <p className="form-error">{error}</p>}
      <button
        className="btn btn-primary upload-submit"
        onClick={handleUpload}
        disabled={uploading || files.length === 0}
      >
        {uploading
          ? `Uploading ${progress.done}/${progress.total}…`
          : `Upload ${files.length || ''} ${files.length === 1 ? 'photo' : 'photos'}`}
      </button>
    </div>
  )
}
