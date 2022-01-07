let root, stars, star_tmpl;

export function init(model, amount) {
    // create shadow root onto universe
    root = document.getElementById("universe").attachShadow({mode: "closed"});
    root.append(document.getElementById("universe-shadowroot").content);
    root.styleSheets[0].insertRule(`
        .point{
            width: ${model.point_radius * 2}px;
            height: ${model.point_radius * 2}px;
        }
    `);
    window.root = root;

    stars = root.getElementById("stars");
    star_tmpl = root.getElementById("star").content.firstElementChild;

    const center = root.getElementById("center");
    const [cx,cy] = model.center_position;
    center.style = `top: ${cy}px; left: ${cx}px; background-color: yellow;`;

    // * add points by amount
    extend(amount);

    //FIXME draw first
}
export function extend(N) {
    for (let i=N; i--;)
        stars.append(star_tmpl.cloneNode());
}
export function shrink(N) {
    for (let i=N; i--;)
        stars.lastElementChild.remove();
}
export function draw(model) {
    // NOTE:
    //   Element.children is bad on indexing, good on iteration
    //   Array is good on indexing
    const [r,g,b] = model.gen_color.next().value, color = `rgb(${r},${g},${b})`;
    const ps = model.next_points();
    const N = ps.length - stars.childElementCount;
    if (N > 0) extend(N); else if (N < 0) shrink(-N);
    let i = 0;
    for (let v of stars.children) {
        const p = ps[i];
        v.style = `top: ${p[0]}px; left: ${p[1]}px; z-index: ${p[2]}; opacity: ${p[3]};`
                  + ` background-color: ${color};`;
        i += 1;
    }
}
export function animate (model, min_slot_millisecond) {
    function step(timestamp) {
        if (timestamp - lasttime > min_slot_millisecond) {
            lasttime = timestamp;
            draw(model);
        }
        requestAnimationFrame(step);
    }
    let lasttime = 0;
    requestAnimationFrame(step);
}
