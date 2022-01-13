import * as THREE from "./three.js";

window.camera = undefined;
window.scene = undefined;
window.renderer = undefined;
//let camera, scene, renderer;
export let draw;

export function init (points, color) {
    const width = document.body.offsetWidth, height = width;
    const right = width/2, left = -right, top = right, bottom = -top;

    //camera = new THREE.PerspectiveCamera();
    camera = new THREE.OrthographicCamera(left, right, top, bottom);
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: document.getElementById("uniwebgl"),
        //alpha: true, /* would use alpha channel for translucent */
    });
    /* set canvas attributes */
    renderer.setSize(width, height);
    /* set background translucent and black */
    //renderer.setClearColor("black", 0.5);
    
    camera.position.z = width;

    /* create light */
    {
      const pointLight = new THREE.PointLight();
      pointLight.position.set(0,0,width);
      scene.add(pointLight);

      //const sphereSize = 15;
      //const pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);
      //scene.add(pointLightHelper);
    }

    const radius = 15;
    const sphere = () => {
        const geometry = new THREE.SphereGeometry(radius);
        const material = new THREE.MeshPhongMaterial();
        const mesh = new THREE.Mesh( geometry, material );
        return mesh;
    }

    const stars = new THREE.Group();
    stars.name = "stars";
    scene.add(stars);

    draw = (points,[r,g,b]) => {
        const N = points.length - stars.children.length;
        if (N == 0) {}
        else if (N > 0)
            for (let i=N; i--;)
                stars.add(sphere());
        else /* N < 0 */
            for (let i=N; i++;)
                stars.remove[stars.children[0]];

        const [rr,gg,bb] = [r/255, g/255, b/255];
        points.forEach(([x,y,z],i) => {
            stars.children[i].position.set(x,-y,z);
            stars.children[i].material.color.setRGB(rr,gg,bb);
        });

        renderer.render(scene, camera);
    }

    /* debug */
    //import("./ArcballControls.js").then(module => {
    //    const controls = new module.ArcballControls( camera, renderer.domElement, scene );
    //    controls.addEventListener('change', () => { renderer.render( scene, camera ); });
    //});

    draw(points, color);
}
