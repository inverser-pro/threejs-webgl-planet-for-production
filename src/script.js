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
    base: 0xffffff,// Base map color | FOR COLOR USE 0x -> FFFFFF -> AND ANY HEX COLOR VALUE
    gradInner: 0xc7c7c7, // Inner gradient of "boom"
    gradOuter: 0x464646, // Outer gradient of "boom"
    lineColor: 0xcd390b, // Color lines
  },
  mapPoints:{
    sizeOfPoints:0.3,// FLOAT ONLY | MIN: 0.1 , MAX: 0.4
    opacityOfOceanPoints:0.1,// FLOAT ONLY ex. 0.1 | MIN: 0.1 - black, MAX: 0.9
    countOfPoints:25000,// INT ONLY ex. 1000 - 40000
    showBackMap:false, // BOOLEAN | Removes the view from the planet map that is in the background
    showSphereToHideBackSide:false, // BOOLEAN | IF TRUE, showBackMap = false || Shows an additional sphere, as if under the map of the planet. This sphere hides the background of the map.
    hiddenShpereColor:0x0000ff,// 0xHEX | If you want to disable showing the background of the planet map, then an additional object is created in the form of a sphere, which also hides some elements on the back of the planet, which is, as it were, in the background from you
  },
  reset: ()=>controls.reset()
}

const data=[
  {
    lat:32.622876, // REQUIRED | Earth coordinate latitude
    lon:107.523152, // REQUIRED | Earth coordinate longitude
    lineSpeed:5, // Integer | Default 2 | min ≈1, max ≈20 | It's speed - how fast does the animation of the line go from point A to point B
    lineWidth:2,// Float | min ≈.1, max ≈10 | ex. for randomization it: THREE.Math.randFloat(.5, 2).toFixed(2) | Arrives line width
    lineColor:0xcccccc,// Color | Default params.colors.lineColor | Line color in HEX, ex. 0xffffff - it's white
    boomNeed:false,// Boolean || If you do not need "boom", then set the value to false. By default, "boom" passes
    boomSpeed: 3500,// Integer | min ≈500 , max ≈5000 || THREE.Math.randomInt(2500, 5000)
    boomRadius: 3, // Integer | min ≈.5 , max ≈3 || 5 * THREE.Math.randFloat(.2, .7)
    repeatBoom:100,// Infinity or Integer || 1, 2, 1000, Infinity | Number of repeats "boom"
    repeatLineGo:100, // Infinity or Integer || 1, 2, 1000, Infinity | Number of line flight repetitions
    showStick:true, // Boolean || A line from the point where the "boom" arrives
    stickColor:0xff0000,// Color | Arrives line color in HEX, ex. 0xffffff - it's white
    stickHeight:1.1, // min ≈1.1, max ≈5 | ex. for randomization it: THREE.Math.randFloat(.5, 2).toFixed(2) | Arrives line height
    stickWidth:.01, // Float | min ≈.001, max ≈10 | ex. for randomization it: THREE.Math.randFloat(.5, 2).toFixed(2) | Arrives line height
  },//FROM 1 China
  {lat:-26.164493,lon:134.742407},//TO   1 Australia

  {
    lat:7.466688, lon:19.987692, // Earth coordinate longitude
    lineSpeed:5, // How fast does the animation of the line go from point A to point B
    lineColor:0xff0000,
    boomNeed:true,
    boomSpeed: 3500,//500 - 5000 || THREE.Math.randomInt(2500, 5000)
    boomRadius: 3, // .5 - 3 || 5 * THREE.Math.randFloat(.2, .7)
    repeatBoom:100,
    repeatLineGo:100,
    showStick:true,
    stickColor:0x00ff00,
    stickHeight:3,
    stickWidth:4,
  },//FROM  2 // Central Africa
    {lat:-15.860255, lon:-58.059177},//TO 2 // Central South America

    {
      lat:48.358527, lon:-99.761561, // Earth coordinate longitude
      lineSpeed:5, // How fast does the animation of the line go from point A to point B
      lineColor:0x333333,
      boomNeed:false,
      boomSpeed: 3500,//500 - 5000 || THREE.Math.randomInt(2500, 5000)
      boomRadius: 3, // .5 - 3 || 5 * THREE.Math.randFloat(.2, .7)
      repeatBoom:100,
      repeatLineGo:100,
      showStick:true,
      stickColor:0x333333,
      stickHeight:1,
      stickWidth:.1,
  },//FROM  3 // South Amer
  {lat:76.910298, lon:-40.348415},//TO 3 // Greenland
]

const maxImpactAmount = data.length/2;
function isFloat(n){
  return Number(n) === n && n % 1 !== 0;
}
if(!Number.isInteger(data.length/2%2)){
  throw new Error('Check data array. The number of array elements is odd!')
}

const impacts = [];
const trails = [];
let tmp=0,tmp1=0,isMapLoaded=false
const tweenGroup = new TWEEN.Group()
const easing='easeInOutSine'// https://codepen.io/kcjpop/pen/GvdQdX

