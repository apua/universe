const start_animate = (f, min_slot_millisecond) => {
  const step = timestamp => {
    if (timestamp - lasttime > min_slot_millisecond) {
      lasttime = timestamp;
      f();
    }
    requestAnimationFrame(step);
  };
  let lasttime = 0;
  f();
  requestAnimationFrame(step);
};

const base = [
  [495.718, 270.463,  28, 0.481112],
  [459.204, 202.545,  71, 0.553017],
  [291.131, 329.111, 197, 0.103881],
  [127.157, 199.509,   5, 0.441971],
  [380.003, 445.677, 111, 0.618759],
  [230.889, 467.568,  84, 0.292458],
  [463.723, 395.153,  64, 0.326084],
  [250.754, 491.869,  27, 0.387347],
  [417.289, 143.329,  41, 0.364668],
  [137.206, 193.849,  47, 0.354628],
  [496.941,  318.47,  29, 0.384089],
];
const points = [];
window.points = points;

const wasm = {
  extend: N => {
    const len = points.length;
    const new_len = len + N;
    const base_len = base.length;
    for (let i = len; i < new_len; i++) {
      if (i < base_len) {
        points.push(base[i]);
      } else {
        points.push([0, i*10, 0, 1]);
      }
    }
  },
  shrink: N => {
    points.splice(points.length-N,N);
  },
  set_shape: console.log,
  next_points: () => points,
  supports: [
    "sphere",
    "ring",
    "2ring",
    "cage",
    "2cube",
    "2sphere",
    "tetrahedron",
    "escherian-knot",
  ],
};

export const supports = wasm.supports;
export const main = (root) => {
  const amount_input = document.getElementById("amount");
  const shape_input = document.getElementById("shape");

  // * design and hook properties/methods onto `stars`
  const stars = root.querySelector("div.stars");
  stars.tmpl = root.querySelector("template").content.firstElementChild;
  stars.draw = () => {
    // NOTE:
    //   Element.children is bad on indexing, good on iteration
    //   Array is good on indexing
    const ps = wasm.next_points();
    let i = 0;
    for (let v of stars.children) {
      const p = ps[i];
      v.style = `top: ${p[0]}px; left: ${p[1]}px; z-index: ${p[2]}; opacity: ${p[3]};`;
      i += 1;
    }
  };
  stars.extend = N => { for (let i=N; i--; ) stars.append(stars.tmpl.cloneNode()); };
  stars.shrink = N => { for (let i=N; i--; ) stars.lastElementChild.remove(); };

  // * add points by amount
  wasm.extend(amount_input.value);
  stars.extend(amount_input.value);

  // * observe inputs
  // NOTE:
  //   handler will belong to target, thus `this === event.target`
  stars.handle_amount_change = event => {
    // NOTE:
    //   although this handler should be independent with others and no race condition,
    //   I'd like to modify calculation and rendering parts in order.
    const new_ = event.target.value;
    const orig = stars.childElementCount;
    if (new_ > orig) {
      const N = new_ - orig; wasm.extend(N); stars.extend(N); console.log(`extend by ${N}`);
    } else if (new_ < orig) {
      const N = orig - new_; stars.shrink(N); wasm.shrink(N); console.log(`shrink by ${N}`);
    } else {
      throw new Error("input \"amount\" doesn't change but event triggered");
    }
  };
  amount_input.addEventListener("change", stars.handle_amount_change);
  stars.handle_shape_change = event => { wasm.set_shape(event.target.value); };
  shape_input.addEventListener("change", stars.handle_shape_change);

  // * animate by tick
  start_animate(stars.draw, 50);
};
