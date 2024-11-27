import * as THREE from "three/webgpu"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import gui from "lil-gui"
import getMaterial from "./getMaterial"

export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene()

    this.container = options.dom
    this.width = this.container.offsetWidth
    this.height = this.container.offsetHeight
    this.renderer = new THREE.WebGPURenderer()
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(this.width, this.height)
    this.renderer.setClearColor(0xeeeeee, 1)
    this.renderer.outputEncoding = THREE.sRGBEncoding

    this.container.appendChild(this.renderer.domElement)

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    )

    // var frustumSize = 10;
    // var aspect = window.innerWidth / window.innerHeight;
    // this.camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );
    this.camera.position.set(0, 0, 3.8)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.time = 0

    this.isPlaying = true

    this.addObjects()
    this.resize()
    this.render()
    this.setupResize()
    // this.settings();
  }

  settings() {
    this.settings = {
      progress: 0,
    }
    this.gui = new gui()
    this.gui.add(this.settings, "progress", 0, 1, 0.01)
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this))
  }

  resize() {
    this.width = this.container.offsetWidth
    this.height = this.container.offsetHeight
    this.renderer.setSize(this.width, this.height)
    this.camera.aspect = this.width / this.height
    this.camera.updateProjectionMatrix()
  }

  addObjects() {
    this.material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      side: THREE.DoubleSide,
    })

    this.material = getMaterial()

    let rows = 50
    let columns = 50
    let instances = rows * columns
    let size = 0.1
    this.geometry = new THREE.PlaneGeometry(size, size, 1, 1)
    this.positions = new Float32Array(instances * 3)
    this.colors = new Float32Array(instances * 3)
    this.uv = new Float32Array(instances * 2)

    // ASCII Grid
    this.instancedMesh = new THREE.InstancedMesh(
      this.geometry,
      this.material,
      instances
    )

    // spread the instances
    let index = 0
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        index = i * columns + j

        //set up the UVs
        this.uv[index * 2] = i / (rows - 1)
        this.uv[index * 2 + 1] = j / (columns - 1)

        // move instances to the center
        const centerX = (-size * (rows - 1)) / 2
        const centerY = (-size * (columns - 1)) / 2

        const x = (this.positions[index * 3] = i * size + centerX) // x
        const y = (this.positions[index * 3 + 1] = j * size + centerY) // y
        const z = (this.positions[index * 3 + 2] = 0) // z

        let matrix = new THREE.Matrix4()
        matrix.setPosition(x, y, z)
        this.instancedMesh.setMatrixAt(index, matrix)
        index++
      }
    }

    this.instancedMesh.instanceMatrix.needsupdate = true
    this.instancedMesh.geometry.setAttribute(
      "aPixelUV",
      new THREE.InstancedBufferAttribute(this.uv, 2)
    )

    this.scene.add(this.instancedMesh)
  }

  render() {
    if (!this.isPlaying) return
    this.time += 0.05
    requestAnimationFrame(this.render.bind(this))
    this.renderer.renderAsync(this.scene, this.camera)
  }
}

new Sketch({
  dom: document.getElementById("container"),
})
