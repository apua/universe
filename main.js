import Model from "./model.js";
import * as universe from "./universe.js";

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
field_amount.setAttribute("value", model.amount);
const navigation_type = performance.getEntriesByType("navigation")[0].type;
if (navigation_type === "navigate")
    console.assert(Number.parseInt(field_amount.value) === model.amount);

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
universe.init(model.point_radius, model.center_position, model.style_iter);

/* activate animation to represent model */
const min_interval= 50 /* ms */;
let lasttime = 0;
function frame(timestamp) {
    if (timestamp - lasttime > min_interval) {
        lasttime = timestamp;
        universe.draw(model.style_iter);
    }
    requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

/* hook events */
field_amount.addEventListener("change", event => {
    model.amount = Number.parseInt(event.target.value);
});
field_shape.addEventListener("change", event => {
//    field_amount.disabled = true;
//    model.set_shape(event.target.value, () => {
//        field_amount.disabled = false;
//    });
});

/* enable inputs after init app */
[field_amount, field_shape].forEach(field => field.disable = false);
