let stars, star_tmpl;

export function init(r, points_style, color) {
    const universe = document.getElementById("universe");
    universe.style = `width: ${window.H}px;`;

    const root = document.getElementById("universe").attachShadow({mode: "closed"});
    root.append(document.getElementById("universe-shadowroot").content);
    root.styleSheets[0].insertRule(`.point{ width: ${r*2}px; height: ${r*2}px; }`);
    root.getElementById("center").style = `top: calc(50% - ${r}px); left: calc(50% - ${r}px); background-color: yellow;`;

    stars = root.getElementById("stars");
    star_tmpl = root.getElementById("star").content.firstElementChild;

    draw(points_style, color);
}
export function draw(ps, [r,g,b]) {
    const color = `rgb(${r},${g},${b})`;
    const N = ps.length - stars.childElementCount;
    if (N == 0) {}
    else if (N > 0)
        for (let i=N; i--;)
            stars.append(star_tmpl.cloneNode());
    else /* N < 0 */
        for (let i=N; i++;)
            stars.lastElementChild.remove();

    // NOTE: Element.children is bad on indexing, good on iteration;
    //       in contrast, Array is good on indexing
    let i = 0, p;
    for (let v of stars.children) {
        p = ps[i];
        v.style = `top: ${p[0]}px; left: ${p[1]}px; z-index: ${p[2]}; opacity: ${p[3]};`
                  + ` background-color: ${color};`;
        i += 1;
    }
}
