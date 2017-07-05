import * as THREE from 'three'
import MakeOrbitControls from 'three-orbit-controls'
const OrbitControls = MakeOrbitControls(THREE)

import data from 'data/data.json'
import _ from 'lodash'

import { colors, PIXEL_SIZE } from './constants'

const colorMap = _.range(14).map(() => ({
  geometry: new THREE.Geometry(),
}))

colorMap.geometries = () => _.map(colorMap, ({ geometry }) => geometry)
colorMap.materials = () => _.map(colorMap, ({ material }) => material)
colorMap.particles = () => _.map(colorMap, ({ particles }) => particles)

let camera, scene, renderer, controls
let mouseX = 0,
  mouseY = 0

let windowHalfX = window.innerWidth / 2
let windowHalfY = window.innerHeight / 2

export function animate() {
  requestAnimationFrame(animate)
  render()
}

export function init(container) {
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    30000,
  )
  camera.position.z = 800
  controls = new OrbitControls(camera)

  scene = new THREE.Scene()
  // scene.fog = new THREE.FogExp2(0x000000, 0.0007)

  const nRows = data.length
  const nCols = data[0].length
  const adjust = 4 / 3

  const offsetRow = nRows * PIXEL_SIZE / 2 - 0.5 * PIXEL_SIZE
  const offSetCol = nCols * PIXEL_SIZE / 2 + 7 * PIXEL_SIZE

  _.map(data, (row, rowIndex) => {
    _.map(row, (digit, columnIndex) => {
      const colorIndex = parseInt(digit, 16)

      const vertex = new THREE.Vector3()
      vertex.x = rowIndex * PIXEL_SIZE - offsetRow
      vertex.y = columnIndex * PIXEL_SIZE - offSetCol
      vertex.z = 0

      const geometry = colorMap[colorIndex].geometry
      geometry.vertices.push(vertex)
    })
  })

  const geometries = _.map(colorMap, ({ geometry }) => geometry)
  _.map(geometries, (geometry, colorIndex) => {
    const color = getHexColorByIndex(colorIndex)
    const size = PIXEL_SIZE * adjust

    const material = new THREE.PointsMaterial({ size })
    material.color.setHex(color)

    const particles = new THREE.Points(geometry, material)

    colorMap[colorIndex].material = material
    colorMap[colorIndex].particles = particles

    scene.add(particles)
  })
  //
  renderer = new THREE.WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  container.appendChild(renderer.domElement)

  // document.addEventListener('mousemove', onDocumentMouseMove, false)
  // document.addEventListener('touchstart', onDocumentTouchStart, false)
  // document.addEventListener('touchmove', onDocumentTouchMove, false)
  // window.addEventListener('resize', onWindowResize, false)
}

function onWindowResize() {
  windowHalfX = window.innerWidth / 2
  windowHalfY = window.innerHeight / 2

  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}

function onDocumentMouseMove(event) {
  mouseX = event.clientX - windowHalfX
  mouseY = event.clientY - windowHalfY
}

function onDocumentTouchStart(event) {
  if (event.touches.length === 1) {
    event.preventDefault()

    mouseX = event.touches[0].pageX - windowHalfX
    mouseY = event.touches[0].pageY - windowHalfY
  }
}

function onDocumentTouchMove(event) {
  if (event.touches.length === 1) {
    event.preventDefault()

    mouseX = event.touches[0].pageX - windowHalfX
    mouseY = event.touches[0].pageY - windowHalfY
  }
}

function render() {
  let time = Date.now() * 0.00005
  //
  // camera.position.x += (mouseX - camera.position.x) * 0.05
  // camera.position.y += (-mouseY - camera.position.y) * 0.05
  //
  // camera.lookAt(scene.position)
  //
  for (let i = 0; i < scene.children.length; i++) {
    let object = scene.children[i]

    if (object instanceof THREE.Points) {
      object.position.z = Math.sin(time * i) * 500
    }
  }
  // const materials = colorMap.materials()
  // _.map(materials, (material, index) => {
  //   const color = getHexColorByIndex(index)
  //
  //   const h = 360 * (color + time) % 360 / 360
  //   material.color.setHSL(h, color[1], color[2])
  // })

  renderer.render(scene, camera)
}

function getHexColorByIndex(colorIndex) {
  const colorString = colors[colorIndex]
  const color = parseInt(colorString.replace(/^#/, ''), 16)
  return color
}
