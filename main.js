import { model } from "./core.js";
import * as universe from "./universe.js";

const field_amount = document.getElementById("amount");
const field_shape = document.getElementById("shape");

/* disable inputs during init app */
[field_amount, field_shape].forEach(field => field.disable = true);

/* init MVC model */
model.init({
    margin_offset_width: parseInt(document.body.offsetWidth),
    stars_radius_ratio: 0.9,
    point_radius: 15 /* px */,
    default_amount: 16,
    default_shape_id: "1",
});

/* init `amount`:field: */
field_amount.setAttribute("value", model.default_amount);
console.assert(parseInt(field_amount.value) === model.default_amount);

/* init `shape`:field: */
const option = document.getElementById("shape-option").content.firstElementChild;
field_shape.append(...model.supports.map((v,i) => {
    const opt = option.cloneNode();
    opt.value = i;
    opt.text = v;
    if (opt.value === model.default_shape_id)  // represent default value to HTML
        opt.setAttribute("selected", "");
    return opt;
}));
console.assert(field_shape.value === model.default_shape_id);

/* init universe */
universe.init(model);

/* activate animation to represent model */
const min_interval= 50 /* ms */;
let lasttime = 0;
function frame(timestamp) {
    if (timestamp - lasttime > min_interval) {
        lasttime = timestamp;
        universe.draw(model);
    }
    requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

/* hook events */
field_amount.addEventListener("change", event => {
    model.set_amount(parseInt(event.target.value));
});
field_shape.addEventListener("change", event => {
    field_amount.disabled = true;
    model.set_shape(event.target.value, () => {
        field_amount.disabled = false;
    });
});

/* enable inputs after init app */
[field_amount, field_shape].forEach(field => field.disable = false);
