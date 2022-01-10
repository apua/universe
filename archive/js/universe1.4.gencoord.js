function genCoord (shape, R) {
    if (shape == 'sphere') {
        return _sphere(R);
    } else if (shape == 'ring') {
        return _ring(R);
    } else if (shape == '2ring') {
        //return _pie(R);
        return _2ring(R);
    } else if (shape == 'cage') {
        return _cage(R);
    } else if (shape == '2cube') {
        return _2cube(R);
    } else if (shape == '2sphere') {
        return _2sphere(R);
    } else if (shape == 'tetrahedron') {
        return _tetrahedron(R);
    } else if (shape == 'escherian-knot') {
        return _escherian_knot(R);
    } else {
        return genCoord('sphere', R);
    }
};

function _sphere (R) {
    var th = Math.random() * 2 * Math.PI;
    var th2 = Math.sqrt(Math.random()) * Math.PI / 2;
    var half = parseInt(Math.random()*2);
    if (half == 0) {
        nx = R * Math.sin(th2) * Math.cos(th);
        ny = R * Math.cos(th2);
        nz = R * Math.sin(th2) * Math.sin(th);
    } else if (half == 1 || true) {
        nx = R * Math.sin(th2) * Math.cos(th);
        ny =-R * Math.cos(th2);
        nz = R * Math.sin(th2) * Math.sin(th);
    }
    return [nx,ny,nz];
}

function _ring (R) {
    var th = Math.random() * 2 * Math.PI;
    nx = R * Math.cos(th);
    ny = 0;
    nz = R * Math.sin(th);
    return [nx, ny, nz];
}

function _pie (R) {
    var th = Math.random() * 2 * Math.PI;
    var dist = Math.sqrt(Math.random()) * R;
    nx = dist * Math.cos(th);
    ny = 0;
    nz = dist * Math.sin(th);
    return [nx, ny, nz];
}

function _2ring (R) {
    var which = parseInt(Math.random() * 2);
    var th = Math.random() * 2 * Math.PI;
    if (which == 0) {
        nx = R * 2 / 3 * Math.cos(th) + R/3;
        ny = 0;
        nz = R * 2 / 3 * Math.sin(th);
    } else {
        nx = R * 2 / 3 * Math.cos(th) - R/3;
        ny = R * 2 / 3 * Math.sin(th);
        nz = 0;
    }
    return [nx, ny, nz];
}

function _cage (R) {
    var ring = parseInt(Math.random() * 3);
    var th = Math.random() * 2 * Math.PI;
    switch (ring) {
        case 0:
            nx = 0;
            ny = R * Math.cos(th);
            nz = R * Math.sin(th);
            break;
        case 1:
            nx = R * Math.cos(th);
            ny = 0;
            nz = R * Math.sin(th);
            break;
        case 2:
            nx = R * Math.cos(th);
            ny = R * Math.sin(th);
            nz = 0;
            break;
    }
    return [nx, ny, nz];
}

function _2cube (R) {
    var edge = parseInt(Math.random() * 12);
    var rrsize = parseInt(Math.random() * 3);
    var rr = R / Math.sqrt(3);
    if (rrsize == 0) { rr = rr / 2; }
    var pos = (Math.random() * rr*2) - rr;
    //console.log(pos);
    switch (edge) {
        case 0:  nx = pos; ny =  rr; nz =  rr; break;
        case 1:  nx = pos; ny =  rr; nz = -rr; break;
        case 2:  nx = pos; ny = -rr; nz = -rr; break;
        case 3:  nx = pos; ny = -rr; nz =  rr; break;
        case 4:  nx =  rr; ny = pos; nz =  rr; break;
        case 5:  nx =  rr; ny = pos; nz = -rr; break;
        case 6:  nx = -rr; ny = pos; nz = -rr; break;
        case 7:  nx = -rr; ny = pos; nz =  rr; break;
        case 8:  nx =  rr; ny =  rr; nz = pos; break;
        case 9:  nx = -rr; ny =  rr; nz = pos; break;
        case 10: nx = -rr; ny = -rr; nz = pos; break;
        case 11: nx =  rr; ny = -rr; nz = pos; break;
    }
    return [nx, ny, nz];
}

function _2sphere (R) {
    var ball = parseInt(Math.random() * 2);
    var rr = R / 2;
    var cx;
    cx = (ball == 0) ? R*2/3 : -R*2/3;
    var th = Math.random() * 2 * Math.PI;
    var th2 = Math.random() * 2 * Math.PI;            
    nx = rr * Math.cos(th2) * Math.cos(th) + cx;
    ny = rr * Math.sin(th2);
    nz = rr * Math.cos(th2) * Math.sin(th);
    return [nx, ny, nz];
}

function _tetrahedron (R) {
    var v1 = [0, 0, 0];
    var v2 = [0, 0, 0];
    var edge = parseInt(Math.random() * 6);
    switch (edge) {
        case 0:v1 = [ R/2,  R/2,  R/2]; v2 = [-R/2, -R/2,  R/2]; break;
        case 1:v1 = [ R/2,  R/2,  R/2]; v2 = [ R/2, -R/2, -R/2]; break;
        case 2:v1 = [ R/2,  R/2,  R/2]; v2 = [-R/2,  R/2, -R/2]; break;
        case 3:v1 = [-R/2, -R/2,  R/2]; v2 = [ R/2, -R/2, -R/2]; break;
        case 4:v1 = [-R/2, -R/2,  R/2]; v2 = [-R/2,  R/2, -R/2]; break;
        case 5:v1 = [ R/2, -R/2, -R/2]; v2 = [-R/2,  R/2, -R/2]; break;
    }
    var offset = Math.random();
    nx = offset * (v2[0] - v1[0]) + v1[0];
    ny = offset * (v2[1] - v1[1]) + v1[1];
    nz = offset * (v2[2] - v1[2]) + v1[2];
    return [nx, ny, nz];
}

function _escherian_knot (R) {
    var t = Math.random() * 2 * Math.PI;
    var th = 2 * t;
    var phi = ( Math.PI * (Math.cos(3 * t) + 3) ) / 6
    var r = (Math.sin(3 * t) + 3) * R / 4;

    nx = r * Math.sin(phi) * Math.cos(th);
    ny = r * Math.cos(phi);
    nz = r * Math.sin(phi) * Math.sin(th);

    return [nx,ny,nz];
}

