// Data layer. Everything lives under users/{uid}:
//   users/{uid}                      — user doc, holds the family's tag list
//   users/{uid}/profiles/{id}        — kid profiles (name, birthday, photo, school years)
//   users/{uid}/artworks/{id}        — one doc per scanned piece; profileIds[] and
//                                      tags[] act as the many-to-many join tables
import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { db, storage } from '../firebase'
import { prepareImageVariants } from './images'

export const PAGE_SIZE = 30

const profilesCol = (uid) => collection(db, 'users', uid, 'profiles')
const artworksCol = (uid) => collection(db, 'users', uid, 'artworks')
const userDoc = (uid) => doc(db, 'users', uid)

export function normalizeTag(tag) {
  return tag.trim().toLowerCase().replace(/\s+/g, ' ')
}

// ---------- profiles ----------

export function watchProfiles(uid, callback) {
  const q = query(profilesCol(uid), orderBy('createdAt', 'asc'))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

async function uploadProfilePhoto(uid, profileId, file) {
  const { thumb, contentType, ext } = await prepareImageVariants(file)
  const path = `users/${uid}/profiles/${profileId}/avatar.${ext}`
  await uploadBytes(ref(storage, path), thumb, { contentType })
  return { photoURL: await getDownloadURL(ref(storage, path)), photoPath: path }
}

export async function createProfile(uid, data, photoFile) {
  const docRef = await addDoc(profilesCol(uid), {
    name: data.name,
    birthday: data.birthday || null,
    schoolYears: data.schoolYears || [],
    photoURL: null,
    photoPath: null,
    createdAt: serverTimestamp(),
  })
  if (photoFile) {
    const photo = await uploadProfilePhoto(uid, docRef.id, photoFile)
    await updateDoc(docRef, photo)
  }
  return docRef.id
}

export async function updateProfile(uid, profileId, data, photoFile) {
  const updates = {
    name: data.name,
    birthday: data.birthday || null,
    schoolYears: data.schoolYears || [],
  }
  if (photoFile) {
    Object.assign(updates, await uploadProfilePhoto(uid, profileId, photoFile))
  }
  await updateDoc(doc(profilesCol(uid), profileId), updates)
}

export async function deleteProfile(uid, profile) {
  if (profile.photoPath) {
    await deleteObject(ref(storage, profile.photoPath)).catch(() => {})
  }
  await deleteDoc(doc(profilesCol(uid), profile.id))
}

// ---------- artworks ----------

function buildArtworksQuery(uid, { profileId, tag, cursor } = {}) {
  const parts = []
  if (profileId) parts.push(where('profileIds', 'array-contains', profileId))
  else if (tag) parts.push(where('tags', 'array-contains', tag))
  parts.push(orderBy('dateOfWork', 'desc'))
  if (cursor) parts.push(startAfter(cursor))
  parts.push(limit(PAGE_SIZE))
  return query(artworksCol(uid), ...parts)
}

export async function fetchArtworksPage(uid, filter) {
  const snap = await getDocs(buildArtworksQuery(uid, filter))
  return {
    items: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
    cursor: snap.docs[snap.docs.length - 1] || null,
    hasMore: snap.docs.length === PAGE_SIZE,
  }
}

export async function uploadArtwork(uid, file, { profileIds, tags, dateOfWork, note }) {
  const { full, thumb, contentType, ext } = await prepareImageVariants(file)
  const id = doc(artworksCol(uid)).id
  const imagePath = `users/${uid}/artworks/${id}/full.${ext}`
  const thumbPath = `users/${uid}/artworks/${id}/thumb.${ext}`
  await Promise.all([
    uploadBytes(ref(storage, imagePath), full, { contentType }),
    uploadBytes(ref(storage, thumbPath), thumb, { contentType }),
  ])
  const [imageURL, thumbURL] = await Promise.all([
    getDownloadURL(ref(storage, imagePath)),
    getDownloadURL(ref(storage, thumbPath)),
  ])
  const data = {
    imageURL,
    imagePath,
    thumbURL,
    thumbPath,
    profileIds: profileIds || [],
    tags: (tags || []).map(normalizeTag).filter(Boolean),
    note: note || '',
    dateOfWork: Timestamp.fromDate(dateOfWork || new Date()),
    createdAt: serverTimestamp(),
  }
  await setDoc(doc(artworksCol(uid), id), data)
  if (data.tags.length) await rememberTags(uid, data.tags)
  return { id, ...data, dateOfWork: data.dateOfWork }
}

export async function updateArtwork(uid, artworkId, { profileIds, tags, dateOfWork, note }) {
  const cleanTags = (tags || []).map(normalizeTag).filter(Boolean)
  await updateDoc(doc(artworksCol(uid), artworkId), {
    profileIds: profileIds || [],
    tags: cleanTags,
    note: note || '',
    dateOfWork: Timestamp.fromDate(dateOfWork),
  })
  if (cleanTags.length) await rememberTags(uid, cleanTags)
  return { profileIds, tags: cleanTags, note, dateOfWork: Timestamp.fromDate(dateOfWork) }
}

export async function deleteArtwork(uid, artwork) {
  await Promise.all(
    [artwork.imagePath, artwork.thumbPath]
      .filter(Boolean)
      .map((p) => deleteObject(ref(storage, p)).catch(() => {}))
  )
  await deleteDoc(doc(artworksCol(uid), artwork.id))
}

// ---------- tags ----------

// The family's reusable tag list lives on the user doc so the tag picker can
// suggest "3rd grade", "halloween", etc. without scanning every artwork.
export async function rememberTags(uid, tags) {
  await setDoc(userDoc(uid), { tags: arrayUnion(...tags) }, { merge: true })
}

export function watchUserTags(uid, callback) {
  return onSnapshot(userDoc(uid), (snap) => {
    callback(snap.exists() ? (snap.data().tags || []).slice().sort() : [])
  })
}
