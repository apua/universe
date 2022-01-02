const wasm = {
  next_points: () => {
    return [
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
  },
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
  stars.draw = function() {
    // FIXME: the real amount of stars is fixed at init
    const ps = wasm.next_points();

    // NOTE:
    //   Element.children is bad on indexing, good on iteration
    //   Array is good on indexing
    let i = 0;
    for (let v of this.children) {
      const p = ps[i];
      v.style = `top: ${p[0]}px; left: ${p[1]}px; z-index: ${p[2]}; opacity: ${p[3]};`;
      i += 1;
    }
  };

  // * add points by amount
  for (let i=amount_input.value; i--; ) {
    stars.append(stars.tmpl.cloneNode());
  }

  // * observe inputs
  // NOTE:
  //   handler will belong to target, thus `this === event.target`
  stars.handle_amount_change = event => { console.log(event.target.value, stars) };
  stars.handle_shape_change = event => { console.log(event.target.value, stars) };
  amount_input.addEventListener("change", stars.handle_amount_change);
  shape_input.addEventListener("change", stars.handle_shape_change);

  // * animate by tick
  stars.draw();
  let last = 0;
  const step = timestamp => {
    if (timestamp - last > 1000) {
      last = timestamp;
      stars.draw();
      //console.debug("draw", last);
    }
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};
