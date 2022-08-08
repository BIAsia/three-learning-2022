import * as THREE from 'three';
import * as fs from 'fs';
import gsap from 'gsap';
import {Pane} from 'tweakpane';
import FileSaver from 'file-saver'; 

import vertex from './shaders/vertex.glsl'
import vertexRefract from './shaders/vertexRefract.glsl'
import fragment from './shaders/fragment.glsl'
import fragmentRefract from './shaders/fragmentRefract.glsl'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { PostProcessing } from './PostProcessing.js';
import { Vector3 } from 'three';

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
        this.camera.position.z = 1.3;

        this.scene = new THREE.Scene();
        this.control = new OrbitControls(this.camera, this.renderer.domElement)
        this.time = 0;
        this.mouse = 0;
        this.speed = 0;
        

        const palettesFile = fs.readFileSync('./palettes.json', {encoding: 'utf-8'});
        this.palettes = JSON.parse(palettesFile)
        this.preset = {
            colorA: {r:155, g:206, b:203},
            colorB: {r:206, g:221, b:220},
            colorC: {r:162, g:189, b:193},
        }
        this.pressPalette = this.palettes[15]

        this.addTCube();

        this.addMesh();
        this.settings();
        this.mouseEvent();
        
        this.addPost();
        this.resize();
        this.render();
        this.setupResize();

    }
    mouseEvent(){
        document.addEventListener('mousemove', (e)=>{
            // mousemove
            
        })
        this.lastX = 0;
        this.lastY = 0;
        document.addEventListener('mousedown', (e)=>{
            this.moveOn();
        })
        document.addEventListener('mouseup', (e)=>{
            this.moveBack();
        })
    }

    moveOn(){
        gsap.to(this.material.uniforms['uSpeed'], {
            value: 4,
            duration: 4,
            delay: 0,
            ease: "power2.out",
        })
    }
    moveBack(){
        gsap.to(this.material.uniforms['uSpeed'], {
            value: 0,
            duration: 4,
            delay: 0,
            ease: "power2.out",
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

    addTCube(){
        // to create fraction
        this.cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256,{
            format: THREE.RGBAFormat,
            generateMipmaps: true,
            minFilter: THREE.LinearMipMapLinearFilter,
            encoding: THREE.sRGBEncoding
        })

        this.cubeCamera = new THREE.CubeCamera(.1, 10, this.cubeRenderTarget)
    }

    addMesh(){

        this.geometry = new THREE.SphereBufferGeometry(1.5, 32, 32)

        this.material = new THREE.ShaderMaterial({
            vertexShader: vertex,
            fragmentShader: fragment,
            
            uniforms: {
                uMouse: {value: 0},
                // progress: {type: "f", value: 0},
                landscape: {value: this.texture},
                uTime: {value: 0.},
                uSpeed: {value: this.speed},
                uColorA: {value: {r:155., g:206., b:203.}},
                uColorB: {value: {r:206., g:221., b:220.}},
                uColorC: {value: {r:162., g:189., b:193.}},
                // uSize: {value: 6.0},
                // uScale: {value: 0}
            },
            side: THREE.DoubleSide,
            // transparent: true,
            // wireframe: true,
        })
        
        this.mesh = new THREE.Mesh( this.geometry, this.material );
        this.scene.add( this.mesh );


        this.geometryRefract = new THREE.SphereBufferGeometry(0.4, 32, 32);
        this.geometryRefract.position = new Vector3(1000,100,1000)
        this.materialRefract = new THREE.ShaderMaterial({
            vertexShader: vertexRefract,
            fragmentShader: fragmentRefract,
            
            uniforms: {
                uMouse: {value: 0},
                tCube: {value: 0},
                // progress: {type: "f", value: 0},
                landscape: {value: this.texture},
                uTime: {value: 0.},
                uSpeed: {value: this.speed},
                uColorA: {value: {r:155., g:206., b:203.}},
                uColorB: {value: {r:206., g:221., b:220.}},
                uColorC: {value: {r:162., g:189., b:193.}},
                // uSize: {value: 6.0},
                // uScale: {value: 0}
            },
            side: THREE.DoubleSide,
            // transparent: true,
            // wireframe: true,
        })
        
        this.meshRefract = new THREE.Mesh( this.geometryRefract, this.materialRefract );
        this.scene.add( this.meshRefract );
        this.meshRefract.position.set(0.2,-0.3,0.8)
    }

    settings(){
        this.pane = new Pane();
        this.PARAMS = {
            colorA: {r:155, g:206, b:203},
            colorB: {r:206, g:221, b:220},
            colorC: {r:162, g:189, b:193},
        }
        this.pane.addButton({title: 'Random Palette'}).on('click', (ev)=>{
            let num = Math.floor(Math.random()*100);
            num = num%(this.palettes.length)

            this.preset = this.palettes[num];
            this.pane.importPreset(this.preset);
        });

        const colorFolder = this.pane.addFolder({
            title: 'Color',
            expanded: true,
        });

        colorFolder.addInput(this.PARAMS, 'colorA').on('change', (ev)=>{this.material.uniforms.uColorA.value = ev.value;});
        colorFolder.addInput(this.PARAMS, 'colorB').on('change', (ev)=>{this.material.uniforms.uColorB.value = ev.value;});
        colorFolder.addInput(this.PARAMS, 'colorC').on('change', (ev)=>{this.material.uniforms.uColorC.value = ev.value;});

        // const exportFolder = this.pane.addFolder({
        //     title: 'Export',
        //     expanded: true,
        // });
        this.pane.addButton({title: 'Export Parameters'}).on('click', (ev)=>{
            const preset = this.pane.exportPreset();
            var blob = new Blob([JSON.stringify(preset)], {type: "text/plain;charset=utf-8"});
            FileSaver.saveAs(blob, "parameters.JSON");
        });
        
    }

    setupResize(){
        window.addEventListener("resize", this.resize.bind(this));
    }

    resize(){
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.composer.setSize(this.width, this.height);
        this.renderer.setSize(this.width, this.height);
    }

    render(){
        this.time++;
        this.speed *= 0.99;
        
        this.meshRefract.visible = false;
        this.cubeCamera.update(this.renderer, this.scene);
        this.materialRefract.uniforms['tCube'].value = this.cubeRenderTarget.texture;
        this.meshRefract.visible = true;

        // this.scene.rotation.x = this.time / 2000;
	    // this.scene.rotation.y = this.time / 1000;
        this.material.uniforms['uTime'].value = this.time*.008;
        this.customPass.uniforms[ 'time' ].value = this.time;

        this.control.update();
        // this.renderer.render( this.scene, this.camera );
        this.composer.render();
        
        window.requestAnimationFrame(this.render.bind(this))
    }
}

new Sketch();