import { Link } from 'react-router-dom'
import Avatar from '../components/Avatar'
import Gallery from '../components/Gallery'
import useProfiles from '../hooks/useProfiles'

export default function Home() {
  const profiles = useProfiles()

  if (profiles === null) return <div className="page-loading">Loading…</div>

  if (profiles.length === 0) {
    return (
      <div className="onboarding">
        <h1>Welcome to Artchive 🎨</h1>
        <p>
          Start by adding a profile for each kid. Then every drawing, painting,
          and worksheet that comes home is one tap away from being saved forever.
        </p>
        <Link to="/kids" className="btn btn-primary">Add your first kid</Link>
      </div>
    )
  }

  return (
    <>
      <div className="kid-row">
        {profiles.map((p) => (
          <Link key={p.id} to={`/kid/${p.id}`} className="kid-row-item">
            <Avatar profile={p} size={64} />
            <span>{p.name}</span>
          </Link>
        ))}
        <Link to="/upload" className="kid-row-item kid-row-add">
          <div className="avatar avatar-add">+</div>
          <span>Add art</span>
        </Link>
      </div>
      <Gallery
        profiles={profiles}
        emptyMessage={
          <>
            Nothing archived yet. <Link to="/upload">Upload the first masterpiece →</Link>
          </>
        }
      />
    </>
  )
}
