import * as THREE from 'three'
import MakeOrbitControls from 'three-orbit-controls'
const OrbitControls = MakeOrbitControls(THREE)

import _ from 'lodash'

import particleManager from './particle-manager'

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

  particleManager.addParticlesToScene(scene)

  renderer = new THREE.WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  container.appendChild(renderer.domElement)

  document.addEventListener('mousemove', onDocumentMouseMove, false)
  document.addEventListener('touchstart', onDocumentTouchStart, false)
  document.addEventListener('touchmove', onDocumentTouchMove, false)
  window.addEventListener('resize', onWindowResize, false)
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

  for (let i = 0; i < scene.children.length; i++) {
    let object = scene.children[i]

    if (object instanceof THREE.Points) {
      object.position.z = Math.sin(time * i) * 500
    }
  }

  renderer.render(scene, camera)
}
