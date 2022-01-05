/*
 * -  point radius should be constant in JS
 * -  opacity max is 2/3 now, could be adjusted while it is linear.
 * -  how to keep or drop input settings after refresh
 * -  logger disabling
 * TODO:
 * -  UI setting shoud be moved to JS
 * -  handle input string to number; parseInt, NaN
 * -  how about modify CSS rule directly
 */

window.__DEBUG__ = true;

const debug = (...args) => { __DEBUG__ && console.debug(...args) };
const table = (...args) => { __DEBUG__ && console.table(...args) };
const trace = (...args) => { __DEBUG__ && console.trace(...args) };

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

const points = [];
window.points = points;

const wasm = {
    extend: N => {
        const len = points.length;
        const new_len = len + N;
        const gen = wasm.gencoords[S];
        for (let i = len; i < new_len; i++) points.push(gen());
    },
    shrink: N => {
        points.splice(points.length-N,N);
    },
    next_points: () => wasm.move_points(),  //FIXME it doesn't provide init points
    transform: (new_points, steps, post_actions) => {
        debug(new_points.length, steps, S);
        const delta = new_points.map(([nx,ny,nz],i) => {
            const [px,py,pz] = points[i];
            return [(nx-px)/steps, (ny-py)/steps, (nz-pz)/steps];
        });
        new_points = points;
        function* g() {
            for (let s=steps; s--;) {
                debug("transform step", s);
                new_points = new_points.map(([px,py,pz],i) => {
                    const [dx,dy,dz] = delta[i];
                    return [px+dx, py+dy, pz+dz];
                });
                yield new_points;
            }
        }
        const gg = g();
        return () => { /* transform by steps */
            debug("closure has been called");
            const {value, done} = gg.next();
            if (done) {
                post_actions();
                return wasm.move_points();
            } else {
                return value.map(([_px,_py,_pz], i) => {
                    points[i] = [_px, _py, _pz];
                    return [_py+MR-PR, _px+MR-PR, Number.parseInt(_pz), (_pz+R) / (3*R) + 0.1];
                });
            }
        };
    },
    move_points: () => points.map(([px,py,pz], i) => {
        const
          sqrt = Math.sqrt, rotateSpeed = 0.03, mousex = 80, mousey = 60,
          cosb = Math.cos(rotateSpeed),
          sinb = Math.sin(rotateSpeed),
          x = mousex,
          y = mousey,
          x2 = x ** 2,
          y2 = y ** 2,
          xy = x * y,
          a2 = x2 + y2,
          a = Math.sqrt(a2);
        const [_px, _py, _pz] = [
            //px * (0.5*(1/sqrt(2)+1)) + py * (0.5*(1/sqrt(2)-1)) + pz * (-0.5) ,
            //px * (0.5*(1/sqrt(2)-1)) + py * (0.5*(1/sqrt(2)+1)) + pz * (-0.5) ,
            //px * (0.5)               + py * (0.5)               + pz * (1/sqrt(2)) ,
            px * ((x2*cosb+y2)/a2) + py * ((xy*cosb-xy)/a2) + pz * ((-1)*y*sinb/a) ,
            px * ((xy*cosb-xy)/a2) + py * ((y2*cosb+x2)/a2) + pz * ((-1)*y*sinb/a) ,
            px * (x*sinb/a)        + py * (x*sinb/a)        + pz * (cosb) ,
        ];
        points[i] = [_px, _py, _pz];
        return [_py+MR-PR, _px+MR-PR, Number.parseInt(_pz), (_pz+R) / (3*R) + 0.1];
    }),
    supports: [
        //"sphere",
        "ring",
        //"2ring",
        //"cage",
        //"2cube",
        //"2sphere",
        "tetrahedron",
        "escherian-knot",
    ],
    gencoords: {
        "ring": () => {
            const th = Math.random() * 2 * Math.PI;
            return [R * Math.cos(th), 0, R * Math.sin(th)];
        },
        "tetrahedron": () => {
            const edge = parseInt(Math.random() * 6);
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
        },
        "escherian-knot": () => {
            const t = Math.random() * 2 * Math.PI;
            const th = 2 * t;
            const phi = ( Math.PI * (Math.cos(3 * t) + 3) ) / 6
            const r = (Math.sin(3 * t) + 3) * R / 4;

            const nx = r * Math.sin(phi) * Math.cos(th);
            const ny = r * Math.cos(phi);
            const nz = r * Math.sin(phi) * Math.sin(th);

            return [nx,ny,nz];
        },
    },
};

let MR; // margin
let R; // radius
let S; // shape
let T, L;
const handlers = {};
let PR; // point radius

const gen_color = (function*(){
  for(;;) {
    for (let g=0, b=255; b; g+=5, b-=5) { yield [0,g,b]; }
    for (let r=0, g=255; g; r+=5, g-=5) { yield [r,g,0]; }
    for (let b=0, r=255; r; b+=5, r-=5) { yield [r,0,b]; }
  }
})();

export const supports = wasm.supports;
export const main = (root) => {
    // common local constants
    const amount_input = document.getElementById("amount");
    const shape_input = document.getElementById("shape");

    // set global once among mulitple impl
    MR = root.querySelector(".sky").offsetWidth * 0.5;
    R = MR * 0.9;
    PR = root.querySelector(".point").offsetWidth * 0.5;
    S = wasm.supports[shape.value];
    handlers.amount_change = event => {
        const new_ = +event.target.value;
        const orig = stars.childElementCount;
        if (new_ > orig) {
            const N = new_ - orig; wasm.extend(N); stars.extend(N); console.log(`extend by ${N}`);
        } else if (new_ < orig) {
            const N = orig - new_; stars.shrink(N); wasm.shrink(N); console.log(`shrink by ${N}`);
        } else {
            throw new Error("input \"amount\" doesn't change but event triggered");
        }
    };
    handlers.shape_change = event => {
        S = wasm.supports[event.target.value];
        const gen = wasm.gencoords[S];
        const new_points = points.map(gen);

        amount_input.disabled = true;
        wasm.next_points = wasm.transform(new_points, 50, () => {
            wasm.next_points = wasm.move_points;
            amount_input.disabled = false;
        });
        console.log("shape", S);
    };

    // * design and hook properties/methods onto `stars`
    const stars = root.querySelector("div.stars");
    stars.tmpl = root.querySelector("template").content.firstElementChild;
    stars.draw = () => {
        // NOTE:
        //   Element.children is bad on indexing, good on iteration
        //   Array is good on indexing
        const [r,g,b] = gen_color.next().value, color = `rgb(${r},${g},${b})`;
        const ps = wasm.next_points();
        let i = 0;
        for (let v of stars.children) {
            const p = ps[i];
            v.style = `top: ${p[0]}px; left: ${p[1]}px; z-index: ${p[2]}; opacity: ${p[3]};`
                      + ` background-color: ${color};`;
            i += 1;
        }
    };
    stars.extend = N => { for (let i=N; i--; ) stars.append(stars.tmpl.cloneNode()); };
    stars.shrink = N => { for (let i=N; i--; ) stars.lastElementChild.remove(); };

    // * add points by amount
    root.querySelector(".center").style = `top: ${MR-PR}px; left: ${MR-PR}px`;
    wasm.extend(+amount_input.value);
    stars.extend(+amount_input.value);

    // * observe inputs
    amount_input.addEventListener("change", handlers.amount_change);
    shape_input.addEventListener("change", handlers.shape_change);

    // * animate by tick
    start_animate(stars.draw, 50);
};