for(let i=0;i<data.length/2;i++){
  if(
    !data[tmp1].lat
    ||!data[tmp1].lon
    ||!isFloat(data[tmp1].lat)
    ||!isFloat(data[tmp1].lon)
    ||!data[tmp1+1].lat
    ||!data[tmp1+1].lon
    ||!isFloat(data[tmp1+1].lat)
    ||!isFloat(data[tmp1+1].lon)
  ){
    console.log(data[tmp1],data[tmp1+1]);
    throw new Error('Check data lat OR lon!')
  }
  const whereItArrives=cTv(data[tmp1+1]);
  if(data[tmp1].showStick){

    const material = new THREE.ShaderMaterial({//https://discourse.threejs.org/t/draw-a-line-with-a-simple-single-colour-fading-gradient/1775/32
      uniforms: {
        color: {
          value: new THREE.Color(data[tmp1].stickColor || 0xffffff)
        },
        origin: {
          value: new THREE.Vector3()
        }
      },
      linewidth:5,
        vertexShader: `
        varying vec3 vPos;
    void main() 
    {
      vPos = position;
      vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * modelViewPosition;
    }`,
        fragmentShader: `uniform vec3 origin;
        uniform vec3 color;
        varying vec3 vPos;
        float limitDistance = 7.0;
        void main() {
          float distance = clamp(length(vPos - origin), 0., limitDistance);
          float opacity = 1. - distance / limitDistance;
          gl_FragColor = vec4(color, opacity);
        }`,
            transparent:true,opacity: 1,depthWrite:false,
    });

    const points = [];
    let height=2//data[tmp1].stickHeight || 1.5;
    if(height===1 || height < 1)height=1.2
    points.push( new THREE.Vector3( whereItArrives.x,whereItArrives.y,whereItArrives.z ) );
    points.push( new THREE.Vector3( whereItArrives.x*height,whereItArrives.y*height,whereItArrives.z*height ) );

    const geometry = new THREE.BufferGeometry().setFromPoints( points );
    const line = new THREE.Line( geometry, material );
    line.lookAt(new THREE.Vector3());
    group.add(line)
    //const cylinder=new THREE.Mesh(
    //  new THREE.BoxBufferGeometry(
    //    data[tmp1].stickWidth || .01,
    //    data[tmp1].stickWidth || .01,
    //    data[tmp1].stickHeight || .5
    //  ),
    //  material
    //  //new THREE.MeshBasicMaterial({
    //  //  color:data[tmp1].stickColor || 0xffffff,
    //  //  side:THREE.FrontSide,
    //  //  transparent:true,
    //  //  opacity: 0,
    //  //})
    //)
    //const stickHeight=data[tmp1].stickHeight*(1/data[tmp1].stickHeight+.1) || 1.05
    //cylinder.position.set(whereItArrives.x*stickHeight,whereItArrives.y*stickHeight,whereItArrives.z*stickHeight);
    //cylinder.lookAt(new THREE.Vector3());
    //if(group)group.add(cylinder)
    //let interval=setInterval(()=>{
    //  if(isMapLoaded){
    //    clearInterval(interval);
    //    interval=undefined
    //    anime({targets:cylinder.scale,z:[.5,1],delay:100,easing,duration:2000,})
    //    anime({targets:cylinder.material,opacity:[0,1],delay:100,easing,duration:2000})
    //    anime({targets:cylinder.position,
    //    x:[whereItArrives.x*1.09,whereItArrives.x*stickHeight],
    //    y:[whereItArrives.y*1.09,whereItArrives.y*stickHeight],
    //    z:[whereItArrives.z*1.09,whereItArrives.z*stickHeight],
    //    delay:100,easing,duration:2000,})
    //  }
    //},100);
  }
  const o=Object.create({
    prevPosition: cTv(data[tmp1]),
    impactPosition: whereItArrives,
    impactMaxRadius: parseFloat(data[tmp1].boomRadius) || 5 * THREE.Math.randFloat(.2, .7),
    impactRatio: 0,
    trailRatio: {value: 0},
    trailLength: {value: 0},
  })
  impacts.push(o);
  if(data[tmp1].boomNeed===undefined || data[tmp1].boomNeed!==false){
    new TWEEN.Tween({ value:0},tweenGroup)
    .to({ value: 1 }, parseInt(data[tmp1].boomSpeed) || THREE.Math.randInt(2500, 5000))
    .onUpdate(val => {
      o.impactRatio = val.value;
    }).start().repeat(data[tmp1].repeatBoom || Infinity)
  }
  // Lines
  makeTrail(i,data[tmp1].lineColor || 0xffffff,data[tmp1].lineWidth || .1);
  const path = trails[i];
  const speed = data[tmp1].lineSpeed || 2;
  const t=new TWEEN.Tween({value: 0})
  .to({value: 1}, path.geometry.attributes.lineDistance.array[99] / speed * 1000)
  .onUpdate( val => {
    o.trailRatio.value = val.value;
  })
  //t.chain(w)
  t.start().repeat(data[tmp1].repeatLineGo || Infinity)
  if(tmp===1){
    tmp1+=2;  tmp=0
  }else{
    tmp++;  (tmp1===0)?tmp1=2:tmp1++
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
      let sideOfMap=(params.mapPoints.showBackMap)?THREE.DoubleSide:THREE.FrontSide;
      if(params.mapPoints.showSphereToHideBackSide)params.mapPoints.showBackMap=false;
      if(!params.mapPoints.showBackMap){ // Add sphere hide
        scene.add(
          new THREE.Mesh(
            new THREE.IcosahedronBufferGeometry(rad-.005,16),
            new THREE.MeshBasicMaterial({color:params.mapPoints.hiddenShpereColor})
          )
        )
      }
      const m = new THREE.MeshBasicMaterial({
        color: new THREE.Color(params.colors.base),
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

function makeTrail(idx,color,lineWidth){
  const pts = new Array(100 * 3).fill(0);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  const m = new THREE.LineDashedMaterial({
  	color: color || params.colors.lineColor,
    linewidth: lineWidth,
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
scene.add(group)

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
