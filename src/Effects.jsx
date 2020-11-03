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
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { WaterPass } from './Waterpass'

extend({ EffectComposer, ShaderPass, RenderPass, UnrealBloomPass, FilmPass, WaterPass, AfterimagePass, FXAAShader })
extend({ OrbitControls })

const ThreeControls = (props) => {
  const { gl, camera } = useThree()
  const ref = useRef()
  useFrame(() => ref.current.update())
  return <orbitControls ref={ref} args={[camera, gl.domElement]} {...props} />
}
export default function Effects() {
  const composer = useRef()
  const { scene, gl, size, camera } = useThree()
  useEffect(() => void composer.current.setSize(size.width, size.height), [size])
  useFrame(() => composer.current.render(), 2)
  const aspect = useMemo(() => new THREE.Vector2(size.width, size.height), [size])
  return (
    <>
      <ThreeControls
      // autoRotate
      enablePan
      enableZoom
      enableDamping
      dampingFactor={0.5}
        rotateSpeed={2}
        // autoRotateSpeed={230}
      maxPolarAngle={Math.PI*2}
      minPolarAngle={-Math.PI*2}
    />
    <effectComposer ref={composer} args={[gl]}>
      <renderPass attachArray="passes" scene={scene} camera={camera} />
      {/* <waterPass attachArray="passes" factor={2} /> */}
      {/* <unrealBloomPass attachArray="passes" args={[aspect, 2, 2, 0.221]} /> */}
      {/* <afterimagePass attachArray="passes" uniforms-damp-value={0.991} /> */}
      
      <shaderPass attachArray="passes" args={[FXAAShader]} uniforms-resolution-value={[1 / size.width, 1 / size.height]} renderToScreen />
      </effectComposer>
    </>
  )
}
