import * as THREE from 'three';
import * as fs from 'fs';
import vertex from './shaders/vertex.glsl'
import fragment from './shaders/fragment.glsl'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

let OrbitControls = require("three/examples/jsm/controls/OrbitControls").OrbitControls
const paramFile = fs.readFileSync('./parameters.json', {encoding: 'utf-8'});
let params = JSON.parse(paramFile)

export default class Sketch{
    constructor(){
        
        this.container = document.getElementById('container');
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;

        this.renderer = new THREE.WebGLRenderer( { antialias: true, preserveDrawingBuffer: true } );
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize( this.width, this.height );
        this.renderer.setClearColor(0x000000,1)
        this.renderer.physicallyCorrectLights = true;
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        this.container.appendChild( this.renderer.domElement );

        this.camera = new THREE.PerspectiveCamera(
            70, 
            window.innerWidth / window.innerHeight, 
            0.001, 
            1000
        );
        this.camera.position.z = 3;
        this.rotateSpeed = params.rotate;
       

        this.scene = new THREE.Scene();
        this.control = new OrbitControls(this.camera, this.renderer.domElement)
        this.time = 0;
        this.mouse = 0;
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseSpeed = 0;


        this.addMesh();
        this.mouseEvent();
        this.resize();
        this.addPost();
        this.render();
        this.setupResize();

    }
    mouseEvent(){
        let lastX = 0, lastY = 0;
        document.addEventListener('mousemove', (e)=>{
            this.mouseSpeed = .05*Math.sqrt((e.pageX - lastX)**2 + (e.pageY - lastY)**2)
            this.mouseX = (e.pageX-this.width/2)*.001;
            this.mouseY = (e.pageY-this.height/2)*.001;
            lastX = e.pageX;
            lastY = e.pageY;
            // mousemove
        })
    }



    addPost(){
        this.params = {
            exposure: 1,
            bloomStrength: params.strength,
            bloomThreshold: 0,
            bloomRadius: params.radius
        };

        this.renderScene = new RenderPass( this.scene, this.camera );

		this.bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
		this.bloomPass.threshold = this.params.bloomThreshold;
		this.bloomPass.strength = this.params.bloomStrength;
		this.bloomPass.radius = this.params.bloomRadius;

		this.composer = new EffectComposer( this.renderer );
		this.composer.addPass( this.renderScene );
		this.composer.addPass( this.bloomPass );


    }

    addMesh(){
        this.geometry = new THREE.IcosahedronBufferGeometry(1,params.density);
        // this.geometry = new THREE.BoxBufferGeometry(1,1,1,56,56,56)
        this.material = new THREE.ShaderMaterial({
            vertexShader: vertex,
            fragmentShader: fragment,
            
            uniforms: {
                uMouseX: {value: this.mouseX},
                uMouseY: {value: this.mouseY},
                uSpeed: {value: params.speed},
                uAmplitude: {value: params.amplitude},
                uRGB: {value: params.rgb},
                uScale: {value: params.scale},
                uTrans: {value: {x:params.x, y:params.y, z:params.z}},
                uSize: {value: params.size}
            },
            side: THREE.DoubleSide,
            transparent: true,
            depthWrite: true,
            depthTest: true,
            // wireframe: true,
            blending: THREE.AdditiveBlending
        })

        this.rand = []
        this.length = this.geometry.attributes.position.count;
        for (let i = 0; i < this.length; i++) {
            this.rand.push(Math.random());
        }
        
        this.geometry.addAttribute('aRandom', new Float32Array(this.rand), 1)

        this.mesh = new THREE.Points( this.geometry, this.material );
        this.scene.add( this.mesh );
    }

    updateMesh(numbers){
        this.geometry = new THREE.IcosahedronBufferGeometry(1,numbers);
        this.rand = []
        this.length = this.geometry.attributes.position.count;
        for (let i = 0; i < this.length; i++) {
            this.rand.push(Math.random());
        }
        this.geometry.addAttribute('aRandom', new Float32Array(this.rand), 1);
        this.mesh = new THREE.Points( this.geometry, this.material );
        this.scene.clear();
        this.scene.add( this.mesh );
    }

    setupResize(){
        window.addEventListener("resize", this.resize.bind(this));
    }

    resize(){
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.renderer.setSize(this.width, this.height);
    }

    render(){
        this.time++;
        this.mouseSpeed *= .95;
        
        this.mesh.rotation.z = this.time / 2000 * this.rotateSpeed;
	    this.mesh.rotation.y = this.time / 1000 * this.rotateSpeed;

        this.material.uniforms['uMouseX'].value = this.mouseX;
        this.material.uniforms['uMouseY'].value = this.mouseY;

        // this.camera.position.z += this.mouseX*this.mouseSpeed*.1;

        // this.control.update();
        // this.renderer.render( this.scene, this.camera );
        this.composer.render();
        
        window.requestAnimationFrame(this.render.bind(this))
        if (this.onCapture) this.capturer.capture(this.renderer.domElement);
    }
}

new Sketch();