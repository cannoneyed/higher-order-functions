import React, { Component } from 'react'
import Konva from 'konva'
import { map } from 'lodash'
import { Group, Layer, Rect, Stage } from 'react-konva'

import data from '../../data/data.json'

const colors = [
  '#c7d9e7', // 0: white
  '#f8a600', // 1: yellow
  '#dd602b', // 2: Hue[.13, 90, 1]
  '#f95b14', // 3: orange
  '#fc0d1b', // 4: red
  '#d30091', // 5: magenta
  '#b622e2', // 6: Hue[.8, 1, .9]
  '#5916b0', // 7: Hue[.75, 1, .7]
  '#0542ce', // 8: blue
  '#0089f0', // 9: cyan
  '#008700', // 10: green
  '#83bf01', // 11: Hue[.23, .9, 1]
  '#cedf05', // 12: Hue[.2, .9, 1]
  '#000600', // 13: black
]

const PIXEL_SIZE = 10

class Pixel extends Component {
  render() {
    const { color, x, y } = this.props
    return (
      <Rect x={x} y={y} width={PIXEL_SIZE} height={PIXEL_SIZE} fill={color} />
    )
  }
}

class Row extends Component {
  render() {
    const { row, y } = this.props
    return (
      <Group>
        {map(row, (digit, index) => {
          const x = index * PIXEL_SIZE
          const color = colors[parseInt(digit, 16)]
          return <Pixel x={x} y={y} color={color} />
        })}
      </Group>
    )
  }
}

class Grid extends Component {
  render() {
    return (
      <Group>
        {data.map((row, index) => {
          const y = index * PIXEL_SIZE
          return <Row y={y} row={row} />
        })}
      </Group>
    )
  }
}

export default function App() {
  // Stage - is a div wrapper
  // Layer - is a <canvas> element on the page
  // so you can use several canvases. It may help you to improve performance a lot.
  const nRows = data.length
  const nCols = data[0].length

  return (
    <Stage width={nCols * PIXEL_SIZE} height={nRows * PIXEL_SIZE}>
      <Layer>
        <Grid />
      </Layer>
    </Stage>
  )
}
