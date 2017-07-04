const fs = require('fs')

const txt = fs.readFileSync('./mathematica-output.txt', 'utf8')

const output = txt
  .replace(/13/g, 'D')
  .replace(/12/g, 'C')
  .replace(/11/g, 'B')
  .replace(/10/g, 'A')
  .replace(/\,\s+/g, '')
  .replace(/\n/, '')
  .replace(/^\{/, '[')
  .replace(/\}$/, ']')
  .replace(/\{/g, '\"')
  .replace(/\}/g, '\",\n')
  .replace(/,\n\]$/, '\n]')

fs.writeFileSync('./data.json', output, 'utf-8')
