export let draw;

export function init (points, color, opaque) {
    const canvas = document.getElementById("unicanvas");
    const ctx = canvas.getContext("2d");
    console.assert(ctx);

    canvas.width = canvas.height = window.H; //document.body.offsetWidth;

    const r = 15;
    const draw_circle = (x,y,style) => {
        ctx.beginPath();
        ctx.strokeStyle = "transparent";
        ctx.fillStyle = style;
        ctx.arc(x,y,r,0,Math.PI*2);
        ctx.fill();
        ctx.stroke();
    };

    const [cx,cy] = [canvas.width/2, canvas.height/2];

    draw = (points,[r,g,b]) => {
        // fill background
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // draw points behind the center
        for (let [x,y,z] of points)
            if (z < 0)
                draw_circle(x+cx, y+cy, `rgba(${r},${g},${b},${opaque(z)})`);

        // draw center
        draw_circle(canvas.width/2, canvas.height/2, "yellow");

        // draw points in front of the center
        for (let [x,y,z] of points)
            if (z >= 0)
                draw_circle(x+cx, y+cy, `rgba(${r},${g},${b},${opaque(z)}`);
    };

    draw(points, color);
}
