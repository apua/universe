//TODO: draw the "fetch" and "load" diagram to show the design

/*
 * main script
 */

import { supports, init_model, model, set_shape } from "./core.js";
import * as universe from "./universe.js";

const field_amount = document.getElementById("amount");
const field_shape = document.getElementById("shape");

// set default value to :field:`amount`
field_amount.value = 16;

// set options to :field:`shape`
const option = document.getElementById("shape-option").content.firstElementChild;
field_shape.append(...supports.map((v,i) => {
    const opt = option.cloneNode();
    opt.value = i;
    opt.text = v;
    return opt;
}));

// initialize model
init_model({
    margin_offset_width: parseInt(document.body.offsetWidth),
    stars_radius_ratio: 0.9,
    point_radius: 15 /* px */,
    shape_id: field_shape.value,
});

// initialize universe
universe.init(model, parseInt(field_amount.value), field_amount, field_shape);
universe.animate(model, 50);

// event hook
field_amount.addEventListener("change", event => {
    const new_ = parseInt(event.target.value);
    const orig = model.points.length;
    if (new_ == orig)
        throw new Error("input \"amount\" doesn't change but event triggered");
    const [N, op] = new_>orig ? [new_-orig , "extend"] : [orig-new_ , "shrink"] ;
    model[op](N);
    universe[op](N);
    console.log(`${op} by ${N}`);
});
field_shape.addEventListener("change", event => {
    field_amount.disabled = true;
    set_shape(event.target.value, () => field_amount.disabled = false);
});
