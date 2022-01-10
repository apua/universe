export class PointGenerators {
    #R;
    constructor(R) {
        this.#R = R;
    }
    ring = () => {
        const R = this.#R;
        const th = Math.random() * 2 * Math.PI;
        return [R * Math.cos(th), 0, R * Math.sin(th)];
    }
    tetrahedron = () => {
        const R = this.#R;
        const edge = Number.parseInt(Math.random() * 6);
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
    "escherian-knot" = () => {
        const R = this.#R;
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

// Not detect `rotateSpeed`, `mousex`, `mousey`;
// on the other hand, optimize the rotate matrix
const rotateSpeed = 0.03, mousex = 80, mousey = 60;
function* rotate_axes(points) {
    const
        x = mousex, y = mousey,
        x2 = x ** 2, y2 = y ** 2, xy = x * y, a2 = x2 + y2, a = Math.sqrt(a2),
        x_a = x/a, y_a = y/a, _a2 = 1/a2,
        _2pi = 2 * Math.PI;
    let thi = 0, cosb, sinb;
    for (;;) {
        thi = (thi + rotateSpeed) % _2pi;
        cosb = Math.cos(thi);
        sinb = Math.sin(thi);
        yield points.map(([px,py,pz]) => [
            px * ((x2*cosb+y2)*_a2) + py * ((xy*cosb-xy)*_a2) - pz * (y_a*sinb) ,
            px * ((xy*cosb-xy)*_a2) + py * ((y2*cosb+x2)*_a2) - pz * (y_a*sinb) ,
            px * (x_a*sinb)         + py * (x_a*sinb)         + pz * (cosb) ,
        ]);
    }
}

function opaque_by(R) {
    return z => (z+R)/(3*R)+0.1 ;
}

test.add(() => {
    assert(opaque_by(1)(2) === 1.1);
    assert(opaque_by(1)(-1) === 0.1);
});

function* transform(points, gen_point, steps) {
    let nx,ny,nz;
    const new_points = points.map(gen_point);
    const delta = points.map(([px,py,pz], i) => {
        [nx,ny,nz] = new_points[i];
        return [(nx-px)/steps, (ny-py)/steps, (nz-pz)/steps];
    });

    for (let s=steps; s--;) {
        yield points.forEach(([px,py,pz],i) => {
            const [dx,dy,dz] = delta[i];
            points[i] = [px+dx, py+dy, pz+dz];
        });
    }
    points.splice(0);
    points.push(...new_points);
}

const stars_radius_ratio = 0.9;
const point_radius = 15 /* px */;
export default class Model extends EventTarget {
    #point_iter;
    constructor({amount, shape, margin_offset_width}) {
        super();

        console.assert(Number.isInteger(margin_offset_width) && margin_offset_width > 0);
        const shape_radius = margin_offset_width * 0.5 * stars_radius_ratio;
        const point_generators = new PointGenerators(shape_radius);

        // initialize point generator
        console.assert(shape in point_generators);
        this.gen_point = point_generators[shape];

        // initialize points by amount
        console.assert(Number.isInteger(amount) && amount > 0);
        const points = [];
        this.points = points;
        this.amount = amount;

        // initialize point iterator
        // NOTE: make "switching iterator" internally to prevent broken by direct reference on the iterator
        //this.point_iter = rotate_axes(points);
        const _this = this;
        this.#point_iter = (function*() { yield _this.points; yield* rotate_axes(points) })();
        this.point_iter = (function* () {for (;;) { yield _this.#point_iter.next().value; }})();

        // initialize color iterator
        this.color_iter = color_gen();

        // generate "coordinates -> CSS style"
        const cx = margin_offset_width * 0.5 - point_radius, cy = cx;
        const center_position = [cx,cy];
        const opaque = opaque_by(shape_radius);
        this.to_style = ps => ps.map(([x,y,z]) => [y+cy, x+cx, Number.parseInt(z), opaque(z)]);

        // export information
        this.point_radius = point_radius;
        this.center_position = center_position;
        this.point_generators = point_generators;
    }
    get amount() {
        return this.points.length;
    }
    set amount(N) {
        const len = this.points.length;
        if (N > len) {
            for (let i = len; i < N; i++)
                this.points.push(this.gen_point());
        } else if (N < len) {
            const start = N, delete_count = len-N;
            this.points.splice(start, delete_count);
        } else {}
    }
    get shape() {
        return this.gen_point.name;
    }
    set shape(name) {
        if (name in this.point_generators) {
            this.gen_point = this.point_generators[name];
            const trans_iter = transform(this.points, this.gen_point, 50);
            const _this = this, rotate_iter = this.#point_iter;
            this.#point_iter = (function* () {
                while (! trans_iter.next().done)
                    yield rotate_iter.next().value;

                _this.dispatchEvent(new Event("shapechanged"));
                _this.#point_iter = rotate_iter;
                yield _this.#point_iter.next().value;
            })();
        } else {}
    }
};

test.add(() => {
    const model = new Model({
        amount: 42,
        shape: "ring",
        margin_offset_width: Number.parseInt(document.body.offsetWidth),
    });

    assert(model.amount === 42);
    assert(model.shape === "ring");
    const width = Number.parseInt(document.body.offsetWidth);
    assert(model.center_position.every(v => v === width/2-15));

    assert(model.points.length === 42);
    model.amount = 94;
    assert(model.points.length === 94);
    model.amount = 87;
    assert(model.points.length === 87);

    assert(model.gen_point.name === "ring");
    model.shape = "escherian-knot";
    assert(model.gen_point.name === "escherian-knot");

    let _callback_called = false;
    model.addEventListener("shapechanged", () => {_callback_called = true;});
    model.dispatchEvent(new Event("shapechanged"));
    assert(_callback_called);
});

test.add(() => {
    const model = new Model({amount: 1, shape: "ring", margin_offset_width: 500});

    const p1 = model.points[0];
    const p2 = model.point_iter.next().value[0];
    console.assert(p1.every((v,i) => v === p2[i]));
});
