import * as THREE from 'three'
import React, { useRef, useEffect, useMemo } from 'react'
import { extend, useThree, useFrame } from 'react-three-fiber'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass'
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader'
import { WaterPass } from './Waterpass'

extend({ EffectComposer, ShaderPass, RenderPass, UnrealBloomPass, FilmPass, WaterPass, AfterimagePass, FXAAShader })

export default function Effects() {
  const composer = useRef()
  const { scene, gl, size, camera } = useThree()
  useEffect(() => void composer.current.setSize(size.width, size.height), [size])
  useFrame(() => composer.current.render(), 2)
  const aspect = useMemo(() => new THREE.Vector2(size.width, size.height), [size])
  return (
    <effectComposer ref={composer} args={[gl]}>
      <renderPass attachArray="passes" scene={scene} camera={camera} />
      {/* <waterPass attachArray="passes" factor={2} /> */}
      <unrealBloomPass attachArray="passes" args={[aspect, 2, 2, 0.221]} />
      <afterimagePass attachArray="passes" uniforms-damp-value={0.8} />
      
      <shaderPass attachArray="passes" args={[FXAAShader]} uniforms-resolution-value={[1 / size.width, 1 / size.height]} renderToScreen />
    </effectComposer>
  )
}
