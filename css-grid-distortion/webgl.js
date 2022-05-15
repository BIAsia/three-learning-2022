import * as THREE from 'three';
import {Pane} from 'tweakpane';
import vertex from './shaders/vertex.glsl'
import fragment from './shaders/fragment.glsl'

let OrbitControls = require("three/examples/jsm/controls/OrbitControls").OrbitControls

import text from './resources/text.png'

export default class Sketch{
    constructor(){
        this.container = document.getElementById('container');
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;

        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
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

        this.isometricFill();
        this.camera.position.z = 2;

        this.scene = new THREE.Scene();
        this.control = new OrbitControls(this.camera, this.renderer.domElement)
        this.time = 0;
        this.mouse = 0;

        this.addMesh();
        this.settings();
        // this.mouseEvent();
        this.resize();
        // this.addPost();
        this.render();
        this.setupResize();

    }

    settings(){
        this.pane = new Pane();
        this.PARAMS = {
            progress: 0,
        };
        this.pane.addInput(
            this.PARAMS, 'progress',
            {min: 0, max: 1}
        ).on('change', (ev)=>{
            this.material.uniforms.uProgress.value = ev.value;
        })
    }

    isometricFill(){
        var frustumSize = 1;
        var aspect = this.width/this.height;
        this.camera = new THREE.OrthographicCamera(
            frustumSize / -2,
            frustumSize / 2,
            frustumSize / 2,
            frustumSize / -2,
            -1000,
            1000 
        );
    }

    mouseEvent(){
        document.addEventListener('mousemove', (e)=>{
            // mousemove
        })
    }

    addPost(){

    }

    addMesh(){
        this.geometry = new THREE.PlaneBufferGeometry(1,1);

        let textureText = new THREE.TextureLoader().load(text);
        // reduce img border
        textureText.magFilter = textureText.minFilter = THREE.NearestFilter;

        this.material = new THREE.ShaderMaterial({
            vertexShader: vertex,
            fragmentShader: fragment,
            
            uniforms: {
                uMouse: {value: 0},
                uResolution: {value: new THREE.Vector2()},
                uProgress: {value: 0},
                uImg: {value: textureText},
                uTime: {value: 0},
                // uSize: {value: 6.0},
                // uScale: {value: 0}
            },
            // side: THREE.DoubleSide,
            // transparent: true,
            // wireframe: true,
        })
        
        this.mesh = new THREE.Mesh( this.geometry, this.material );
        this.scene.add( this.mesh );
    }

    setupResize(){
        window.addEventListener("resize", this.resize.bind(this));
    }

    resize(){
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.renderer.setSize(this.width, this.height);

        this.material.uniforms.uResolution.value.x = this.width;
        this.material.uniforms.uResolution.value.y = this.height;

    }

    render(){
        this.time++;
        
        // this.scene.rotation.x = this.time / 2000;
	    // this.scene.rotation.y = this.time / 1000;
        this.material.uniforms.uTime.value = this.time;
        // this.material.uniforms.uProgress.value = this.pane.;
        this.control.update();
        this.renderer.render( this.scene, this.camera );
        
        window.requestAnimationFrame(this.render.bind(this))
    }
}

new Sketch();