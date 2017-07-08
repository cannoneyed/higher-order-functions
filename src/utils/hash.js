import md5 from 'md5'

export default function(selectedPixel) {
  if (!selectedPixel) {
    return '      '
  }
  const { row, col } = selectedPixel
  const hash = md5(`${row}:${col}`).substring(0, 5)
  const prefix = selectedPixel.colorIndex.toString(16)
  return `${prefix}${hash}`
}
