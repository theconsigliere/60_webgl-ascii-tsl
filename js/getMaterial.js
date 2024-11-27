import * as THREE from "three/webgpu"
import {
  mx_noise_float,
  color,
  cross,
  dot,
  float,
  transformNormalToView,
  positionLocal,
  sign,
  step,
  Fn,
  uniform,
  varying,
  vec2,
  vec3,
  vec4,
  texture,
  attribute,
  loop,
  uv,
} from "three/tsl"

import portrait from "../images/portrait.png?url"

export default function getMaterial() {
  let uTexture = new THREE.TextureLoader().load(portrait)

  let material = new THREE.NodeMaterial({
    wireframe: true,
  })

  const asciiCode = Fn(() => {
    const textureColor = texture(uTexture, attribute("aPixelUV"))

    return textureColor
  })

  material.colorNode = asciiCode()

  return material
}
