import { Link, useParams } from 'react-router-dom'
import Avatar from '../components/Avatar'
import Gallery from '../components/Gallery'
import useProfiles from '../hooks/useProfiles'
import { ageAt } from '../lib/dates'

export default function KidPage() {
  const { profileId } = useParams()
  const profiles = useProfiles()

  if (profiles === null) return <div className="page-loading">Loading…</div>
  const profile = profiles.find((p) => p.id === profileId)
  if (!profile) {
    return (
      <p className="gallery-empty">
        Hmm, can’t find that profile. <Link to="/kids">Back to kids</Link>
      </p>
    )
  }

  const age = ageAt(profile.birthday, new Date())

  return (
    <>
      <div className="kid-header">
        <Avatar profile={profile} size={84} />
        <div>
          <h1>{profile.name}</h1>
          {age != null && <p className="hint">age {age}</p>}
        </div>
        <Link to={`/upload?kid=${profile.id}`} className="btn btn-primary kid-header-upload">
          + Add {profile.name}’s art
        </Link>
      </div>
      <Gallery
        filter={{ profileId: profile.id }}
        profiles={profiles}
        emptyMessage={`Nothing in ${profile.name}’s archive yet — upload the first piece!`}
      />
    </>
  )
}
