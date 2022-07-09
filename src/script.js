
import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import {BufferGeometryUtils} from 'three/examples/jsm/utils/BufferGeometryUtils'
import {TWEEN} from 'three/examples/jsm/libs/tween.module.min'
// JFT [Just for test]
import Stats from 'three/examples/jsm/libs/stats.module'
// \ JFT
import { TTFLoader } from 'three/examples/jsm/loaders/TTFLoader'
import { TextGeometry } from 'three/src/geometries/TextGeometry'
import { FontLoader } from 'three/src/loaders/FontLoader'
//import { FontLoader } from '../src/FontLoader';

import anime from 'animejs/lib/anime'
//import * as dat from 'dat.gui'

//const gui = new dat.GUI()
const dc=document;
const cns=dc.querySelector('.webgl');
if(!cns)throw 'no canvas.webgl';
const sizes = {width: parseInt(window.getComputedStyle(cns).width),  height: parseInt(window.getComputedStyle(cns).height)}


let o;
const scene = new THREE.Scene();
//scene.background = new THREE.Color('blue');
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.01, 50);
camera.position.set(0, 10, 5);
const renderer = new THREE.WebGLRenderer({canvas:cns,antialias: true,alpha: true});
renderer.setSize(sizes.width , sizes.height);

renderer.setClearColor(0x000000, 0);

const controls = new OrbitControls(camera, renderer.domElement);
//controls.enablePan = true;

/* const light = new THREE.DirectionalLight(0xffffff,1)
scene.add(light) */

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
  font:'/fonts/Cuprum-VariableFont_wght.ttf',
  reset: ()=>controls.reset()
}
// An array for forming lines, "boom", as well as sticks (highlighting the point where the line arrives)
//The point of arrival of the line and the point from where it flies is made up of two array elements: 0, 1; 2, 3 and so on.
//In the first object of one of the points (the first one is where the line flies from), you can add some user data in order to unify the default settings

