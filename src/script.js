import "./style.css"
import * as THREE from "three"

//_ Get canvas html element
const canvas = document.querySelector("canvas.webgl")

//_ Dimensions
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

//_ Load textures
const textureLoader = new THREE.TextureLoader()

const particleTexture = textureLoader.load("/textures/particles/1.png")

//_ Create a scene
const scene = new THREE.Scene()

//_ Generate points
let geometry = null

const createParticles = (width, length) => {
  geometry = new THREE.BufferGeometry()
  const numPoints = width * length

  const positions = new Float32Array(numPoints * 3)
  const colors = new Float32Array(numPoints * 3)

  //* Handle the colors
  const colorHigh = new THREE.Color("#4DE7DA")
  const colorLow = new THREE.Color("#5B7FE9")

  let k = 0

  for (let i = 0; i < width; i++) {
    for (let j = 0; j < length; j++) {
      const u = i / width
      const v = j / length

      const x = u - 0.5
      const y = (Math.sin(u * Math.PI * 10) + Math.sin(v * Math.PI * 6)) / 20
      const z = v - 0.5

      positions[3 * k] = x
      positions[3 * k + 1] = y
      positions[3 * k + 2] = z

      //* Color
      const mixedColor = colorHigh.clone()
      mixedColor.lerp(colorLow, u)

      colors[k * 3 + 0] = mixedColor.r
      colors[k * 3 + 1] = mixedColor.g
      colors[k * 3 + 2] = mixedColor.b

      k++
    }
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))
  geometry.computeBoundingBox()

  const material = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    alphaTest: 0.001,
    alphaMap: particleTexture,
  })

  material.depthWrite = false
  material.blending = THREE.AdditiveBlending

  return new THREE.Points(geometry, material)
}

const mesh = createParticles(200, 200)
mesh.scale.set(20, 10, 20)
mesh.rotation.y = -Math.PI
scene.add(mesh)

//_ Add Camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.01,
  1000
)

scene.add(camera)
camera.position.set(6, 1.2, 6)

//_ Add controls
const cursor = {
  x: 0,
  y: 0,
}

window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / sizes.width - 0.5
  cursor.y = event.clientY / sizes.height - 0.5
})

window.addEventListener("touchmove", (event) => {
  cursor.x = event.touches[0].clientX / sizes.height - 0.5
  cursor.y = event.touches[0].clientY / sizes.height - 0.5
})

//_ Add renderer
const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor("#151B26", 1)

//_ Add resize events
window.addEventListener("resize", () => {
  //* Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  //* Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  //* Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

//_ Add frame function
const clock = new THREE.Clock()

const frame = () => {
  const elapsedTime = clock.getElapsedTime()

  //* Update controls
  camera.position.y = cursor.y + 1.5
  camera.position.z = cursor.x
  mesh.rotation.y = elapsedTime / 10

  camera.lookAt(mesh.position)

  //* Renderer
  renderer.render(scene, camera)

  window.requestAnimationFrame(frame)
}

frame()
