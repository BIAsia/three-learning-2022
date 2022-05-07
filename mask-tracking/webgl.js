import * as THREE from 'three';
import vertex from './shaders/vertex.glsl'
import fragment from './shaders/fragment.glsl'

let OrbitControls = require("three/examples/jsm/controls/OrbitControls").OrbitControls

import backImg from './resources/image1.png'
import frontImg from './resources/image2.png'
import blob from './resources/blob.png'

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

        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();
        this.point = new THREE.Vector3();

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
        this.raycasterEvent();

    }

    raycasterEvent(){
        window.addEventListener( 'pointermove', (event)=>{
            this.pointer.x = ( event.clientX / this.width ) * 2 - 1;
	        this.pointer.y = - ( event.clientY / this.height ) * 2 + 1;
            

            // update the picking ray with the camera and pointer position
            this.raycaster.setFromCamera( this.pointer, this.camera );

            // calculate objects intersecting the picking ray
            const intersects = this.raycaster.intersectObjects( [this.plane] );
            if (intersects[0]){
                // console.log(intersects)
                this.point.copy(intersects[0].point);
            }
        } );
    }

    mouseEvent(){
        document.addEventListener('mousemove', (e)=>{
            // mousemove
        })
    }

    addPost(){

    }

    addMesh(){
        this.textures = [];
        this.textures.push(
            new THREE.TextureLoader().load(backImg),
            new THREE.TextureLoader().load(frontImg),
            new THREE.TextureLoader().load(blob),
        )

        this.geometry = new THREE.PlaneBufferGeometry(1,1);

        this.material = new THREE.ShaderMaterial({
            vertexShader: vertex,
            fragmentShader: fragment,
            
            uniforms: {
                uMouse: {value: 0},
                // progress: {type: "f", value: 0},
                uImg: {value: this.textures[1]},
                uMask: {value: this.textures[2]},
                uResolution: {value: new THREE.Vector4()},
                // uTime: {value: 0},
                // uSize: {value: 6.0},
                // uScale: {value: 0}
            },
            side: THREE.DoubleSide,
            transparent: true,
            // wireframe: true,
        })
        
        this.plane = new THREE.Mesh( this.geometry, this.material );
        this.scene.add( this.plane );
        this.plane.position.z = .1;

        this.bgMesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(3,2),
            new THREE.MeshBasicMaterial({
                map: this.textures[0],
            })
        )
        this.scene.add(this.bgMesh);
    }

    setupResize(){
        window.addEventListener("resize", this.resize.bind(this));
    }

    resize(){
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.renderer.setSize(this.width, this.height);

        // image cover
        this.imageAspect = 1080/1920;
        let a1, a2;
        if (this.height/this.width > this.imageAspect){
            a1 = (this.width/this.height) * this.imageAspect;
            a2 = 1;
        } else {
            a1 = 1;
            a2 = (this.height/this.width) / this.imageAspect;
        }
        this.material.uniforms.uResolution.value.x = this.width;
        this.material.uniforms.uResolution.value.y = this.height;
        this.material.uniforms.uResolution.value.z = a1;
        this.material.uniforms.uResolution.value.w = a2;

        
        // adapt plane size to fit window
        const dist = this.camera.position.z;
        const height = 1;
        this.camera.fov = 2*(180/Math.PI)*Math.atan(height/(2*dist));
        if (this.width/height > 1){
            this.plane.scale.x = this.camera.aspect;
        } else {
            this.plane.scale.y = 1/this.camera.aspect;
        }
        this.camera.updateProjectionMatrix();

        
    }

    render(){
        this.time++;

        this.control.update();
        this.renderer.render( this.scene, this.camera );
        
        window.requestAnimationFrame(this.render.bind(this))
    }
}

new Sketch();