//!!! Only two values in it are mandatory: latitude and longitude
const data=[
  // This forms three objects: a line, a "boom", a stick
  { // FROM CHINA
    lat:32.622876, // REQUIRED | Float ex. 42.0 | Earth coordinate latitude
    lon:107.523152, // REQUIRED | Float ex. 42.0 | Earth coordinate longitude
    lineSpeed:2, // Integer | Default 2 | min ≈1, max ≈20 | It's speed - how fast does the animation of the line go from point A to point B
    lineWidth:1,// Float | min ≈.1, max ≈10 | Worked only on Linux system | ex. for randomization it: THREE.Math.randFloat(.5, 2).toFixed(2) | Arrives line width — https://stackoverflow.com/questions/11638883/thickness-of-lines-using-three-linebasicmaterial
    lineColor:'#ff0000',// HEX Color | Default params.colors.lineColor | Line color in HEX, ex. 0xffffff - it's white
    lineRepeats:100, // Infinity or Integer || 1, 2, 1000, Infinity | Number of line flight repetitions
    boomNeed:true,// Boolean | 'Boom' is added by default | If you do not need "boom", then set the value to false. By default, "boom" passes
    boomSpeed: 4999,// Integer | Default (some random): THREE.Math.randInt(2500, 5000) | min ≈500 , max ≈5000 || THREE.Math.randomInt(2500, 5000)
    boomRadius: 2, // Integer | Default (some random): [5 * THREE.Math.randFloat(.2, .7)] | min ≈.5 , max ≈3 || 5 * THREE.Math.randFloat(.2, .7)
    boomRepeat:Infinity,// Infinity or Integer | Default: Infinity | 1, 2, 1000, Infinity | Number of repeats "boom"
    showStick:true, // Boolean | Default: false | A line from the point where the "boom" arrives
    stickColorTo:'#ffffff',// HEX Color | Default #ffffff | Arrives line color in HEX, ex. 0xffffff - it's white | To create gradient
    stickColorFrom:'#ffffff',// HEX Color | Default #ffffff | Arrives line color in HEX, ex. 0xffffff - it's white | To create gradient
    stickHeight:2, // Integer or Float | Default 1.1 | min ≈1, max ≈5 | ex. for randomization it: THREE.Math.randFloat(.5, 2).toFixed(2) | Arrives line height
    stickWidth:.02, // Float | Default 0.1 | min ≈.01, max ≈.2 | ex. for randomization it: THREE.Math.randFloat(.5, 2).toFixed(2) | Arrives line height
    // NEW
    text:`China, Pekin | Běijīng | 北京
132`, // String | Max: 50 symbol | ex. 'This is Pekin'
    textColor: '#ff0000', // HEX Color | Default #ffffff
    textSize: .1, // Float | Default: .1 | Depending on the size of the text, an underlay is formed on the background of the text
    textBgColor: '#0086ff', // HEX Color | Default #0086ff | If this parameter is present, then we add a plan from behind
    textStickColor: '#00aa00', // HEX Color | Default #ff00ff
    textDistance: 1.3, // Float | Default 0.1 | min ≈.01, max ≈2 | Distance from the surface of the planet to the text
    to:{lat:-26.164493,lon:134.742407},//TO   1 Australia
  },
  
  // \\ This forms three objects: a line, a "boom", a stick
  {
    lat:7.466688, lon:19.987692,//FROM  2 // Central Africa
    lineSpeed:2,
    lineColor:'#ff0000',
    lineRepeats:Infinity,
    boomNeed:true,
    boomSpeed: 3500,
    boomRadius: 2,
    boomRepeat:100,
    showStick:true,
    stickColorTo:'#00ff00',
    stickColorFrom:'#ffffff',
    stickHeight:1.5,
    stickWidth:.05,
    // NEW
    text:'Central Africa', // String | Max: 50 symbol | ex. 'This is Pekin'
    textColor: '#00cc99', // HEX Color | Default #ffffff
    textSize: .3, // Float | Default: .1 | Depending on the size of the text, an underlay is formed on the background of the text
    textBgColor: '#ffffff', // HEX Color | Default #0086ff
    textStickColor: '#ff00ff', // HEX Color | Default #ffffff
    to:{lat:-15.860255, lon:-58.059177},//TO 2 // Central South America
  },

  {
    lat:48.358527, lon:-99.761561,//FROM  3 // South Amer
    lineSpeed:2,
    lineColor:'#00f96f',
    boomNeed:true,
    boomSpeed: 2500,
    boomRadius: 3,
    boomRepeat:Infinity,
    lineRepeats:Infinity,
    showStick:true,
    stickColorTo:'#0000ff',
    stickColorFrom:'#ff0000',
    stickHeight:1,
    stickWidth:.1,
    // NEW
    text:`South Amer
Souls: 0;
Mines: 1e5`, // String | Max: 50 symbol | ex. 'This is Pekin'
    textColor: '#ff00aa', // HEX Color | Default #ffffff
    textSize: .07, // Float | Default: .1 | Depending on the size of the text, an underlay is formed on the background of the text
    textBgColor: '#ffffff', // HEX Color | Default #0086ff
    textStickColor: '#ff00ff', // HEX Color | Default #ffffff
    to:{lat:76.910298, lon:-40.348415},//TO 3 // Greenland
  },

  {
    lat:65.242150, lon:149.801448, // FROM 4 East RU
    lineSpeed:2, // Integer | Default 2 | min ≈1, max ≈20 | It's speed - how fast does the animation of the line go from point A to point B
    lineWidth:1,// Float | min ≈.1, max ≈10 | Worked only on Linux system | ex. for randomization it: THREE.Math.randFloat(.5, 2).toFixed(2) | Arrives line width — https://stackoverflow.com/questions/11638883/thickness-of-lines-using-three-linebasicmaterial
    lineColor:'#ff0000',// HEX Color | Default params.colors.lineColor | Line color in HEX, ex. 0xffffff - it's white
    lineRepeats:100, // Infinity or Integer || 1, 2, 1000, Infinity | Number of line flight repetitions
    boomNeed:true,// Boolean | 'Boom' is added by default | If you do not need "boom", then set the value to false. By default, "boom" passes
    boomSpeed: 2000,// Integer | Default (some random): THREE.Math.randInt(2500, 5000) | min ≈500 , max ≈5000 || THREE.Math.randomInt(2500, 5000)
    boomRadius: 3, // Integer | Default (some random): [5 * THREE.Math.randFloat(.2, .7)] | min ≈.5 , max ≈3 || 5 * THREE.Math.randFloat(.2, .7)
    boomRepeat:Infinity,// Infinity or Integer | Default: Infinity | 1, 2, 1000, Infinity | Number of repeats "boom"
    showStick:true, // Boolean | Default: false | A line from the point where the "boom" arrives
    stickColorTo:'#ffffff',// HEX Color | Default #ffffff | Arrives line color in HEX, ex. 0xffffff - it's white | To create gradient
    stickColorFrom:'#ffffff',// HEX Color | Default #ffffff | Arrives line color in HEX, ex. 0xffffff - it's white | To create gradient
    stickHeight:2, // Integer or Float | Default 1.1 | min ≈1, max ≈5 | ex. for randomization it: THREE.Math.randFloat(.5, 2).toFixed(2) | Arrives line height
    stickWidth:.02, // Float | Default 0.1 | min ≈.01, max ≈.2 | ex. for randomization it: THREE.Math.randFloat(.5, 2).toFixed(2) | Arrives line height
    // NEW
    text:`I Love USA`, // String | Max: 50 symbol | ex. 'This is Pekin'
    textColor: '#ff0000', // HEX Color | Default #ffffff
    textSize: .1, // Float | Default: .1 | Depending on the size of the text, an underlay is formed on the background of the text
    textBgColor: '#f9f9f9', // HEX Color | Default #0086ff | If this parameter is present, then we add a plan from behind
    textStickColor: '#ffffff', // HEX Color | Default #ff00ff
    textDistance: 1.1, // Float | Default 0.1 | min ≈.01, max ≈2 | Distance from the surface of the planet to the text
    to:{lat:38.870829359139556, lon: -77.05594503672475},//TO 4 // Washington
    //to:{lat:7.952571, lon:-73.546554},//TO 4 // Washington
  },
];

