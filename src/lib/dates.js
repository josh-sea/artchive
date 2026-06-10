// Age and grade math based on a kid's birthday and the date a piece of
// art came home. Grade uses a US-style Sept 1 cutoff with kindergarten at 5;
// it's a best guess shown alongside the real age, and families can always
// tag the actual grade instead.

export function parseBirthday(birthday) {
  if (!birthday) return null
  const [y, m, d] = birthday.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

export function ageAt(birthday, date) {
  const b = parseBirthday(birthday)
  if (!b || !date) return null
  let age = date.getFullYear() - b.getFullYear()
  const beforeBirthday =
    date.getMonth() < b.getMonth() ||
    (date.getMonth() === b.getMonth() && date.getDate() < b.getDate())
  if (beforeBirthday) age -= 1
  return age >= 0 ? age : null
}

const ORDINALS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th']

export function gradeAt(birthday, date) {
  const b = parseBirthday(birthday)
  if (!b || !date) return null
  // School year starting in the fall: Aug+ counts toward the new year.
  const schoolYearStart = date.getMonth() >= 7 ? date.getFullYear() : date.getFullYear() - 1
  const cutoff = new Date(schoolYearStart, 8, 1)
  const ageAtCutoff = ageAt(birthday, cutoff)
  if (ageAtCutoff == null) return null
  const grade = ageAtCutoff - 5
  if (grade < -2) return null
  if (grade < 0) return 'preschool'
  if (grade === 0) return 'kindergarten'
  if (grade <= 12) return `${ORDINALS[grade - 1]} grade`
  return null
}

export function formatDate(date) {
  if (!date) return ''
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

export function toDateInputValue(date) {
  if (!date) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function fromDateInputValue(value) {
  if (!value) return null
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d, 12) // noon avoids timezone day-shift
}
