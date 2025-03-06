import * as THREE from 'three';

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const options = {
  showHelper: false,
  pathToDollarPng: "./src/footer-dollar@2x.png",
  number: 10,
  m_number: 33,
  sideOffset: 13.0,
  m_sideOffset: 10.0,
  containerSelector: ".div-block-9"
}

// We'll use an orthographic camera for easier 2D positioning
let scene, camera, renderer, svgGroup;
let playAnimation;
let svgHeight = 0; // We'll measure it after loading
let clock;
let dollars = [];
let dollarsNumber = 0; 
let animationPlayed = false

const canvas2 = document.getElementById("webgl-canvas-2");
const container = document.querySelector(options.containerSelector);

init(options);

gsap.registerPlugin(ScrollTrigger);

function initST() {
  ScrollTrigger.create({
    trigger: "footer",
    start: "bottom bottom+=1px",
    //markers: true,
    onEnter: () => {
      if (!animationPlayed) {
        animationInitialState();
        animate();
      }
    }
  });
}

// init(options);

document.querySelector("#resetButton").addEventListener("click", (e) => {
  animationInitialState();
})

function init(options) {
    clock = new THREE.Clock();
    const is_991_down = window.matchMedia("(max-width: 991px)").matches;
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);
  
    // Sizes
    const width = container.getBoundingClientRect().width || window.innerWidth;
    const height = container.getBoundingClientRect().height || window.innerHeight;
  
    // Orthographic Camera: left, right, top, bottom, near, far
    camera = new THREE.OrthographicCamera(
      width / -2,   // left
      width / 2,    // right
      height / 2,   // top
      height / -2,  // bottom
      0.1,
      1000
    );
    camera.position.z = 10; // Move camera away on Z so we can see
  
    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas: canvas2, antialias: true });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize(width, height);

    // Helper grid
    if (options.showHelper) {
        const helper = new THREE.GridHelper( window.innerWidth, 10, 0x8d8d8d, 0xc1c1c1 );
        helper.rotation.x = Math.PI / 2;
        scene.add( helper );
    }
  
    // Load PNG
    dollarsNumber = is_991_down ? options.m_number : options.number;
    dollarsNumber = parseInt(width / 45);
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(options.pathToDollarPng, (texture) => {
        for ( let j = 1; j <= dollarsNumber; j ++ ) {
            createDollarPng(texture, j);
        }

        animate();
    });
  
    // Handle window resizing
    window.addEventListener('resize', onWindowResize);

    // renderer.render(scene, camera);
    function createDollarPng(texture, index) {
        const geometry = new THREE.PlaneGeometry(45, 45); // set size as needed
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true, // if PNG has alpha
            side: THREE.DoubleSide,
        });
        const dollar = new THREE.Mesh(geometry, material);

        const offset = is_991_down ? options.m_sideOffset : options.sideOffset;

        // Position it offscreen at top
        // dollar.position.set(
        //     (Math.random() - 0.5) * window.innerWidth,
        //     window.innerHeight / 2 + 50,
        //     0
        // );
        const xValue = (-width/2) + 45/2 + offset + (index - 1) * 45;
        
        dollar.position.set(
            xValue,
            window.innerHeight / 2 + 45,
            0
        );

        dollar.targetY = -(height / 2) + 45/2;
        dollar.velocityY = 0.0;
        dollar.bounceCount = 0;
        dollar.delay = Math.random() * 3;

        scene.add(dollar);
        dollars.push(dollar);
    }
}

function onWindowResize() {
  const width = container.getBoundingClientRect().width || window.innerWidth;
  const height = container.getBoundingClientRect().height || window.innerHeight;

  // Update orthographic camera bounds
  camera.left = width / -2;
  camera.right = width / 2;
  camera.top = height / 2;
  camera.bottom = height / -2;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
}

function animate() {
  requestAnimationFrame(animate);
  // seconds since last frame
  const delta = clock.getDelta(); 
  const timePassed = clock.getElapsedTime();
  // console.log(timePassed)
  
  for (let i = 0; i < dollarsNumber; i++) {
    let obj = dollars[i];
    if (timePassed > obj.delay) {
      obj.velocityY -= 9.8 * delta; // gravity
      obj.position.y += obj.velocityY;

      // check bounce
      if (obj.position.y < obj.targetY) {
        obj.position.y = obj.targetY;
        obj.velocityY *= -0.6; // bounce up with friction
        // maybe track bounce count
        obj.bounceCount++;
      }

      // after 2 bounces, remove or freeze, etc.
      if (obj.bounceCount >= 10 && obj.velocityY > 0.01) {
        // freeze or do final clamp
        obj.velocityY = 0;
      }
    }
  }

  renderer.render(scene, camera);
}

function animationInitialState() {

  for (let i = 0; i < dollarsNumber; i++) {
    let obj = dollars[i];
    obj.position.y = window.innerHeight / 2 + 45;
    obj.velocityY = 0;
    obj.bounceCount = 0;
    obj.delay = Math.random() * 3;
  }

  clock.stop();
  clock = new THREE.Clock();
  // renderer.render(scene, camera);
}