const maxImpactAmount = data.length; // Constant for determining the number "boom"
function isFloat(n){return Number(n) === n && n % 1 !== 0;} // Flote of numbers

// TRY FONT
function createText(text='Default text',pos=[0,0,0],rotY=Math.PI,size=.1,font,multiplyScalar=1,color=0xffffff,bgPlane,textStickColor){
  // bgPlane — If this parameter is present, then we add a plan from behind
  const text_=new String(text);
  const textGeo = new TextGeometry(text_,{
    font,  size,  height: .004,  curveSegments:1
  } );
  const textMaterial=new THREE.MeshBasicMaterial({color,side:THREE.FrontSide});
  // TEXT OBJ
  text=new THREE.Mesh(textGeo,textMaterial);
  text.position.set(pos[0],pos[1],pos[2]).multiplyScalar(multiplyScalar);
  text.lookAt(new THREE.Vector3())
  text.rotateY(rotY)
  text.translateY(.1)
  text.translateX(.5)
// https://stackoverflow.com/questions/33758313/get-size-of-object3d-in-three-js
  const bbox = new THREE.Box3().setFromObject(text);
  const widthZ=bbox.max.z-bbox.min.z
  anime({targets:text.scale,x:[0,1],y:[0,1],z:[0,1],duration:4000,easing})
  if(bgPlane){
    let factor=2
    const len = (text_.match(/\n/g)||[]).length
    if(len)factor*=len+1
    const x = 0;  const y = 0
    const width = widthZ*2/1.4
    const height = size*factor
    const radius = size*.8
    const shape = new THREE.Shape();// https://stackoverflow.com/questions/65567873/create-a-plane-with-curved-edges-using-planegeometry-three-js
    shape.moveTo( x, y + radius );
    shape.lineTo( x, y + height - radius );
    shape.quadraticCurveTo( x, y + height, x + radius, y + height );
    shape.lineTo( x + width - radius, y + height );
    shape.quadraticCurveTo( x + width, y + height, x + width, y + height - radius );
    shape.lineTo( x + width, y + radius );
    shape.quadraticCurveTo( x + width, y, x + width - radius, y );
    shape.lineTo( x + radius, y );
    shape.quadraticCurveTo( x, y, x, y + radius )
    // PLANE OBJ
    const plane = new THREE.Mesh( new THREE.ShapeBufferGeometry( shape ),  new THREE.MeshBasicMaterial({color:bgPlane || 0x0086ff,side:THREE.DoubleSide}))
    plane.translateY(-height/3.5*factor/2.5)
    plane.translateX(-.05)
    plane.translateZ(-.001)
    text.add(plane)
    if(textStickColor){
      /* const points=[]
      points.push(new THREE.Vector3(pos[0],pos[1],pos[2]))
      points.push(new THREE.Vector3(text.position.x,text.position.y,text.position.z))
      // LINE OBJ
      const line = new THREE.Line( new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({transparent:true, color:textStickColor || 0x0086ff}))
      group.add(line) */
      //anime({targets:line.material,opacity:[0,1],duration:4000,easing})

      // PLANE OBJ
      /* const height_=new THREE.Vector3(pos[0],pos[1],pos[2]).distanceTo(new THREE.Vector3(text.position.x,text.position.y,text.position.z));
      const plane_=new THREE.Mesh(
        new THREE.PlaneGeometry(height_,height_),
        new THREE.MeshBasicMaterial({color:textStickColor || 0x0086ff,side:THREE.DoubleSide})
      )
      plane_.position.set(text.position.x,text.position.y,text.position.z).multiplyScalar(multiplyScalar/1.15)
      plane_.lookAt(new THREE.Vector3)
      plane_.rotateX(Math.PI/2)
      group.add(plane_) */
//      const shape = new THREE.Shape()
//
//      const x = 0
//      const y = 0
//
//      shape.moveTo(x - .5, y - .5)
//      shape.lineTo(x + .5, y - 1)
//      shape.lineTo(x, y)
//
//      const TriangleGeometry = new THREE.ShapeGeometry(shape)
//      const Triangle=new THREE.Mesh(
//        TriangleGeometry,
//        new THREE.MeshBasicMaterial({color:textStickColor || 0x0086ff,side:THREE.DoubleSide})
//      )
//      Triangle.position.set(text.position.x,text.position.y,text.position.z)//.multiplyScalar(multiplyScalar/1.15)
//      Triangle.lookAt(new THREE.Vector3)
//      group.add(Triangle)
      // point for line
      const point = new THREE.Mesh(
        new THREE.CircleGeometry(size/15,12),
        new THREE.MeshBasicMaterial()
      )
      point.position.set(text.position.x,text.position.y,text.position.z)
      point.rotation.set(text.rotation.x,text.rotation.y,text.rotation.z)
      //point.lookAt(new THREE.Vector3)
      point.translateY(.1)
      point.translateZ(-.01)
      // POINT OBJ
      group.add(point)

      // JFT
      const geom = new THREE.BufferGeometry();
      const two=new THREE.Vector3(point.position.x,point.position.y,point.position.z)
/* console.log(plane.geometry.attributes.position.array[0],plane.geometry.attributes.position.array[1],plane.geometry.attributes.position.array[2],
  ); */
      geom.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array( [
          text.position.x,text.position.y,text.position.z,
          two.x,two.y,two.z,
          pos[0],pos[1],pos[2],
        ])
        , 3 ) )
      const pointer = new THREE.Mesh(
        geom,  new THREE.MeshBasicMaterial({color:textStickColor || 0x0086ff,side:THREE.DoubleSide})
      );
      group.add(pointer);
      point.remove()

      // \ JFT
    }
  }
  group.add(text);
}

