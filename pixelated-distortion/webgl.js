import * as THREE from 'three';
import vertex from './shaders/vertex.glsl'
import fragment from './shaders/fragment.glsl'

let OrbitControls = require("three/examples/jsm/controls/OrbitControls").OrbitControls

import img from './resources/image02.png'

export default class Sketch {
    constructor() {
        this.container = document.getElementById('container');
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.textureSize = 512;

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.width, this.height);
        this.renderer.setClearColor(0x111111, 1)
        this.renderer.physicallyCorrectLights = true;
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        this.container.appendChild(this.renderer.domElement);

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
        this.mouse = {
            x: 0,
            y: 0,
            prevX: 0,
            prevY: 0,
            vX: 0,
            vY: 0
        }

        this.addMesh();
        this.mouseEvent();
        this.resize();
        // this.addPost();
        this.render();
        this.setupResize();

    }
    isometricFill() {
        var frustumSize = 1;
        var aspect = this.width / this.height;
        this.camera = new THREE.OrthographicCamera(
            frustumSize / -2,
            frustumSize / 2,
            frustumSize / 2,
            frustumSize / -2,
            -1000,
            1000
        );
    }

    mouseEvent() {
        document.addEventListener('mousemove', (e) => {
            // mousemove
            this.mouse.x = e.clientX/this.width;
            this.mouse.y = e.clientY/this.height;

            this.mouse.vX = this.mouse.x - this.mouse.prevX;
            this.mouse.vY = this.mouse.y - this.mouse.prevY;

            this.mouse.prevX = this.mouse.x;
            this.mouse.prevY = this.mouse.y;
        })
    }

    addPost() {

    }

    addMesh() {
        // create a buffer with color data

        const width = this.textureSize;
        const height = this.textureSize;

        const size = width * height;
        const data = new Float32Array(4 * size);

        for (let i = 0; i < size; i++) {
            let r = Math.random()*255;

            const stride = i * 4;

            data[stride] = r;
            data[stride + 1] = r;
            data[stride + 2] = r;
            data[stride + 3] = 255;
        }


        // used the buffer to create a DataTexture

        this.dataTexture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat, THREE.FloatType);
        this.dataTexture.magFilter = this.dataTexture.minFilter = THREE.NearestFilter;
        this.dataTexture.needsUpdate = true;
        console.log(this.dataTexture);




        this.geometry = new THREE.PlaneBufferGeometry(1, 1);

        this.material = new THREE.ShaderMaterial({
            vertexShader: vertex,
            fragmentShader: fragment,

            uniforms: {
                uMouse: { value: 0 },
                // progress: {type: "f", value: 0},
                uImg: { value: new THREE.TextureLoader().load(img) },
                uResolution: { value: new THREE.Vector4() },
                uDataTexture: { value: this.dataTexture},
                // uTime: {value: 0},
                // uSize: {value: 6.0},
                // uScale: {value: 0}
            },
            // side: THREE.DoubleSide,
            // transparent: true,
            // wireframe: true,
        })

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.mesh);
    }

    setupResize() {
        window.addEventListener("resize", this.resize.bind(this));
    }

    resize() {
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.renderer.setSize(this.width, this.height);

        // keep ratio
        this.imageAspect = 1080 / 1920;
        let a1, a2;
        if (this.height / this.width > this.imageAspect) {
            a1 = (this.width / this.height) * this.imageAspect;
            a2 = 1;
        } else {
            a1 = 1;
            a2 = (this.height / this.width) / this.imageAspect;
        }
        this.material.uniforms.uResolution.value.x = this.width;
        this.material.uniforms.uResolution.value.y = this.height;
        this.material.uniforms.uResolution.value.z = a1;
        this.material.uniforms.uResolution.value.w = a2;
    }

    updateDataTexture(){
        let data = this.dataTexture.image.data;
        for (let i = 0; i < data.length; i+=4) {
            data[i] *= 0.95;
            data[i+1] *= 0.95;
        }

        // use mouse
        const size = this.textureSize;
        let gridMouseX = size*this.mouse.x;
        let gridMouseY = size*(1-this.mouse.y);
        const maxDist = 8;
        const strength = 50;

        
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                let distance = (gridMouseX - i)**2 + (gridMouseY -j)**2;
                // const maxDistSq = maxDist**2;

                if (distance < maxDist**2){
                    let index = (i + size*j)*4;
                    let power = maxDist/Math.sqrt(distance);
                    data[index] += strength*this.mouse.vX*power;
                    data[index+1] -= strength*this.mouse.vY*power;
                }
            }
        }

        this.mouse.vX *= .9;
        this.mouse.vY *= .9;

        this.dataTexture.needsUpdate = true;
    }

    render() {
        this.time++;

        // this.scene.rotation.x = this.time / 2000;
        // this.scene.rotation.y = this.time / 1000;

        this.updateDataTexture();
        this.control.update();
        this.renderer.render(this.scene, this.camera);

        window.requestAnimationFrame(this.render.bind(this))
    }
}

new Sketch();