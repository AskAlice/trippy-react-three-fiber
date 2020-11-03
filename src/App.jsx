/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable no-unused-vars */
/* eslint-disable no-return-assign */
/* eslint-disable no-multi-assign */
import React, {useState,useRef,useMemo, useCallback} from 'react';
import { Canvas, useLoader, useFrame, useThree, extend, useResource } from 'react-three-fiber'
import * as THREE from 'three'
import './App.css';
import { a, config } from 'react-spring/three';
import { Controls, useControl } from 'react-three-gui';
import * as meshline from 'threejs-meshline'
import MidiFile from 'midifile';
import MidiEvents from 'midievents';
import  drums from './drums.mid';
import  Effects  from './Effects'
import tesselated from './tesselated.mp3';

extend(meshline)



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
  // console.log(col);
  const icosa = new THREE.IcosahedronGeometry(rad, det);
  // console.log(col)
  const line = new THREE.LineBasicMaterial({ color: new THREE.Color(linecol), transparent: true, opacity: 1, linewidth: 2,depthWrite:false });


  // Rotate mesh every frame, this is outside of React without overhead
  // eslint-disable-next-line no-return-assign
  // eslint-disable-next-line no-multi-assign

  // console.log(re);
  useFrame((state, delta) => {
    // console.log(camera.position);
    if (camera) {
      meshMat.current.opacity = ((distanceVector(camera.position, new THREE.Vector3(0, 0, 0)))/60)
      // console.log((distanceVector(camera.position, new THREE.Vector3(0,0,0)))/60)
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
    // console.log(typeof i)
    // console.log(i);
    // console.log(Math.PI/(i+1));
    b.push(<Box key={`box-${i}`} direction={i % 2 === 0 ? 1 : -1} offset={i * Math.PI / (count/2)} index={i} count={count} />)
  }
  // console.log(b)
  return b;
}
function getBuffer( url, success, error ) {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function( e ) {
      if ( xhr.readyState == 4 ) {
          if ( xhr.status == 200 ) {
              return success( e.currentTarget.response );
          }
          if ( error ) {
              return error( `${xhr.status  } ${  xhr.statusText}` );
          }
          throw `${xhr.status  } ${  xhr.statusText}`;
      }
  };
  xhr.open( 'GET', url, true );
  xhr.responseType = 'arraybuffer';
  xhr.send( null );
}

function Rig({ mouse }) {


  const { camera } = useThree()
  useFrame(() => {
    // console.log(midi);
    // camera.position.z = 5 + 5*Math.sin(new Date());
     camera.lookAt(0, 0, 0)
  })
  return null
}
function Boxx(props) {
  // This reference will give us direct access to the mesh
  const mesh = useRef()

  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false)
  const [active, setActive] = useState(false)

  // Rotate mesh every frame, this is outside of React without overhead
  useFrame(() => {
    mesh.current.rotation.x = mesh.current.rotation.y += 0.01
  })

  return (
    <a.mesh
      {...props}
      ref={mesh}
      scale={active ? [1.5, 1.5, 1.5] : [1, 1, 1]}
      onClick={(e) => setActive(!active)}
      onPointerOver={(e) => setHover(true)}
      onPointerOut={(e) => setHover(false)}>
      <a.boxGeometry args={[1, 1, 1]} attach="geometry" />
      <meshStandardMaterial  attach="material" color={hovered ? 'hotpink' : 'orange'} />
    </a.mesh>
  )
}
const Timer = ({startTime, audio, id, position}) => {
  const [midi,setMidi] = useState();
  const mesh = useRef()

  // Set up state for the hovered and active state
  const [active, setActive] = useState(false);
  React.useEffect(()=>{
    getBuffer(drums,(b)=>{
      const file = new MidiFile(b);
      console.log(file);
      file.header.setTicksPerBeat(139);
      setMidi(file);
    },()=>{})
  },[])
  useFrame(({},delta)=>{
    // console.log(audio?.current?.currentTime);
    const elapsedMs = (Date.now()-startTime);
    // console.log(delta, elapsedMs, elapsedMs-(delta*1000));
     if(typeof midi !== 'undefined')
     {
      //  console.log(mesh.current);
       const midiEvents = midi.getEvents();
        midiEvents.forEach(event => {
          // console.log(event.playTime, elapsedMs);
          if(event.playTime >= elapsedMs-(delta*2000) && event.playTime <= elapsedMs &&event.type === 8 && event.param1 === id)
            if(event.subtype === 8)
              {
                  mesh.current.scale.set(1,1,1);
                  console.log("noteOff", event.param1, event)
              }
              else if(event.subtype === 9){
                  mesh.current.scale.set(1.5,1.5,1.5);;
                console.log("noteOn", event.param1, event)
            }
        })
      }
    })
  return (
    <mesh
    position={position}
    ref={mesh}
    scale={active ? [1.5, 1.5, 1.5] : [1, 1, 1]}
  >
    <icosahedronGeometry args={[1,0]} attach="geometry" />
    <meshStandardMaterial color="hotpink" attach="material" />
  </mesh>
  )
};
export default function App() {

  const mouse = useRef([0, 0])
  const mesh = useRef();
  const light = useRef();
  const count = 50;
  const audio = useRef();
  const [startTime, setStartTime] = useState(0);
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const aspect =  window.width/window.height;

  console.log(startTime);
  const onMouseMove = useCallback(({ clientX: x, clientY: y }) => (mouse.current = [x - window.innerWidth / 2, y - window.innerHeight / 2]), [])
  return (
    <div id="container" style={{ width: '100%', height: '100%' }} onMouseMove={onMouseMove}>
    <Canvas
    onClick={(e)=>{if(startTime === 0){setStartTime(Date.now);audio.current.play();}}}
      style={{ background: 'radial-gradient(at 50% 70%, #200f20 40%, #090b1f 80%, #050523 100%)' }}
      camera={{ position: [0, 0, 8] }}
        shadowMap>
      <Rig mouse={mouse} />
      {/* <ambientLight intensity={0.4} /> */}
      {/* <pointLight intensity={20} position={[-10, -25, -10]} color="#200f20" /> */}
      <spotLight
        castShadow
        intensity={1}
        angle={Math.PI / 8}
        position={[15, 25, 5]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} />
     <Timer startTime={startTime} audio={audio} id={40} position={[-2,0,0]} />
     <Timer startTime={startTime} audio={audio} id={36} position={[0,0,0]}/>
     <Timer startTime={startTime} audio={audio} id={41} position={[2,0,0]}/>
     
        <Effects />
        {/* <Boxx position={[0,0,0]} /> */}
        {/* <ambientLight />
        <pointLight position={[10, 0, 10]} intensity={1} /> */}
        <Boxes count={5} />
        {/* <pointLight ref={light} distance={40} intensity={8} color="lightblue" /> */}
      </Canvas>
      <audio src={tesselated} ref={audio} />
      </div>
  )
}