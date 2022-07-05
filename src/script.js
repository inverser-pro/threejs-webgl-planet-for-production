
import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import {BufferGeometryUtils} from 'three/examples/jsm/utils/BufferGeometryUtils'
import {TWEEN} from 'three/examples/jsm/libs/tween.module.min'

import anime from 'animejs/lib/anime'
//import * as dat from 'dat.gui'

//const gui = new dat.GUI()
const do_cument=document;
const ca_nvas=do_cument.querySelector('.webgl');
if(!ca_nvas)throw 'no canvas.webgl';
const sizes = {width: parseInt(window.getComputedStyle(ca_nvas).width),  height: parseInt(window.getComputedStyle(ca_nvas).height)}

let o;
const scene = new THREE.Scene();
//scene.background = new THREE.Color('blue');
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.01, 50);
camera.position.set(0, 10, 10);
const renderer = new THREE.WebGLRenderer({canvas:ca_nvas,antialias: true,alpha: true});
renderer.setSize(sizes.width , sizes.height);

renderer.setClearColor(0x000000, 0);

const controls = new OrbitControls(camera, renderer.domElement);
//controls.enablePan = true;

const group=new THREE.Group();// empty groupe for add all rotation object

const params = {
  colors: {
    gradInner: '#c7c7c7', // HEX Color | Inner gradient of "boom"
    gradOuter: '#464646', // HEX Color | Outer gradient of "boom"
    lineColor: '#cd390b', // HEX Color | Default color lines
  },
  mapPoints:{
    base: '#ffffff',// HEX Color | Base map color | FOR COLOR USE #FFFFFF -> AND ANY HEX COLOR VALUE
    sizeOfPoints:0.5,// !FLOAT ONLY! | MIN: 0.1 , MAX: 0.4
    opacityOfOceanPoints:0.1,// !FLOAT ONLY! | ex. 0.1 | MIN: 0.1 - black, MAX: 0.9
    countOfPoints:25000,// INT ONLY | ex. 1000 - 40000 | The more — the more points on the planet, but the more difficult the calculations
    showBackMap:true, // BOOLEAN | Removes the view from the planet map that is in the background: ;
    showSphereToHideBackSide:false, // BOOLEAN | IF TRUE, showBackMap = false || Shows an additional sphere, as if under the map of the planet. This sphere hides the background of the map.
    hiddenShpereColor:'#0000ff',// HEX Color | If you want to disable showing the background of the planet map, then an additional object is created in the form of a sphere, which also hides some elements on the back of the planet, which is, as it were, in the background from you
    hiddenSphereOpacity:.1,
  },
  reset: ()=>controls.reset()
}
// An array for forming lines, "boom", as well as sticks (highlighting the point where the line arrives)
//The point of arrival of the line and the point from where it flies is made up of two array elements: 0, 1; 2, 3 and so on.
//In the first object of one of the points (the first one is where the line flies from), you can add some user data in order to unify the default settings

