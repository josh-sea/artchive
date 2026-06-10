import { Link, useParams } from 'react-router-dom'
import Gallery from '../components/Gallery'
import useProfiles from '../hooks/useProfiles'

export default function Explore() {
  const { tag } = useParams()
  const profiles = useProfiles() || []

  return (
    <>
      <div className="page-header">
        <h1>Exploring “{tag}”</h1>
        <Link to="/">← All art</Link>
      </div>
      <Gallery
        filter={{ tag }}
        profiles={profiles}
        emptyMessage={`No artwork tagged “${tag}” yet.`}
      />
    </>
  )
}
