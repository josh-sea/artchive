// Client-side image resizing so the gallery loads small thumbnails and we
// don't store gigantic camera originals. Falls back to the original file if
// the browser can't decode it (e.g. HEIC outside Safari).

async function resizeToBlob(file, maxDim, quality) {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height)
  bitmap.close()
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('canvas.toBlob failed'))),
      'image/jpeg',
      quality
    )
  })
}

export async function prepareImageVariants(file) {
  try {
    const [full, thumb] = await Promise.all([
      resizeToBlob(file, 2048, 0.88),
      resizeToBlob(file, 640, 0.8),
    ])
    return { full, thumb, contentType: 'image/jpeg', ext: 'jpg' }
  } catch {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
    return { full: file, thumb: file, contentType: file.type || 'image/jpeg', ext }
  }
}