let font
const ttfLoader = new TTFLoader()
const fontLoader = new FontLoader()
ttfLoader.load(
  params.font,
  fnt=>{
      fnt=fontLoader.parse(fnt)
      font=fnt
    }
)
// \ TRY FONT


const impacts = []; // Array for "boom"
const trails = []; // Array for animated lines
let tmp=0, // For the cycle that sorting out the values of the object with the data
  tmp1=0, // ~^~
  isMapLoaded=false // Determines when the planet card is formed
const tweenGroup = new TWEEN.Group()
const easing='easeInOutSine'// https://codepen.io/kcjpop/pen/GvdQdX

for(let i=0;i<data.length;i++){ // The cycle that sorting out the values of the object with the data
  if( // We check the availability of strictly necessary data in the array with data
    !data[i].lat
    ||!data[i].lon
    ||!isFloat(data[i].lat)
    ||!isFloat(data[i].lon)
    ||!data[i].to.lat
    ||!data[i].to.lon
    ||!isFloat(data[i].to.lat)
    ||!isFloat(data[i].to.lon)
  ){ // If the check has not passed, then we stop the script
    console.log(data[i],data[i].to);
    throw new Error('Check data lat OR lon!')
  }
  const whereItArrives=cTv(data[i].to); // Constant taking the value where the line flies
  if(!data[i].stickHeight)data[i].stickHeight=1.1; // Setting the default value, in the absence of data from an object with data
  if(data[i].showStick){
    const material = new THREE.ShaderMaterial({//https://discourse.threejs.org/t/draw-a-line-with-a-simple-single-colour-fading-gradient/1775/32
      side:THREE.DoubleSide,
      uniforms: {
        color: {value: new THREE.Color(data[i].stickColorTo || 0xffffff)},
        color2: {value: new THREE.Color(data[i].stickColorFrom ||0xffffff)},
        origin: {value: new THREE.Vector3()},
        limitDistance: {value: parseInt(data[i].stickHeight*5)},
      },
      vertexShader: `
      varying vec2 vUv; // We create a variable, then to convey it to a fragmentShader
      varying vec3 vPos; // We create a variable, then to convey it to a fragmentShader
      void main(){
        vUv=uv;
        vPos = position;
        vec3 pos=position.xyz * sin(1.);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }`,
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
      }`,  transparent: true, 
    });
    // Creating and positioning the cylinder - sticks
    const geometry = new THREE.CylinderBufferGeometry(0,data[i].stickWidth || .1,data[i].stickHeight || 1.1);
    const mesh = new THREE.Mesh( geometry, material );
    const stickHeight=data[i].stickHeight*(1/data[i].stickHeight+.085) || 1.05
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
  const o_=Object.create({ // We create an object for the subsequent creation of "boom" and lines
    prevPosition: cTv(data[i]),
    impactPosition: whereItArrives,
    impactMaxRadius: parseFloat(data[i].boomRadius) || 5 * THREE.Math.randFloat(.2, .7),
    impactRatio: 0,
    trailRatio: {value: 0},
    trailLength: {value: 0},
  })
  impacts.push(o_)
  if(data[i].boomNeed===undefined || data[i].boomNeed!==false){ // If the “boom” is not indicated in the object with data for a particular object, then by default it will be shown
    new TWEEN.Tween({ value:0})
    .to({ value: 1 }, parseInt(data[i].boomSpeed) || THREE.Math.randInt(2500, 5000))
    .onUpdate(val=>{o_.impactRatio = val.value}).start().repeat(data[i].boomRepeat || Infinity)
  }
  // Lines
  makeTrail(i,data[i].lineColor || 0xffffff,data[i].lineWidth || .1); // Creating the line itself. This function also fills the trails array
  const path = trails[i];
  const speed = data[i].lineSpeed || 2;
  const t=new TWEEN.Tween({value: 0}) // We anmile "boom" and lines
  .to({value: 1}, path.geometry.attributes.lineDistance.array[99] / speed * 1000)
  .onUpdate( val => {o_.trailRatio.value = val.value})
  //t.chain(w)
  t.start().repeat(data[i].lineRepeats || Infinity)

// TRY ADD FONT AND MORE...
  const forText=Object.create({
    text:data[i].text,
    textColor:data[i].textColor || '#ffffff',
    textSize:data[i].textSize || .1,
    textBgColor:data[i].textBgColor || '#0086ff', // If this parameter is present, then we add a plan from behind
    textStickColor:data[i].textStickColor || '#0086ff',
    textDistance:data[i].textDistance || 1.1,
    textStickColor:data[i].textStickColor || '#0086ff',
  })
  //console.log(d,data[tmp1].text);
  // We are waiting for the font to download over the network
  if(!font){ // Wait
    let sti=setInterval(() => {
      if(font){
        clearInterval(sti)
        sti=undefined
        if(forText.text)createText(forText.text,[whereItArrives.x,whereItArrives.y,whereItArrives.z],undefined,forText.textSize,font,forText.textDistance,forText.textColor,forText.textBgColor,forText.textStickColor)
      }
    }, 100);
  }
  // TRY IT
    else{ // Font is loaded
      console.log('font loaed');
    }

// \ TRY ADD FONT AND MORE...


  /* if(tmp===1){
    tmp1+=2;  tmp=0
  }else{
    tmp++;  (tmp1===0)?tmp1=2:tmp1++
  } */
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
  const l = new THREE.Line(g, m)
  l.userData.idx = idx
  if(impacts[idx])setPath(l, impacts[idx].prevPosition, impacts[idx].impactPosition, 1)
  trails.push(l)
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
// JFT
const stats = Stats()
document.body.appendChild(stats.dom)
// \ JFT
renderer.setAnimationLoop( () => {
  TWEEN.update()
 // group.rotation.y += 0.001
  renderer.render(scene, camera)
  // JFT
  stats.update()
  // \ JFT
})

//Fix to compute canvas width/height
setTimeout(()=>{onWindowResize()},1)

function onWindowResize() {
  const sizes = {width: parseInt(window.getComputedStyle(cns).width),  height: parseInt(window.getComputedStyle(cns).height)};
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize( sizes.width , sizes.height );
}