//!!! Only two values in it are mandatory: latitude and longitude
const data=[
  // This forms three objects: a line, a "boom", a stick
  {
    lat:32.622876, // REQUIRED | Float ex. 42.0 | Earth coordinate latitude
    lon:107.523152, // REQUIRED | Float ex. 42.0 | Earth coordinate longitude
    lineSpeed:2, // Integer | Default 2 | min ≈1, max ≈20 | It's speed - how fast does the animation of the line go from point A to point B
    lineWidth:1,// Float | min ≈.1, max ≈10 | Worked only on Linux system | ex. for randomization it: THREE.Math.randFloat(.5, 2).toFixed(2) | Arrives line width — https://stackoverflow.com/questions/11638883/thickness-of-lines-using-three-linebasicmaterial
    lineColor:'#ff0000',// HEX Color | Default params.colors.lineColor | Line color in HEX, ex. 0xffffff - it's white
    lineRepeats:100, // Infinity or Integer || 1, 2, 1000, Infinity | Number of line flight repetitions
    boomNeed:true,// Boolean | 'Boom' is added by default | If you do not need "boom", then set the value to false. By default, "boom" passes
    boomSpeed: 5000,// Integer | Default (some random): THREE.Math.randInt(2500, 5000) | min ≈500 , max ≈5000 || THREE.Math.randomInt(2500, 5000)
    boomRadius: 2, // Integer | Default (some random): [5 * THREE.Math.randFloat(.2, .7)] | min ≈.5 , max ≈3 || 5 * THREE.Math.randFloat(.2, .7)
    boomRepeat:100,// Infinity or Integer | Default: Infinity | 1, 2, 1000, Infinity | Number of repeats "boom"
    showStick:true, // Boolean | Default: false | A line from the point where the "boom" arrives
    stickColorTo:'#ff0000',// HEX Color | Default #ffffff | Arrives line color in HEX, ex. 0xffffff - it's white | To create gradient
    stickColorFrom:'#000000',// HEX Color | Default #ffffff | Arrives line color in HEX, ex. 0xffffff - it's white | To create gradient
    stickHeight:2, // Integer or Float | Default 1.1 | min ≈1, max ≈5 | ex. for randomization it: THREE.Math.randFloat(.5, 2).toFixed(2) | Arrives line height
    stickWidth:.2, // Float | Default 0.1 | min ≈.01, max ≈.2 | ex. for randomization it: THREE.Math.randFloat(.5, 2).toFixed(2) | Arrives line height
  },//FROM 1 China
  {lat:-26.164493,lon:134.742407},//TO   1 Australia
  // \\ This forms three objects: a line, a "boom", a stick
  {
    lat:7.466688, lon:19.987692,
    lineSpeed:5,
    lineColor:'#ff0000',
    boomNeed:true,
    boomSpeed: 3500,
    boomRadius: 3,
    boomRepeat:100,
    lineRepeats:100,
    showStick:true,
    stickColorTo:'#00ff00',
    stickColorFrom:'#ffffff',
    stickHeight:1.5,
    stickWidth:.05,
  },//FROM  2 // Central Africa
    {lat:-15.860255, lon:-58.059177},//TO 2 // Central South America

    {
      lat:48.358527, lon:-99.761561,
      lineSpeed:5,
      lineColor:'#333333',
      boomNeed:false,
      boomSpeed: 3500,
      boomRadius: 3,
      boomRepeat:100,
      lineRepeats:100,
      showStick:true,
      stickColorTo:'#0000ff',
      stickColorFrom:'#ff0000',
      stickHeight:1,
      stickWidth:.1,
  },//FROM  3 // South Amer
  {lat:76.910298, lon:-40.348415},//TO 3 // Greenland
]

const maxImpactAmount = data.length/2; // Constant for determining the number "boom"
function isFloat(n){return Number(n) === n && n % 1 !== 0;} // Flote of numbers
//Checking the correspondence of the quantity of data in the object with data. If the data is odd, then the rest of the script will not work. Since the data is probably violated.
if(!Number.isInteger(data.length/2%2)){
  throw new Error('Check data array. The number of array elements is odd!')
}

const impacts = []; // Array for "boom"
const trails = []; // Array for animated lines
let tmp=0, // For the cycle that sorting out the values of the object with the data
  tmp1=0, // ~^~
  isMapLoaded=false // Determines when the planet card is formed
const tweenGroup = new TWEEN.Group()
const easing='easeInOutSine'// https://codepen.io/kcjpop/pen/GvdQdX

