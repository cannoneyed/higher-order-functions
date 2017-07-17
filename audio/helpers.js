const alphabetic = (a, b) => {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

module.exports.makeSlug = clips => {
  return clips.map(item => item.name).sort(alphabetic).join('|')
}

module.exports.getClipsByType = clips => {
  return clips.reduce((output, clip) => {
    const type = clip.name.split(' ')[0]
    output[type] = output[type] || []
    output[type].push(clip)
    return output
  }, {})
}
