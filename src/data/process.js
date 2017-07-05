const fs = require('fs')
const path = require('path')

const txt = fs.readFileSync(
  path.resolve(__dirname, './mathematica-output.txt'),
  'utf8',
)

// First, transform the output to the correct hex string formatting
const parsed = txt
  .replace(/13/g, 'D')
  .replace(/12/g, 'C')
  .replace(/11/g, 'B')
  .replace(/10/g, 'A')
  .replace(/\,\s+/g, '')
  .replace(/\n/, '')
  .replace(/^\{/, '[')
  .replace(/\}$/, ']')
  .replace(/\{/g, '"')
  .replace(/\}/g, '",\n')
  .replace(/,\n\]$/, '\n]')

// Turn the data into a JS object for processing
const data = JSON.parse(parsed)

// Rotate the output -90 degrees
const nRows = data.length
const nCols = data[0].length

const output = []

for (let col = nCols - 1; col >= 0; col--) {
  const colIndex = nCols - 1 - col
  output[colIndex] = ''
  for (let row = 0; row < nRows - 1; row++) {
    const digit = data[row][col]
    output[colIndex] += digit
  }
}

fs.writeFileSync(
  path.resolve(__dirname, './data.json'),
  JSON.stringify(data),
  'utf-8',
)
