import { PointGenerators, color_gen } from "./methods.js";

// Not detect `rotateSpeed`, `mousex`, `mousey`;
// on the other hand, optimize the rotate matrix
const rotateSpeed = 0.03, mousex = 80, mousey = 60;
function* rotate_axes(points) {
    yield points;
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

function* style_gen(point_iter, [cx,cy], opaque, color_iter) {
    for (let ps of point_iter)
        yield [ps.map(([x,y,z]) => [y+cy, x+cx, Number.parseInt(z), opaque(z)]), color_iter.next().value];
}

const stars_radius_ratio = 0.9;
const point_radius = 15 /* px */;
export default class Model extends EventTarget {
    constructor({amount, shape, margin_offset_width}) {
        super();

        console.assert(Number.isInteger(margin_offset_width) && margin_offset_width > 0);
        const shape_radius = margin_offset_width * 0.5 * stars_radius_ratio;
        const point_generators = new PointGenerators(shape_radius);

        const points = [];
        const point_iter = rotate_axes(points);

        const c = margin_offset_width * 0.5 - point_radius;
        const center_position = [c,c];
        const style_iter = style_gen(point_iter, center_position, opaque_by(shape_radius), color_gen());

        console.assert(shape in point_generators);
        const gen_point = point_generators[shape];

        // generate points by amount
        console.assert(Number.isInteger(amount) && amount > 0);
        this.points = points;
        this.gen_point = gen_point;
        this.amount = amount;

        // export iterators
        this.point_iter = point_iter;
        this.style_iter = style_iter;

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
        console.assert(name in this.point_generators);
        this.gen_point = this.point_generators[name];
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

test.add(() => {
    const model = new Model({amount: 1, shape: "ring", margin_offset_width: 500});

    let [[[y,x,z,o], ..._], c] = model.style_iter.next().value;
    //console.log([y,x,z,o,c]);
    assert([y,x,z,o].every(n => !Number.isNaN(n)));
    assert(c.toString() === "0,0,255");
    [[[y,x,z,o], ..._], c] = model.style_iter.next().value;
    //console.log([y,x,z,o,c]);
    assert(c.toString() === "0,5,250");
});
