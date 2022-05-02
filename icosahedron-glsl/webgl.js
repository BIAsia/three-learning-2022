import * as THREE from 'three';
import vertex from './shaders/vertex.glsl'
import fragment from './shaders/fragment.glsl'
import fragmentline from './shaders/fragmentline.glsl'
import img from './resources/1.png'

import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { PostProcessing } from './PostProcessing.js';
// import { PostProcessing } from './postprocessing.js';

let OrbitControls = require("three/examples/jsm/controls/OrbitControls").OrbitControls
// init

export default class Sketch{
    constructor(){
        this.container = document.getElementById('container');
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize( this.width, this.height );
        this.renderer.setClearColor(0x111111,1)
        this.renderer.physicallyCorrectLights = true;
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        this.container.appendChild( this.renderer.domElement );

        this.camera = new THREE.PerspectiveCamera(
            70, 
            window.innerWidth / window.innerHeight, 
            0.001, 
            1000
        );
        this.camera.position.z = 2;

        

        this.scene = new THREE.Scene();
        this.control = new OrbitControls(this.camera, this.renderer.domElement)
        this.time = 0;
        this.mouse = 0;

        this.addMesh();
        this.mouseEvent();
        this.resize();
        this.addPost();
        this.render();
        this.setupResize();

    }
    mouseEvent(){
        this.lastX = 0;
        this.lastY = 0;
        this.speed = 0;
        document.addEventListener('mousemove', (e)=>{
            this.speed = Math.sqrt((e.pageX - this.lastX)**2 + (e.pageY - this.lastY)**2)
            this.lastX = e.pageX;
            this.lastY = e.pageY;
        })
    }

    addPost(){
        this.composer = new EffectComposer( this.renderer );
		this.composer.addPass( new RenderPass( this.scene, this.camera ) );

		this.customPass = new ShaderPass( PostProcessing );
		this.customPass.uniforms[ 'resolution' ].value = new THREE.Vector2( window.innerWidth, window.innerHeight );
		this.customPass.uniforms[ 'resolution' ].value.multiplyScalar( window.devicePixelRatio );
        this.customPass.uniforms[ 'time' ].value = this.time;
        this.customPass.uniforms[ 'mouse' ].value = this.mouse;
		this.composer.addPass( this.customPass );
    }

    addMesh(){
        this.texture = new THREE.TextureLoader().load(img);
        this.texture.wrapS = this.texture.wrapT = THREE.MirroredRepeatWrapping;

        this.geometry = new THREE.IcosahedronGeometry(1,1);
        this.geometryline = new THREE.IcosahedronBufferGeometry(1.001,1);
        let length = this.geometryline.attributes.position.array.length;

        let bary = [];
        for (let i = 0; i < length/3; i++) {
            bary.push(
                0,0,1,
                0,1,0,
                1,0,0
            );
            
        }
        this.geometryline.setAttribute('aBary', new THREE.BufferAttribute(new Float32Array(bary),3))

        this.material = new THREE.ShaderMaterial({
            vertexShader: vertex,
            fragmentShader: fragment,
            // transparent: true,
            // wireframe: true,
            uniforms: {
                uMouse: {value: 0},
                // progress: {type: "f", value: 0},
                landscape: {value: this.texture}
                // uTime: {value: 0},
                // uSize: {value: 6.0},
                // uScale: {value: 0}
            },
            // side: THREE.DoubleSide
        })
        this.materialline = new THREE.ShaderMaterial({
            vertexShader: vertex,
            fragmentShader: fragmentline,
            // transparent: true,
            // wireframe: true,
            uniforms: {
                uMouse: {value: 0},
                progress: {type: "f", value: 0},
                landscape: {value: this.texture}
                // uTime: {value: 0},
                // uSize: {value: 6.0},
                // uScale: {value: 0}
            },
            // side: THREE.DoubleSide
        })
        this.mesh = new THREE.Mesh( this.geometry, this.material );
        this.meshline = new THREE.Mesh( this.geometryline, this.materialline );
        this.scene.add( this.mesh );
        this.scene.add( this.meshline );
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
        this.mouse -= (this.mouse - this.speed*.2)*.01;
        this.mouse *= .9;
        console.log(this.mouse)
        this.scene.rotation.x = this.time / 2000;
	    this.scene.rotation.y = this.time / 1000;

        this.control.update();
        this.customPass.uniforms[ 'time' ].value = this.time;
        this.customPass.uniforms[ 'mouse' ].value = this.mouse;
        this.material.uniforms[ 'uMouse' ].value = this.mouse;
        this.materialline.uniforms[ 'uMouse' ].value = this.mouse;
        // this.renderer.render( this.scene, this.camera );
        
        window.requestAnimationFrame(this.render.bind(this))
        this.composer.render();
    }
}

new Sketch();








// animation

function animation( time ) {

	

	

}