const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function randomSegment(length) {
  let out = ''
  for (let i = 0; i < length; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  }
  return out
}

export function generateVoucherCode(planId = 'XX') {
  const plan = String(planId || 'XX').toUpperCase().slice(0, 3).padEnd(3, 'X')
  return `CA-${randomSegment(4)}-${plan}`
}
