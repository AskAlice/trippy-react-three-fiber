/* eslint-disable no-multi-assign */
import React, {useState,useRef,useMemo, useCallback} from 'react';
import { Canvas, useLoader, useFrame, useThree, extend, useResource } from 'react-three-fiber'
import * as THREE from 'three'
import './App.css';
import { a, config } from 'react-spring/three';
import { Controls, useControl } from 'react-three-gui';
import * as meshline from 'threejs-meshline'
import  Effects  from './Effects'

extend(meshline)

function Fatline({ curve, width, color, speed }) {
  const material = useRef()
  useFrame(() => (material.current.uniforms.dashOffset.value -= speed))
  return (
    <mesh>
      <meshLine attach="geometry" vertices={curve} />
      <meshLineMaterial
        attach="material"
        ref={material}
        transparent
        depthTest={false}
        lineWidth={width}
        color={color}
        dashArray={0.1}
        dashRatio={0.9}
      />
    </mesh>
  )
}

function Lines({ count, colors }) {
  const lines = useMemo(
    () =>
      new Array(count).fill().map(() => {
        const pos = new THREE.Vector3(10 - Math.random() * 200, 10 - Math.random() * 200, 10 - Math.random() * 200)
        const points = new Array(30)
          .fill()
          .map(() =>
            pos.add(new THREE.Vector3(4 - Math.random() * 20, 4 - Math.random() * 10, 2 - Math.random() * 4)).clone()
          )
        const curve = new THREE.CatmullRomCurve3(points).getPoints(1000)
        return {
          color: colors[parseInt(colors.length * Math.random())],
          width: Math.max(0.1, 0.65 * Math.random()),
          speed: Math.max(0.0001, 0.0005 * Math.random()),
          curve,
        }
      }),
    [colors, count]
  )
  return lines.map((props, index) => <Fatline key={index} {...props} />)
}
function Stars({ count = 5000 }) {
  const positions = useMemo(() => {
    const positions = []
    for (let i = 0; i < count; i++) {
      positions.push((50 + Math.random() * 1000) * (Math.round(Math.random()) ? -1 : 1))
      positions.push((50 + Math.random() * 1000) * (Math.round(Math.random()) ? -1 : 1))
      positions.push((50 + Math.random() * 1000) * (Math.round(Math.random()) ? -1 : 1))
    }
    return new Float32Array(positions)
  }, [count])
  return (
    <points>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attachObject={['attributes', 'position']}
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial attach="material" size={2} sizeAttenuation color="white" transparent opacity={0.8} fog={false} />
    </points>
  )
}
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
function hslToHex(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  let r; let g; let b;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  const toHex = x => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? `0${  hex}` : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
function distanceVector( v1, v2 )
{
    const dx = v1.x - v2.x;
    const dy = v1.y - v2.y;
    const dz = v1.z - v2.z;

    return Math.sqrt( dx * dx + dy * dy + dz * dz );
}
function Box({ direction, offset, index, count }) {
  const rad = 0.9;
  const det = 0;
  const { camera } = useThree();
  const [show, set] = useState(false);
  const meh = useRef()
  const meshMat = useRef()
  const [re, mes] = useResource()
  // Set up state for the hovered and active state
  const col = new THREE.Color(hslToHex(((index*count)/count)**2 % 360, 80,69));
  const linecol = new THREE.Color(hslToHex((156+(index*64)) % 255, 100,50));
  console.log(col);
  useControl('Toggle cube', {
    group: GROUP,
    type: 'button',
    onClick: () => set(s => !s),
  });
  const icosa = new THREE.IcosahedronGeometry(rad, det);
  console.log(col)
  const line = new THREE.LineBasicMaterial({ color: new THREE.Color(linecol), transparent: true, opacity: 1, linewidth: 2,depthWrite:false });


  // Rotate mesh every frame, this is outside of React without overhead
  // eslint-disable-next-line no-return-assign
  // eslint-disable-next-line no-multi-assign

  console.log(re);
  useFrame((state, delta) => {
    console.log(camera.position);
    if (camera) {
      meshMat.current.opacity = ((distanceVector(camera.position, new THREE.Vector3(0, 0, 0)))/60)
      console.log((distanceVector(camera.position, new THREE.Vector3(0,0,0)))/60)
    }
    if (direction) {
      meh.current.rotation.x += 0.05 * Math.cos((1 * Number(new Date()) / 1000)+offset) * direction
      meh.current.rotation.y += 0.05 * Math.sin((1 * Number(new Date()) / 1000)+offset) * -direction
      meh.current.position.x = 8 * Math.sin((1 * (Number(new Date()) / 200)+offset )) * direction
      meh.current.position.y = (8 * Math.cos((1 * (Number(new Date()) / 800-offset))) * direction) 
      meh.current.position.z = (8 * Math.sin((1 * (Number(new Date()) / 400-offset))) * direction) 
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
          <a.meshStandardMaterial ref={meshMat} attach="material" color={col} transparent opacity={0.02} flatShading depthWrite={false}/>
      </a.mesh>

      <a.mesh
      >
        <lineSegments attach="geometry" geometry={new THREE.WireframeGeometry(mes)} material={line} size={2}/>
      </a.mesh>
      </a.group>
    </>
  );
}
const Boxes = ({count}) => {
  const b = [];
  for (let i = 0; i < count; i++){
    console.log(typeof i)
    console.log(i);
    console.log(Math.PI/(i+1));
    b.push(<Box key={`box-${i}`} direction={i % 2 === 0 ? 1 : -1} offset={i * Math.PI / (count/2)} index={i} count={count} />)
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
    light.current.position.set(-mouse.current[0] / aspect*2, -1*mouse.current[1] / aspect*2, 0)
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
function Rig({ mouse }) {
  const { camera } = useThree()
  useFrame(() => {

    camera.lookAt(0, 0, 0)
  })
  return null
}
export default function App() {
  const mouse = useRef([0, 0])
  const mesh = useRef();
  const light = useRef();
  const count = 50;
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const aspect =  window.width/window.height
  const onMouseMove = useCallback(({ clientX: x, clientY: y }) => (mouse.current = [x - window.innerWidth / 2, y - window.innerHeight / 2]), [])
  
  return (
    <div id="container" style={{ width: '100%', height: '100%' }} onMouseMove={onMouseMove}>
    <Canvas
      style={{ background: 'radial-gradient(at 50% 70%, #200f20 40%, #090b1f 80%, #050523 100%)' }}
      camera={{ position: [0, 0, 8] }}
        shadowMap>
        <Lines count={30} colors={['#A2CCB6', '#FCEEB5', '#EE786E', '#e0feff', 'lightpink', 'lightblue']} />
      
      <Rig mouse={mouse} />
      <ambientLight intensity={0.4} />
      <pointLight intensity={20} position={[-10, -25, -10]} color="#200f20" />
      <spotLight
        castShadow
        intensity={4}
        angle={Math.PI / 8}
        position={[15, 25, 5]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <fog attach="fog" args={['#090b1f', 0, 25]} />

        <Stars />
     
        <Effects />
        <ambientLight />
        <pointLight position={[10, 0, 10]} intensity={1} />
        <Boxes count={80} />
        <pointLight ref={light} distance={40} intensity={8} color="lightblue" />
        <Swarm mouse={mouse} count={200} />

        <instancedMesh ref={mesh} args={[null, null, count]}>
          <dodecahedronBufferGeometry attach="geometry" args={[1, 0]} />
          <meshStandardMaterial attach="material" color="#700020" />
        </instancedMesh>
      </Canvas>
      </div>
  )
}