for(let i=0;i<data.length/2;i++){ // The cycle that sorting out the values of the object with the data
  if( // We check the availability of strictly necessary data in the array with data
    !data[tmp1].lat
    ||!data[tmp1].lon
    ||!isFloat(data[tmp1].lat)
    ||!isFloat(data[tmp1].lon)
    ||!data[tmp1+1].lat
    ||!data[tmp1+1].lon
    ||!isFloat(data[tmp1+1].lat)
    ||!isFloat(data[tmp1+1].lon)
  ){ // If the check has not passed, then we stop the script
    console.log(data[tmp1],data[tmp1+1]);
    throw new Error('Check data lat OR lon!')
  }
  const whereItArrives=cTv(data[tmp1+1]); // Constant taking the value where the line flies
  if(!data[tmp1].stickHeight)data[tmp1].stickHeight=1.1; // Setting the default value, in the absence of data from an object with data
  if(data[tmp1].showStick){
    const material = new THREE.ShaderMaterial({//https://discourse.threejs.org/t/draw-a-line-with-a-simple-single-colour-fading-gradient/1775/32
      side:THREE.DoubleSide,
      uniforms: {
        color: {value: new THREE.Color(data[tmp1].stickColorTo || 0xffffff)},
        color2: {value: new THREE.Color(data[tmp1].stickColorFrom ||0xffffff)},
        origin: {value: new THREE.Vector3()},
        limitDistance: {value: parseInt(data[tmp1].stickHeight*5)},
      },
      linewidth:1,
        vertexShader: `
        varying vec2 vUv; // We create a variable, then to convey it to a fragmentShader
        varying vec3 vPos; // We create a variable, then to convey it to a fragmentShader
        void main(){
          vUv=uv;
          vPos = position;
          vec3 pos=position.xyz * sin(1.);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
        `,
        fragmentShader: `
        varying vec2 vUv; // We accept data from vertexShader
        uniform vec3 color; // We accept data from uniforms
        uniform vec3 color2; // We accept data from uniforms
        uniform vec3 origin; // We accept data from uniforms
        uniform float limitDistance; // We accept data from uniforms
        varying vec3 vPos; // We accept data from vertexShader
        void main() {
          vec2 center = vec2((vUv.y - 1.)*1.,(vUv.y - 1.)*1.); // We set a conditional center for one cylinder
          float distance = length(center); // Determine its size
          float opacity = smoothstep(.3,1.,distance); // We make a soft fill
          gl_FragColor = vec4(mix(color2,color, vUv.y), opacity);
        }
        `,  transparent: true, 
    });
    // Creating and positioning the cylinder - sticks
    const geometry = new THREE.CylinderBufferGeometry(0,data[tmp1].stickWidth || .1,data[tmp1].stickHeight || 1.1);
    const mesh = new THREE.Mesh( geometry, material );
    const stickHeight=data[tmp1].stickHeight*(1/data[tmp1].stickHeight+.085) || 1.05
    mesh.position.set(whereItArrives.x*stickHeight,whereItArrives.y*stickHeight,whereItArrives.z*stickHeight);
    mesh.lookAt(new THREE.Vector3()); // We ask him to look at his normal at the center of the planet
    mesh.rotateX(Math.PI * -.5); // Since it has normal in the middle, before that he was “lying” on the planet, and this code makes him stand perpendicular to it
    mesh.scale.set(0,0,0);
    group.add(mesh)
    let interval=setInterval(()=>{ // Some hack to give the opportunity to load the planet’s map itself, and then show the sticks themselves
      if(isMapLoaded){
        clearInterval(interval);
        interval=undefined
        anime({targets:mesh.scale,x:1,y:1,z:1,easing,duration:2000,}) // We animize the scale
        anime({targets:mesh.position, // We animize the position
        x:[whereItArrives.x*.9,whereItArrives.x*stickHeight],
        y:[whereItArrives.y*.9,whereItArrives.y*stickHeight],
        z:[whereItArrives.z*.9,whereItArrives.z*stickHeight],
        delay:1000,easing,duration:2000,})
      }
    },100);
  }
  const o=Object.create({ // We create an object for the subsequent creation of "boom" and lines
    prevPosition: cTv(data[tmp1]),
    impactPosition: whereItArrives,
    impactMaxRadius: parseFloat(data[tmp1].boomRadius) || 5 * THREE.Math.randFloat(.2, .7),
    impactRatio: 0,
    trailRatio: {value: 0},
    trailLength: {value: 0},
  })
  impacts.push(o);
  if(data[tmp1].boomNeed===undefined || data[tmp1].boomNeed!==false){ // If the “boom” is not indicated in the object with data for a particular object, then by default it will be shown
    new TWEEN.Tween({ value:0},tweenGroup)
    .to({ value: 1 }, parseInt(data[tmp1].boomSpeed) || THREE.Math.randInt(2500, 5000))
    .onUpdate(val => {o.impactRatio = val.value}).start().repeat(data[tmp1].boomRepeat || Infinity)
  }
  // Lines
  makeTrail(i,data[tmp1].lineColor || 0xffffff,data[tmp1].lineWidth || .1); // Creating the line itself. This function also fills the trails array
  const path = trails[i];
  const speed = data[tmp1].lineSpeed || 2;
  const t=new TWEEN.Tween({value: 0}) // We anmile "boom" and lines
  .to({value: 1}, path.geometry.attributes.lineDistance.array[99] / speed * 1000)
  .onUpdate( val => {o.trailRatio.value = val.value})
  //t.chain(w)
  t.start().repeat(data[tmp1].lineRepeats || Infinity)
  if(tmp===1){
    tmp1+=2;  tmp=0
  }else{
    tmp++;  (tmp1===0)?tmp1=2:tmp1++
  }
}
const uniforms = { // For Shader with "boom"
  impacts: {value: impacts},
  maxSize: {value: .04},
  minSize: {value: .03},
  waveHeight: {value: .125},
  scaling: {value: 2},
  gradInner: {value: new THREE.Color(params.colors.gradInner)},
  gradOuter: {value: new THREE.Color(params.colors.gradOuter)}
};
(()=>{ // Creation of the planet map
    const dummyObj = new THREE.Object3D()
    const p = new THREE.Vector3()
    const sph = new THREE.Spherical()
    const geoms = new Array()
    const tex = new THREE.TextureLoader().load('/map.jpg',()=>{
      // https://web.archive.org/web/20120107030109/http://cgafaq.info/wiki/Evenly_distributed_points_on_sphere#Spirals
      const counter = params.mapPoints.countOfPoints
      const rad = 5
      let r = 0
      const dlong = Math.PI * (3 - Math.sqrt(5))
      const dz = 2 / counter
      let long = 0
      let z = 1 - dz / 2
      for(let i = 0; i < counter; i++){
          r = Math.sqrt(1 - z * z);
          p.set( Math.cos(long) * r, z, -Math.sin(long) * r).multiplyScalar(rad);
          z = z - dz;
          long = long + dlong;
          sph.setFromVector3(p);
          dummyObj.lookAt(p);
          dummyObj.updateMatrix();
          const g =  new THREE.PlaneBufferGeometry(2, 2);
          g.applyMatrix4(dummyObj.matrix);
          g.translate(p.x, p.y, p.z);
          const centers = [
            p.x, p.y, p.z,
            p.x, p.y, p.z,
            p.x, p.y, p.z,
            p.x, p.y, p.z
          ];
          const uv = new THREE.Vector2(
            (sph.theta + Math.PI) / (Math.PI * 2),
            1. - sph.phi / Math.PI
          );
          const uvs = [
            uv.x, uv.y,
            uv.x, uv.y,
            uv.x, uv.y,
            uv.x, uv.y
          ];
          g.setAttribute("center", new THREE.Float32BufferAttribute(centers, 3));
          g.setAttribute("bUv", new THREE.Float32BufferAttribute(uvs, 2));
          geoms.push(g);
      }
      const g = BufferGeometryUtils.mergeBufferGeometries(geoms);
      if(params.mapPoints.showSphereToHideBackSide)params.mapPoints.showBackMap=false;
      let sideOfMap=(params.mapPoints.showBackMap)?THREE.DoubleSide:THREE.FrontSide;
      if(!params.mapPoints.showBackMap && params.mapPoints.showSphereToHideBackSide){ // Add sphere hide
        let isTransparent=true;
        if(params.mapPoints.hiddenSphereOpacity===undefined || params.mapPoints.hiddenSphereOpacity === 1)isTransparent=false
        scene.add(
          new THREE.Mesh(
            new THREE.IcosahedronBufferGeometry(rad-.005,16),
            new THREE.MeshBasicMaterial({
              color:params.mapPoints.hiddenShpereColor || '#000000',
              transparent:isTransparent,
              opacity:params.mapPoints.hiddenSphereOpacity || 1,
            })
          )
        )
      }
      const m = new THREE.MeshBasicMaterial({
        color: new THREE.Color(params.mapPoints.base),
        side: sideOfMap,
        transparent:true,
        onBeforeCompile: shader => {
          shader.uniforms.impacts = uniforms.impacts;
          shader.uniforms.maxSize = uniforms.maxSize;
          shader.uniforms.minSize = uniforms.minSize;
          shader.uniforms.waveHeight = uniforms.waveHeight;
          shader.uniforms.scaling = uniforms.scaling;
          shader.uniforms.gradInner = uniforms.gradInner;
          shader.uniforms.gradOuter = uniforms.gradOuter;
          shader.uniforms.tex = {value: tex};
          shader.vertexShader = `
            struct impact {
              vec3 impactPosition;
              float impactMaxRadius;
              float impactRatio;
            };
            uniform impact impacts[${maxImpactAmount}];
            uniform sampler2D tex;
            uniform float maxSize;
            uniform float minSize;
            uniform float waveHeight;
            uniform float scaling;
            attribute vec3 center;
            attribute vec2 bUv;
            varying float vFinalStep;
            varying float vMap;
            ${shader.vertexShader}
          `.replace(
              `#include <begin_vertex>`,
            `#include <begin_vertex>
            float finalStep = 0.0;
            for (int i = 0; i < ${maxImpactAmount};i++){
              float dist = distance(center, impacts[i].impactPosition);
              float curRadius = impacts[i].impactMaxRadius * impacts[i].impactRatio;
              float sstep = smoothstep(0., curRadius, dist) - smoothstep(curRadius - (.25 * impacts[i].impactRatio ), curRadius, dist);
              sstep *= 1. - impacts[i].impactRatio;
              finalStep += sstep;
            }
            finalStep = clamp(finalStep, 0., 1.);
            vFinalStep = finalStep;
            float map = texture(tex, bUv).g;
            vMap = map;
            float pSize = map < 0.5 ? maxSize : minSize;
            float scale = scaling;
            transformed = (position - center) * pSize * mix(1., scale * 1.25, finalStep) + center; // scale on wave
            transformed += normal * finalStep * waveHeight; // lift on wave
            `
          );
          shader.fragmentShader = `
            uniform vec3 gradInner;
            uniform vec3 gradOuter;
            varying float vFinalStep;
            varying float vMap;
            ${shader.fragmentShader}
            `.replace(
            `vec4 diffuseColor = vec4( diffuse, opacity );`,
            `// shaping the point, pretty much from The Book of Shaders
            vec2 hUv = (vUv - .1);
            int N = 8;
            float a = atan(hUv.x,hUv.y);
            float r = PI2/float(N);
            float d = cos(floor(.5+a/r)*r-a)*length(hUv);
            float f = cos(PI / float(N)) * .5;
            //if (d > f) discard;
            if (length(vUv - ${params.mapPoints.sizeOfPoints}) > ${params.mapPoints.sizeOfPoints}) discard;
            vec3 grad = mix(gradInner, gradOuter, clamp( d / f, 0., 1.)); // gradient
            vec3 diffuseMap = diffuse * ((vMap > .5) ? ${params.mapPoints.opacityOfOceanPoints} : 1.);
            vec3 col = mix(diffuseMap, grad, vFinalStep); // color on wave
            float opct=(vMap > .5)?${params.mapPoints.opacityOfOceanPoints}:1.;
            vec4 diffuseColor = vec4( col , opct );
            `);
        }
      });
      m.defines = {"USE_UV":""};
      o = new THREE.Mesh(g, m);
      trails.forEach(t => group.add(t));
      group.add(o);
      isMapLoaded=!isMapLoaded
    })
  })()

