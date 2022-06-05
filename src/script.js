import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import {BufferGeometryUtils} from 'three/examples/jsm/utils/BufferGeometryUtils'
import {TWEEN} from 'three/examples/jsm/libs/tween.module.min'

//import * as dat from 'dat.gui'

//const gui = new dat.GUI()
let o;
const scene = new THREE.Scene();
//scene.background = new THREE.Color('blue');
const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.01, 50);
camera.position.set(0, 10, 10);
const renderer = new THREE.WebGLRenderer({antialias: true,alpha: true});
renderer.setSize(innerWidth, innerHeight);

renderer.setClearColor(0x000000, 0);

document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = true;

// our code
const group=new THREE.Group();// empty groupe for add all rotation object

const params = {
  colors: {
    base: "#ffffff",
    gradInner: "#ff0022",
    gradOuter: "#00ff00"
  },
  mapPoints:{
    sizeOfPoints:.3,// FLOAT ONLY | MIN: 0.1 , MAX: 0.4
    opacityOfOceanPoints:.1,// FLOAT ONLY ex. .1 | MIN: 0.1 - black, MAX: 0.9
    countOfPoints:25000,// INT ONLY ex. 1000 - 40000
  },
  reset: ()=>controls.reset()
}


//const tmpFrom={lat:32.622876, lon:107.523152}//Китай
//const tmpTo={lat:-26.164493,lon:134.742407}//Австралия

const positions=[
  {lat:32.622876, lon:107.523152},//FROM 1 China
  {lat:-26.164493,lon:134.742407},//TO   1 Australia

  {lat:7.466688, lon:19.987692},//FROM  2 // Central Africa
  {lat:-15.860255, lon:-58.059177},//TO 2 // Central South America

  {lat:48.358527, lon:-99.761561},//FROM  2 // South Amer
  {lat:76.910298, lon:-40.348415},//TO 2 // Greenland
]

const maxImpactAmount = positions.length/2;
function isFloat(n){
  return Number(n) === n && n % 1 !== 0;
}
if(!Number.isInteger(positions.length/2%2)){
  throw new Error('Check positions array. The number of array elements is odd!')
}
// 
const impacts = [];
const trails = new Array();
//const tweens = new Array();


let tmp=0,tmp1=0
const tweenGroup = new TWEEN.Group()
for(let i=0;i<positions.length/2;i++){
  if(
    !positions[tmp1].lat
    ||!positions[tmp1].lon
    ||!isFloat(positions[tmp1].lat)
    ||!isFloat(positions[tmp1].lon)
    ||!positions[tmp1+1].lat
    ||!positions[tmp1+1].lon
    ||!isFloat(positions[tmp1+1].lat)
    ||!isFloat(positions[tmp1+1].lon)
  ){
    console.log(positions[tmp1],positions[tmp1+1]);
    throw new Error('Check positions lat OR lon!')
  }
  const o=Object.create({
    prevPosition: cTv(positions[tmp1]),
    impactPosition: cTv(positions[tmp1+1]),
    impactMaxRadius: 5 * THREE.Math.randFloat(.2, .7),
    impactRatio: 0,
    trailRatio: {value: 0},
    trailLength: {value: 0},
  })
  impacts.push(o);
  //JFT
/*   const g_=new THREE.BoxBufferGeometry(.1,.1,.1)
  const m_=new THREE.Mesh(g_,
      new THREE.MeshBasicMaterial({color:new THREE.Color(THREE.Math.randFloat(0, 1),THREE.Math.randFloat(.5,1),THREE.Math.randFloat(.5,1))})
  )
  const ppp=cTv(positions[tmp1+1])
  m_.position.set(ppp.x,ppp.y,ppp.z)
  if(group)group.add(m_) */
  // \ JFT
  // Wave
  /* const w= */new TWEEN.Tween({ value:0},tweenGroup)
  .to({ value: 1 }, THREE.Math.randInt(2500, 5000))
  .onUpdate(val => {
    o.impactRatio = val.value;
  }).start().repeat(Infinity)

  // Lines
  makeTrail(i);
  const path = trails[i];
  const speed = 2;
  const t=new TWEEN.Tween({value: 0})
  .to({value: 1}, path.geometry.attributes.lineDistance.array[99] / speed * 1000)
  .onUpdate( val => {
    o.trailRatio.value = val.value;
  })
  //t.chain(w)
  t.start().repeat(Infinity)
  if(tmp===1){
    tmp1+=2
    tmp=0
  }else{
    tmp++
    (tmp1===0)?tmp1=2:tmp1++
  }
}
const uniforms = {
  impacts: {value: impacts},
  maxSize: {value: .04},
  minSize: {value: .03},
  waveHeight: {value: .125},
  scaling: {value: 2},
  gradInner: {value: new THREE.Color(params.colors.gradInner)},
  gradOuter: {value: new THREE.Color(params.colors.gradOuter)}
};
(()=>{
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
      const m = new THREE.MeshBasicMaterial({
        color: new THREE.Color(params.colors.base),
        side: THREE.DoubleSide,
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
              float sstep = smoothstep(0., curRadius, dist) - smoothstep(curRadius - ( 0.25 * impacts[i].impactRatio ), curRadius, dist);
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
    })
  })()

function makeTrail(idx){
  const pts = new Array(100 * 3).fill(0);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  const m = new THREE.LineDashedMaterial({
  	color: params.colors.gradOuter,
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
        ` float halfDash = dashSize * 0.5;
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
  setPath(l, impacts[idx].prevPosition, impacts[idx].impactPosition, 1);
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
  //LESS 2-12
 function cTv(coordObj={lat:48.5125,lon:2.2055}){//coordinates to vector | Default: Paris
  const parisSpherical = {
    lat: THREE.Math.degToRad(90 - coordObj.lat),
    lon: THREE.Math.degToRad(coordObj.lon)
  };
  const radius = 5;// соответствует радиусу карты планеты
  const vector=new THREE.Vector3().setFromSphericalCoords(
    radius,
    parisSpherical.lat,
    parisSpherical.lon
  );
  return vector
}
  // \ LESS 2-12
scene.add(group)

// \ our code

window.addEventListener( 'resize', onWindowResize )

renderer.setAnimationLoop( () => {
  // our code
  TWEEN.update()
  tweenGroup.update()
  group.rotation.y += 0.001
  // \
  renderer.render(scene, camera)
})




function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}
