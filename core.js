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
let PR; // point radius

const gen_color = (function*(){
  for(;;) {
    for (let g=0, b=255; b; g+=5, b-=5) { yield [0,g,b]; }
    for (let r=0, g=255; g; r+=5, g-=5) { yield [r,g,0]; }
    for (let b=0, r=255; r; b+=5, r-=5) { yield [r,0,b]; }
  }
});

export const init_model = ({
        margin_offset_width,
        stars_radius_ratio,
        point_radius,
        shape_id,
        }) => {
    MR = margin_offset_width * 0.5;
    R = MR * stars_radius_ratio;
    PR = point_radius;
    S = wasm.supports[shape_id];

    model.point_radius = PR;
    model.center_position = [MR-PR, MR-PR];
};

export const supports = wasm.supports;


export const model = {
    next_points: () => wasm.next_points(),
    point_radius: null,
    center_position: null,
    gen_color: gen_color(),
    extend: wasm.extend,
    shrink: wasm.shrink,
    points: points,

    set_amount: (N) => {
        if (N > 0) wasm.extend(N); else wasm.shrink(-N);
    },
};

export const set_shape = (shape_id, post_action) => {
    S = wasm.supports[shape_id];
    console.log("shape", S);
    const new_points = points.map(wasm.gencoords[S]);

    wasm.next_points = wasm.transform(new_points, 50, () => {
        wasm.next_points = wasm.move_points;
        post_action();
    });
}
