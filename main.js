import Model from "./model.js";
import * as universe from "./universe.js";
import * as unicanvas from "./unicanvas.js";
import * as unisvg from "./unisvg.js";
import * as uniwebgl from "./uniwebgl.js";

const field_amount = document.getElementById("amount");
const field_shape = document.getElementById("shape");

/* disable inputs during init app */
[field_amount, field_shape].forEach(field => field.disable = true);

/* init MVC model */
const model = new Model({
    amount: 42,
    shape: "ring",
    margin_offset_width: Number.parseInt(document.body.offsetWidth),
});

/* init `amount`:field: */
const navigation = performance.getEntriesByType("navigation")[0];
if (navigation === undefined) { /* mobile, has no refresh case */
    field_amount.setAttribute("value", model.amount);
} else if (navigation.type === "navigate") {
    console.debug("page navigate");
    field_amount.setAttribute("value", model.amount);
    console.assert(Number.parseInt(field_amount.value) === model.amount);
} else if (navigation.type === "reload") {
    console.debug("page reload");
    field_amount.value = model.amount;
} else {}

/* init `shape`:field: */
const option = document.getElementById("shape-option").content.firstElementChild;
let opt;
for (let k in model.point_generators) {
    opt = option.cloneNode();
    opt.value = opt.text = k;
    if (k === model.shape)
        opt.setAttribute("selected", "");
    field_shape.append(opt);
}
console.assert(field_shape.value === model.shape);

/* init universe */
let points = model.point_iter.next().value;
let points_style = model.to_style(points);
let color = model.color_iter.next().value;
universe.init(model.point_radius, model.center_position, points_style, color);
unicanvas.init(points, color, model.opaque);
unisvg.init(points, color, model.opaque);
uniwebgl.init(points, color);

/* activate animation to represent model */
const min_interval= 50 /* ms */;
let lasttime = 0;
function frame(timestamp) {
    if (timestamp - lasttime > min_interval) {
        lasttime = timestamp;
        points = model.point_iter.next().value;
        points_style = model.to_style(points);
        color = model.color_iter.next().value;

        universe.draw(points_style, color);
        unicanvas.draw(points, color);
        unisvg.draw(points, color);
        uniwebgl.draw(points, color);
    }
    requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

/* hook events */
field_amount.addEventListener("change", event => {
    const value = Number.parseInt(event.target.value);
    console.debug(`set amount value: ${value}, type: ${typeof value}`);
    model.amount = value;
    console.debug(`amount of points: ${model.points.length}`);
    console.assert(model.points.length === value);
});
field_shape.addEventListener("change", event => {
    const value = event.target.value;
    console.debug(`set shape name: ${value}, is supported: ${value in model.point_generators}`);
    field_amount.disabled = true;
    model.shape = value;
});
model.addEventListener("shapechanged", event => {
    field_amount.disabled = false;
});

/* enable inputs after init app */
[field_amount, field_shape].forEach(field => field.disable = false);
