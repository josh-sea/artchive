import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { watchProfiles } from '../lib/db'

export default function useProfiles() {
  const { user } = useAuth()
  const [profiles, setProfiles] = useState(null) // null = still loading

  useEffect(() => {
    if (!user) return
    return watchProfiles(user.uid, setProfiles)
  }, [user])

  return profiles
}
