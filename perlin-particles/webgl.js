import * as THREE from 'three';
import vertex from './shaders/vertex.glsl'
import fragment from './shaders/fragment.glsl'
import { AdditiveBlending, Blending } from 'three';

let OrbitControls = require("three/examples/jsm/controls/OrbitControls").OrbitControls

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
        this.camera.position.z = 4;

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
        document.addEventListener('mousemove', (e)=>{
            // mousemove
        })
    }

    addPost(){

    }

    addMesh(){
        this.geometry = new THREE.IcosahedronBufferGeometry(1,36);

        this.material = new THREE.ShaderMaterial({
            vertexShader: vertex,
            fragmentShader: fragment,
            
            uniforms: {
                
            },
            // side: THREE.DoubleSide,
            transparent: true,
            depthWrite: true,
            depthTest: true,
            // wireframe: true,
            // blending: THREE.AdditiveBlending
        })

        this.rand = []
        this.length = this.geometry.attributes.position.count;
        for (let i = 0; i < this.length; i++) {
            this.rand.push(Math.random());
        }
        
        this.geometry.addAttribute('aRandom', new Float32Array(this.rand), 1)

        console.log(this.geometry)
        this.mesh = new THREE.Points( this.geometry, this.material );
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
        
        this.scene.rotation.x = this.time / 2000;
	    this.scene.rotation.y = this.time / 1000;

        this.control.update();
        this.renderer.render( this.scene, this.camera );
        
        window.requestAnimationFrame(this.render.bind(this))
    }
}

new Sketch();