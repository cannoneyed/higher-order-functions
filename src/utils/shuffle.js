let seed = 1
function pseudorandom() {
  const x = Math.sin(seed++) * 10000
  return x - Math.floor(x)
}

// Durstenfeld shuffle algorithm
module.exports = function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(pseudorandom() * (i + 1))
    let temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
  return array
}
