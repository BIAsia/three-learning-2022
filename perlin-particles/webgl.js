import * as THREE from 'three';
import {Pane} from 'tweakpane';
import vertex from './shaders/vertex.glsl'
import fragment from './shaders/fragment.glsl'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

// let OrbitControls = require("three/examples/jsm/controls/OrbitControls").OrbitControls

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
        this.camera.position.z = 3;
        this.rotateSpeed = 1;
       

        this.scene = new THREE.Scene();
        // this.control = new OrbitControls(this.camera, this.renderer.domElement)
        this.time = 0;
        this.mouse = 0;
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseSpeed = 0;


        this.addMesh();
        this.settings();
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
            bloomStrength: 2.5,
            bloomThreshold: 0,
            bloomRadius: .5
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

    settings(){
        this.pane = new Pane();
        


        this.PARAMS = {
            exposure: 1,
            strength: 2.5,
            threshold: 0,
            radius: .5,
            speed: 2.,
            amplitude: 10.5,
            rgb: {r:0, g:178, b:230},
            scale: .4,
            x: 0,
            y: 1,
            z: 0,
            rotate: 1,
        };

        

        const colorFolder = this.pane.addFolder({
            title: 'Color',
            expanded: true,
        });


        colorFolder.addInput(this.PARAMS, 'rgb').on('change', (ev)=>{this.material.uniforms.uRGB.value = ev.value;});
        colorFolder.addInput(this.PARAMS, 'x',{min: -1, max: 1}).on('change', (ev)=>{this.material.uniforms.uTrans.value.x = ev.value;});
        colorFolder.addInput(this.PARAMS, 'y',{min: -1, max: 1}).on('change', (ev)=>{this.material.uniforms.uTrans.value.y = ev.value;});
        colorFolder.addInput(this.PARAMS, 'z',{min: -1, max: 1}).on('change', (ev)=>{this.material.uniforms.uTrans.value.z = ev.value;});
        colorFolder.addInput(this.PARAMS, 'scale',{min: 0, max: 1}).on('change', (ev)=>{this.material.uniforms.uScale.value = ev.value;});

        const bloomFolder = this.pane.addFolder({
            title: 'Bloom',
            expanded: true,
        });
          
        // f.addInput(this.PARAMS, 'exposure').on('change', (ev)=>{});
        bloomFolder.addInput(this.PARAMS, 'strength',{min: 0, max: 10}).on('change', (ev)=>{this.bloomPass.strength = ev.value;});
        // f.addInput(this.PARAMS, 'bloomThreshold').on('change', (ev)=>{this.bloomPass.threshold = ev.value;});
        bloomFolder.addInput(this.PARAMS, 'radius',{min: 0, max: 5}).on('change', (ev)=>{this.bloomPass.radius = ev.value;});

        const vertexFolder = this.pane.addFolder({
            title: 'Vertex',
            expanded: true,
        });
          
        vertexFolder.addInput(this.PARAMS, 'speed',{min: 0, max: 5}).on('change', (ev)=>{this.material.uniforms.uSpeed.value = ev.value;});
        vertexFolder.addInput(this.PARAMS, 'amplitude').on('change', (ev)=>{this.material.uniforms.uAmplitude.value = ev.value;});

        this.pane.addInput(this.PARAMS, 'rotate',{min: -5, max: 5}).on('change', (ev)=>{this.rotateSpeed = ev.value;});
    }

    addMesh(){
        this.geometry = new THREE.IcosahedronBufferGeometry(1,36);
        // this.geometry = new THREE.BoxBufferGeometry(1,1,1,56,56,56)
        this.material = new THREE.ShaderMaterial({
            vertexShader: vertex,
            fragmentShader: fragment,
            
            uniforms: {
                uMouseX: {value: this.mouseX},
                uMouseY: {value: this.mouseY},
                uSpeed: {value: 2.},
                uAmplitude: {value: 10.5},
                uRGB: {value: {r:0, g:178, b:230}},
                uScale: {value: .4},
                uTrans: {value: {x:0, y:1, z:0}},
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
    }
}

new Sketch();