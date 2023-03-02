// create an AudioListener and add it to the camera
const listener = new THREE.AudioListener();
// create a global audio source
const sound = new THREE.Audio(listener);
// load a sound and set it as the Audio object's buffer
const audioLoader = new THREE.AudioLoader();
audioLoader.load('squid.ogg', function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(0.5);
    sound.play();
});


//สร้าง scene
const scene = new THREE.Scene();

//BG SKYBOX
scene.background = new THREE.CubeTexture()
{
    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
        'front.png',
        'back.png',
        'top.png',
        'bottom.png',
        'left.png',
        'right.png',
    ]);
    scene.background = texture;
}

//floor
const floorgeometry = new THREE.PlaneGeometry(60, 100);
            const floortextureloader = new THREE.TextureLoader();
            const floortexture = floortextureloader.load('sand.jpg');
            const floormaterial = new THREE.MeshBasicMaterial({ map: floortexture });
            const floor = new THREE.Mesh(floorgeometry, floormaterial);
            floor.rotation.x = Math.PI * -0.5;
            floor.position.y=-7;
            scene.add(floor);

            const bggeometry = new THREE.PlaneGeometry(60, 50);
            const bgtextureloader = new THREE.TextureLoader();
            const bgtexture = bgtextureloader.load('card.jpg');
            const bgmaterial = new THREE.MeshBasicMaterial({ map: bgtexture });
            const bg = new THREE.Mesh(bggeometry, bgmaterial);
            bg.rotation.x = 0;
            bg.position.y=7;
            bg.position.z=-10;
            scene.add(bg);

            //fog
            scene.fog = new THREE.FogExp2(0xcccccc, 0.001);




//สร้างกล้อง คั้งค่ากล้อง
const camera = new THREE.PerspectiveCamera(120, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0,0,5)

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//light
let light1,light2;
light1 = new THREE.AmbientLight(0xffffff, 0.5); // soft white light
scene.add(light1);
light2 = new THREE.PointLight( 0xffffff, 0.5, 100 );
light2.position.set( 0, 0, 0 );
scene.add( light2 );

//global variables
const start_position = 3
const end_position = -start_position
const text = document.querySelector(".text")
const TIMIT_LIMIT = 10
var gameStat = "loading"
let isLookingBackward = true

function createCube(size, positionX, rotY = 0, color = 0xfbc851) {
    const geometry = new THREE.BoxGeometry(size.w, size.h, size.d);
    const material = new THREE.MeshBasicMaterial({ color: color });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.x = positionX;
    cube.rotation.y = rotY;
    scene.add(cube);
    return cube;
}



const loader = new THREE.GLTFLoader();

//สร้าง ดีเลย์
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//ผู้คุมคนที่1 ซ้าย
class Worker1 {
    constructor() {
        loader.load('../squid_game_-_worker/worker.gltf', (gltf) => {
            scene.add(gltf.scene);
            gltf.scene.scale.set(80, 80, 80);
            gltf.scene.position.set(-4, -7, -7);
            this.worker1 = gltf.scene
        })
    }
}

//ผู้คุมคนที่2 ขวา
class Worker2 {
    constructor() {
        loader.load('../squid_game_-_worker/worker.gltf', (gltf) => {
            scene.add(gltf.scene);
            gltf.scene.scale.set(80, 80, 80);
            gltf.scene.position.set(4, -7, -7);
            this.worker2 = gltf.scene

        })
    }
}
// ตุ๊กตา AEIOU 
class Doll {
    constructor() {
        loader.load("../models/scene.gltf", (gltf) => {
            scene.add(gltf.scene);
            gltf.scene.scale.set(1, 1, 1);
            gltf.scene.position.set(0, -2.7, -9);
            this.doll = gltf.scene
        })
    }
    //หันหลัง
    lookBackward() {
        //this.doll.rotation.y = -3.15
        gsap.to(this.doll.rotation, { y: -3.15, duration: .45 })
        setTimeout(() => isLookingBackward = true, 150)

    }
    //หันหน้า
    lookForward() {
        //this.doll.rotation.y = 0
        gsap.to(this.doll.rotation, { y: 0, duration: .45 })
        setTimeout(() => isLookingBackward = false, 450)
    }
    //เริ่มหัน
    async start() {
        this.lookBackward((Math.random() * 1000) + 1000)
        await delay(1500)
        this.lookForward((Math.random() * 1000) + 1000)
        await delay(1000)
        this.start()
    }


}
//สร้างตัวแปรของตัวละคร
var keyCode;
const mixers = [];
let object;

//ผู้เล่น
class Player {
    constructor() {
        loader.load('walk1.glb', (gltf) => {
            object = gltf.scene;
            object.position.set(0, -7, 0);
            object.scale.set(2, 2, 2);
            object.rotation.y = 3;
            object.rotation.x = -0.35;

            //ทำให้ตัวละครขยับ
            const animation = gltf.animations[0];

            const mixer = new THREE.AnimationMixer(object);
            mixers.push(mixer);
            const action = mixer.clipAction(animation);
            action.play();
            scene.add(object)

            //ควบคุมตัวละคร
            document.addEventListener("keydown", onDocumentKeyDown, false);
            function onDocumentKeyDown(event) {
                 keyCode = event.which;
                 if (gameStat == "loading"){
                    keyCode = 88
                    }
                if (keyCode == 87) {

                    object.position.z -= 0.05;
                }
                animate();

            };
        });
    }

    //เช็คเดินเกิน
    check() {
        if (keyCode == 87 && !isLookingBackward) {
            console.log("you lose")
            text.innerText = "You lose!"
            gameStat = "over"
        }
        if (object) {
            if (object.position.z <= -5) {
                console.log("you win!")
                text.innerText = "You Win!"
                gameStat = "over"

            }
        }
        keyCode = 88;
    }
}

player = new Player()
doll = new Doll()
worker1 = new Worker1()
worker2 = new Worker2()

//ดีเลย์ก่อนเริ่ม
async function init() {
    await delay(1000)
    text.innerText = "Starting in 3"
    await delay(1000)
    text.innerText = "Starting in 2"
    await delay(1000)
    text.innerText = "Starting in 1"
    await delay(1000)
    text.innerText = "Go!!!"
    startGame()
}

//ฟังก์ชั่นเริ่มนับเวลาถอยหลัง
function startGame() {
    gameStat = "started"
    let progressBar = createCube({ w: 10, h: .1, d: 1 }, 0, 0, 0xfe0000)
    text.innerText = "Time in Progress..."
    progressBar.position.y = 5
    gsap.to(progressBar.scale, { x: 0, duration: TIMIT_LIMIT, ease: "none" })
    doll.start()
    setTimeout(() => {
        if (gameStat != "over") {
            text.innerText = "You ran out of time"
            gameStat = "over"
        }
    }, TIMIT_LIMIT * 1000);
}

init()

const clock = new THREE.Clock();
//อนิเมชั่น
function animate() {
    if (gameStat == "over") return
    renderer.render(scene, camera);

    const delta = clock.getDelta();

    mixers.forEach((mixer) => {
        mixer.update(delta);
    });

    requestAnimationFrame(animate);
    player.check()
}
animate();

//Screen ยืดเต็มจอ
window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}
