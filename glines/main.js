const THREE = require('three');
const OrbitControls = require('three-orbitcontrols');
require('three-obj-loader')(THREE);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.z = 250;

renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;

document.body.appendChild(renderer.domElement);

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
};

const scene = new THREE.Scene();

const material = new THREE.MeshPhysicalMaterial({ color: 0x111111 });
const markMaterial = new THREE.LineBasicMaterial({ color: 0x11FFFFFF });
const ambi = new THREE.AmbientLight(0xEEFFFF, 0.5);
scene.add(ambi);

const point = new THREE.PointLight(0xffffbb, 1.0);
scene.add(point);

const hemi = new THREE.HemisphereLight(0xffffbb, 0xEFFAFA, 1.0);
scene.add(hemi);

const markSize = 100;

const calcMarkEnd = (x, y, z, factor) => {
    return [
        factor/x * markSize,
        factor/y * markSize,
        factor/z * markSize,
    ];
}

const markVertex = (x, y, z) => {
    const geom = new THREE.BufferGeometry();
    const [_nx, _ny, _nz] = calcMarkEnd(x, y, z, 1);
    const vertices = Float32Array.from([
        x, y, z,
        _nx, _ny, _nz
    ]);
    // console.log(vertices);
    const position = new THREE.BufferAttribute(vertices, 3);
    position.dynamic = true;
    geom.addAttribute('position', position);

    const mark = new THREE.Line(geom, markMaterial);
    return mark;
};

const objectLoader = new THREE.OBJLoader();
objectLoader.load('./xr.obj', object => {
    const XRSymbol = new THREE.Group();
    XRSymbol.add(object);

    const [ mesh ] = object.children;
    mesh.material = material;

    const vertexBuffer = mesh.geometry.getAttribute('position').array;
    const normalBuffer = mesh.geometry.getAttribute('normal').array;
    const marks = [];

    for (let i = 0; i < vertexBuffer.length - 3; i += 3) {
        const mark = markVertex(vertexBuffer[i], vertexBuffer[i+1], vertexBuffer[i+2]);
        mark.originalVertex = [vertexBuffer[i], vertexBuffer[i+1], vertexBuffer[i+2]];
        XRSymbol.add(mark);
        marks.push(mark);

        // break;
    }

    XRSymbol.position.x = XRSymbol.position.y = XRSymbol.position.z = 0;
    XRSymbol.scale.x = XRSymbol.scale.y = XRSymbol.scale.z = 8;
    XRSymbol.rotation.x = Math.PI / 2;
    XRSymbol.rotation.y = Math.PI / 2;
    XRSymbol.rotation.y = Math.PI / 2;

    scene.add(XRSymbol);

    let factor = 1;
    function animate(t) {
        requestAnimationFrame(animate);
        factor = Math.sin(t * 1e-3);

        marks.forEach(mark => {
            const [x, y, z] = mark.originalVertex;

            const [_nx, _ny, _nz] = calcMarkEnd(x, y, z, factor);
            const vertices = [
                x, y, z,
                _nx, _ny, _nz
            ];
            const position = mark.geometry.getAttribute('position');
            const oldVertices = position.array;
            for (let v = 0; v < oldVertices.length; v++) {
                oldVertices[v] = vertices[v];
            };
            position.needsUpdate = true;
        });
        renderer.render(scene, camera);
    }

    requestAnimationFrame(animate);
});
