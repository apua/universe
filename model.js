import { PointGenerators, color_gen } from "./methods.js";

// not detect `rotateSpeed`, `mousex`, `mousey`
// and optimize the rotate matrix
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

const stars_radius_ratio = 0.9;
const point_radius = 15 /* px */;
export default class Model extends EventTarget {
    points = [];
    point_iter = rotate_axes(this.points);

    point_generators;
    color_iter = color_gen();

    constructor({amount, shape, margin_offset_width}) {
        super();

        console.assert(Number.isInteger(margin_offset_width) && margin_offset_width > 0);
        const MR = margin_offset_width * 0.5;
        this.point_generators = new PointGenerators(MR * stars_radius_ratio);

        console.assert(shape in this.point_generators);
        this.gen_point = this.point_generators[shape];

        console.assert(Number.isInteger(amount) && amount > 0);
        this.amount = amount;

        this.center_position = [MR-point_radius, MR-point_radius];  //FIXME: adjust position function?
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
        margin_offset_width: parseInt(document.body.offsetWidth),
    });

    assert(model.amount === 42);
    assert(model.shape === "ring");
    const width = parseInt(document.body.offsetWidth);
    assert(model.center_position.every(v => v === width/2-15));

    assert(model.points.length === 42);
    model.amount = 94;
    assert(model.points.length === 94);
    model.amount = 87;
    assert(model.points.length === 87);

    assert(model.gen_point.name === "ring");
    model.shape = "escherian_knot";
    assert(model.gen_point.name === "escherian_knot");

    let _callback_called = false;
    model.addEventListener("shapechanged", () => {_callback_called = true;});
    model.dispatchEvent(new Event("shapechanged"));
    assert(_callback_called);
});
