/* eslint-disable no-return-assign */
import React, {useState,useRef,useMemo, useCallback} from 'react';
import * as THREE from 'three'
import './App.css';
import { Canvas, useFrame, useResource, useThree, extend} from 'react-three-fiber';
import { a, config } from 'react-spring/three';
import { Controls, useControl } from 'react-three-gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import  Effects  from './Effects'

const GROUP = 'Extra';

function Extra() {
  const rotateX = useControl('Rotation X', { type: 'number' });
  const rotateY = useControl('Rotation Y', { type: 'number' });
  return (
    <a.mesh position={[1.5, 0, 0.5]} rotation-x={rotateX} rotation-y={rotateY}>
      <boxGeometry attach="geometry" args={[0.7, 0.7, 0.7]} />
      <a.meshStandardMaterial attach="material" color="#ffff00" />
    </a.mesh>
  );
}

function Box({ direction, offset }) {
  const rad = 0.9;
  const det = 0;
  const [show, set] = useState(false);
  const meh = useRef()
  const [re, mes] = useResource()
  // Set up state for the hovered and active state
  const col = useControl('Material Color', {
    type: 'color',
    value: `#${(Math.random()*0xFFF000).toString(16)}`
  });
  useControl('Toggle cube', {
    group: GROUP,
    type: 'button',
    onClick: () => set(s => !s),
  });
  const icosa = new THREE.IcosahedronGeometry(rad, det);
  console.log(col)
  const line = new THREE.LineBasicMaterial({ color: new THREE.Color(col), transparent: true, opacity: 1, linewidth: 2 });


  // Rotate mesh every frame, this is outside of React without overhead
  // eslint-disable-next-line no-return-assign
  // eslint-disable-next-line no-multi-assign

  console.log(re);
  useFrame((state, delta) => {
    if (direction) {
      meh.current.rotation.x += 0.05 * Math.cos((1 * Number(new Date()) / 1000)+offset) * direction
      meh.current.rotation.y += 0.05 * Math.sin((1 * Number(new Date()) / 1000)+offset) * -direction
      meh.current.position.x = 2 * Math.sin((1 * (Number(new Date()) / 400)+offset )) * direction
      meh.current.position.y = (2 * Math.cos((1 * (Number(new Date()) / 400-offset))) * direction) 
    }
    else {
      meh.current.rotation.x = 10 * Math.sin(1 * Number(new Date()) / 9000)
      meh.current.rotation.y = 10 * Math.cos(1 * Number(new Date()) / 9000) 
    }
    
  })
  return (
    <>
      <a.group
        ref={meh}
      >
    
      <a.mesh
        onClick={() => set(s => !s)}
        >
        <icosahedronGeometry attach="geometry" ref={re} args={[rad, det]} />
          <a.meshStandardMaterial attach="material" color={0x000}  transparent opacity={0.5} depthWrite={false} flatShading />
      </a.mesh>

      <a.mesh
      >
        <lineSegments attach="geometry" geometry={new THREE.WireframeGeometry(mes)} material={line} size={2}/>
      </a.mesh>
      </a.group>
    </>
  );
}
const Boxes = () => {
  const b = [];
  for (let i = 0; i < 10; i++){
    console.log(typeof i)
    console.log(i);
    console.log(Math.PI/(i+1));
    b.push(<Box key={`box-${i}`} direction={i % 2 === 0 ? 1 : -1} offset={i*Math.PI/10} />)
  }
  console.log(b)
  return b;
}
function Swarm({ count, mouse }) {
  const mesh = useRef()
  const light = useRef()
  const { size, viewport } = useThree()
  const aspect = size.width / viewport.width

  const dummy = useMemo(() => new THREE.Object3D(), [])
  // Generate some random positions, speed factors and timings
  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100
      const factor = 20 + Math.random() * 100
      const speed = 0.01 + Math.random() / 200
      const xFactor = -50 + Math.random() * 100
      const yFactor = -50 + Math.random() * 100
      const zFactor = -50 + Math.random() * 100
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 })
    }
    return temp
  }, [count])
  // The innards of this hook will run every frame
  useFrame(state => {
    // Makes the light follow the mouse
    light.current.position.set(mouse.current[0] / aspect, -mouse.current[1] / aspect, 0)
    // Run through the randomized data to calculate some movement
    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle
      // There is no sense or reason to any of this, just messing around with trigonometric functions
      t = particle.t += speed / 2
      const a = Math.cos(t) + Math.sin(t * 1) / 10
      const b = Math.sin(t) + Math.cos(t * 2) / 10
      const s = Math.cos(t)
      particle.mx += (mouse.current[0] - particle.mx) * 0.01
      particle.my += (mouse.current[1] * -1 - particle.my) * 0.01
      // Update the dummy object
      dummy.position.set(
        (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
        (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
        (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
      )
      dummy.scale.set(s, s, s)
      dummy.rotation.set(s * 5, s * 5, s * 5)
      dummy.updateMatrix()
      // And apply the matrix to the instanced item
      mesh.current.setMatrixAt(i, dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  })
  return (
    <>
      <pointLight ref={light} distance={40} intensity={8} color="lightblue">
        <mesh>
          <sphereBufferGeometry attach="geometry" args={[0.5, 32, 32]} />
          <meshBasicMaterial attach="material" color="lightblue" />
        </mesh>
      </pointLight>
      <instancedMesh ref={mesh} args={[null, null, count]}>
        <dodecahedronBufferGeometry attach="geometry" args={[1, 0]} />
        <meshStandardMaterial attach="material" color="#700020" />
      </instancedMesh>
    </>
  )
}

extend({ OrbitControls })
const ThreeControls = (props) => {
  const { gl, camera } = useThree()
  const ref = useRef()
  console.log(gl);
  useFrame(() => ref.current.update())
  return <orbitControls ref={ref} args={[camera, gl.domElement]} {...props} />
}
function App() {
  const mesh = useRef();
  const light = useRef();
  const count = 50;
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const aspect =  window.width/window.height
  const mouse = useRef([0, 0])
  const onMouseMove = useCallback(({ clientX: x, clientY: y }) => (mouse.current = [x - window.innerWidth / 2, y - window.innerHeight / 2]), [])

  // Generate some random positions, speed factors and timings
  return (
    <div style={{ width: '100%', height: '100%' }} >
      <Canvas concurrent toneMappingExposure={0.1} >
        <Effects />
        <ambientLight />
        <pointLight position={[10, 0, 10]} intensity={1} />
        <Boxes />
        <pointLight ref={light} distance={40} intensity={8} color="lightblue" />
        <Swarm mouse={mouse} count={200} />
        <OrbitControls />
        <instancedMesh ref={mesh} args={[null, null, count]}>
          <dodecahedronBufferGeometry attach="geometry" args={[1, 0]} />
          <meshStandardMaterial attach="material" color="#700020" />
        </instancedMesh>
      </Canvas>
      <ThreeControls
        autoRotate
        enablePan={false}
        enableZoom={false}
        enableDamping
        dampingFactor={0.5}
        rotateSpeed={1}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 2}
      />
    </div>
  );
}

export default App;
