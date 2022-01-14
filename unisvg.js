export let draw;

export function init (points, color, opaque) {
    const width = document.body.offsetWidth;
    const cx = width/2, cy = cx, pr = 15;

    const svg = document.getElementById("unisvg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", width);

    const circles = document.getElementById("circles");
    const circle_tmpl = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle_tmpl.setAttribute("r", pr);

    draw = (points, color) => {
        const N = points.length + 1 - circles.childElementCount;
        if (N == 0) {}
        else if (N > 0)
            for (let i=N; i--;)
                circles.append(circle_tmpl.cloneNode());
        else /* N < 0 */
            for (let i=N; i++;)
                circles.lastElementChild.remove();
        //console.debug('len:', points.length, circles.childElementCount);

        const attr_iter = (function* () {
            const [r,g,b] = color;
            for (let [x,y,z] of points)
                if (z < 0)
                    yield [x+cx,y+cy,`rgba(${r},${g},${b},${opaque(z)})`]
            yield [cx,cy,"yellow",1]
            for (let [x,y,z] of points)
                if (z >= 0)
                    yield [x+cx,y+cy,`rgba(${r},${g},${b},${opaque(z)})`]
        })();

        {
          let cx,cy,fill;
          for (let c of circles.children) {
              [cx,cy,fill] = attr_iter.next().value;
              c.setAttribute("cx", cx);
              c.setAttribute("cy", cy);
              c.setAttribute("fill", fill);
          }
        }
    }

    draw(points, color);
}
