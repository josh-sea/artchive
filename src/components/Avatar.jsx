const COLORS = ['#f4a261', '#2a9d8f', '#e76f51', '#8ab17d', '#e9c46a', '#6d597a']

export default function Avatar({ profile, size = 48 }) {
  const style = { width: size, height: size, fontSize: size * 0.42 }
  if (profile?.photoURL) {
    return <img className="avatar" src={profile.photoURL} alt={profile.name} style={style} />
  }
  const initial = (profile?.name || '?').trim().charAt(0).toUpperCase()
  const color = COLORS[(initial.charCodeAt(0) || 0) % COLORS.length]
  return (
    <div className="avatar avatar-initial" style={{ ...style, background: color }}>
      {initial}
    </div>
  )
}
