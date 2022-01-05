//TODO: draw the "fetch" and "load" diagram to show the design

document.getElementById("amount").value = 16;

//////////////////////////////

import { supports } from "./core.js";
const option = document.getElementById("shape-option").content.firstElementChild;
document.getElementById("shape").append(...supports.map((v,i) => {
    const opt = option.cloneNode();
    opt.value = i;
    opt.text = v;
    return opt;
}));

//////////////////////////////

import { main } from "./core.js";

const universe = document.getElementById("universe");
const root = universe.attachShadow({mode:"open"});
root.append(document.getElementById("universe-shadowroot").content);
window.root = root;

main(root);
