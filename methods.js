/* generate one point in [x,y,z] on ths shape of given radius */
export class PointGenerators {
    constructor(R) {
        this.R = R;
    }
    ring = () => {
        const R = this.R;
        const th = Math.random() * 2 * Math.PI;
        return [R * Math.cos(th), 0, R * Math.sin(th)];
    }
    tetrahedron = () => {
        const R = this.R;
        const edge = parseInt(Math.random() * 6);
        let v1, v2;
        switch (edge) {
            case 0: v1 = [ R/2,  R/2,  R/2]; v2 = [-R/2, -R/2,  R/2]; break;
            case 1: v1 = [ R/2,  R/2,  R/2]; v2 = [ R/2, -R/2, -R/2]; break;
            case 2: v1 = [ R/2,  R/2,  R/2]; v2 = [-R/2,  R/2, -R/2]; break;
            case 3: v1 = [-R/2, -R/2,  R/2]; v2 = [ R/2, -R/2, -R/2]; break;
            case 4: v1 = [-R/2, -R/2,  R/2]; v2 = [-R/2,  R/2, -R/2]; break;
            case 5: v1 = [ R/2, -R/2, -R/2]; v2 = [-R/2,  R/2, -R/2]; break;
        }
        const offset = Math.random();
        const nx = offset * (v2[0] - v1[0]) + v1[0];
        const ny = offset * (v2[1] - v1[1]) + v1[1];
        const nz = offset * (v2[2] - v1[2]) + v1[2];
        return [nx, ny, nz];
    }
    escherian_knot = () => {
        const R = this.R;
        const t = Math.random() * 2 * Math.PI;
        const th = 2 * t;
        const phi = ( Math.PI * (Math.cos(3 * t) + 3) ) / 6
        const r = (Math.sin(3 * t) + 3) * R / 4;

        const nx = r * Math.sin(phi) * Math.cos(th);
        const ny = r * Math.cos(phi);
        const nz = r * Math.sin(phi) * Math.sin(th);

        return [nx,ny,nz];
    }
};

test.add(() => {
    const obj = {ring: (new PointGenerators(10)).ring};
    const [x,y,z] = obj.ring();
    assert(!Number.isNaN(x));
});

test.add(() => {
    const [x,y,z] = (new PointGenerators(10)).ring();
    assert(Math.abs(10**2 - (x**2+z**2)) < 0.00001);
});

/* iterate colors repeatedly */
export function* color_gen() {
    for (;;) {
        for (let g=0, b=255; b; g+=5, b-=5) { yield [0,g,b]; }
        for (let r=0, g=255; g; r+=5, g-=5) { yield [r,g,0]; }
        for (let b=0, r=255; r; b+=5, r-=5) { yield [r,0,b]; }
    }
};

test.add(() => {
    const color_iter = color_gen(), {value: [r,g,b], done} = color_iter.next();
    assert(r===0 && g===0 && b===255 && done===false);
});