function makeTrail(idx,color,lineWidth){ // Creation of lines
  const pts = new Array(100 * 3).fill(0);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  const m = new THREE.LineDashedMaterial({
  	color: color || params.colors.lineColor,
    linewidth: lineWidth || 1,
    transparent: true,
  	onBeforeCompile: shader => {
    	shader.uniforms.actionRatio = impacts[idx].trailRatio;
      shader.uniforms.lineLength = impacts[idx].trailLength;
      shader.fragmentShader = `
      	uniform float actionRatio;
        uniform float lineLength;
        ${shader.fragmentShader}
      `.replace(
      	`if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}`,
        ` float halfDash = dashSize * .5;
          float currPos = (lineLength + dashSize) * actionRatio;
        	float d = (vLineDistance + halfDash) - currPos;
        	if (abs(d) > halfDash ) discard;
          float grad = ((vLineDistance + halfDash) - (currPos - halfDash)) / halfDash;
        `
      )
      .replace(
      	`vec4 diffuseColor = vec4( diffuse, opacity );`,
        `vec4 diffuseColor = vec4( diffuse, grad );`
      );
    }
  });
  const l = new THREE.Line(g, m);
  l.userData.idx = idx;
  if(impacts[idx])setPath(l, impacts[idx].prevPosition, impacts[idx].impactPosition, 1);
  trails.push(l);
}
// based on https://jsfiddle.net/prisoner849/fu59aved/
function setPath(l, startPoint, endPoint, peakHeight, cycles) {
    const pos = l.geometry.attributes.position;
    const division = pos.count - 1;
    const cycle = cycles || 1;
    const peak = peakHeight || 1;
    const radius = startPoint.length();
    const angle = startPoint.angleTo(endPoint);
    const arcLength = radius * angle;
    const diameterMinor = arcLength / Math.PI;
    const radiusMinor = (diameterMinor * 0.5) / cycle;
    const peakRatio = peak / diameterMinor;
    const radiusMajor = startPoint.length() + radiusMinor;
    const basisMajor = new THREE.Vector3().copy(startPoint).setLength(radiusMajor);
    const basisMinor = new THREE.Vector3().copy(startPoint).negate().setLength(radiusMinor);
    // triangle (start, end, center)
    const tri = new THREE.Triangle(startPoint, endPoint, new THREE.Vector3());
    const nrm = new THREE.Vector3(); // normal
    tri.getNormal(nrm);
    // rotate startPoint around normal
    const v3Major = new THREE.Vector3();
    const v3Minor = new THREE.Vector3();
    const v3Inter = new THREE.Vector3();
    const vFinal = new THREE.Vector3();
    for (let i = 0; i <= division; i++) {
        const divisionRatio = i / division;
        const angleValue = angle * divisionRatio;
        v3Major.copy(basisMajor).applyAxisAngle(nrm, angleValue);
        v3Minor.copy(basisMinor).applyAxisAngle(nrm, angleValue + Math.PI * 2 * divisionRatio * cycle);
        v3Inter.addVectors(v3Major, v3Minor);
        const newLength = ((v3Inter.length() - radius) * peakRatio) + radius;
        vFinal.copy(v3Inter).setLength(newLength);
        pos.setXYZ(i, vFinal.x, vFinal.y, vFinal.z);
    }
    pos.needsUpdate = true;
    l.computeLineDistances();
    l.geometry.attributes.lineDistance.needsUpdate = true;
    impacts[l.userData.idx].trailLength.value = l.geometry.attributes.lineDistance.array[99];
    l.material.dashSize = 7
}
function cTv(coordObj={lat:48.5125,lon:2.2055}){//coordinates to vector | Default: Paris
  const parisSpherical = {
    lat: THREE.Math.degToRad(90 - coordObj.lat),
    lon: THREE.Math.degToRad(coordObj.lon)
  };
  const radius = 5;// corresponds to the radius of the planet map
  const vector=new THREE.Vector3().setFromSphericalCoords(
    radius,
    parisSpherical.lat,
    parisSpherical.lon
  );
  return vector
}
scene.add(group) // Add a group that rotates: the map of the planet, "boom", lines, sticks

window.addEventListener( 'resize', onWindowResize )

renderer.setAnimationLoop( () => {
  TWEEN.update()
  tweenGroup.update()
  group.rotation.y += 0.001
  renderer.render(scene, camera)
})

//Fix to compute canvas width/height
setTimeout(()=>{onWindowResize()},1)

function onWindowResize() {
  const sizes = {width: parseInt(window.getComputedStyle(ca_nvas).width),  height: parseInt(window.getComputedStyle(ca_nvas).height)};
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize( sizes.width , sizes.height );
}
