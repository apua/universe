$(function () {
    var Point = function (xi,yi,zi) {
        this.coord = function (xx,yy,zz) {
            this.x = xx;
            this.y = yy;
            this.z = zz;
        };
        this.x = xi;
        this.y = yi;
        this.z = zi;
        $('#sky').append('<div id="point'+amount+'" class="point star"></div>');
        amount++;
    };
    
    /*********Global variables********/
    var R = 200;
    var amount = 0;
    var center = {
        x:400,
        y:300,
        z:0
    };
    var delay = false;
    var mousex = 0;
    var mousey = 0;
    var mouseAngle = 0;
    var rotateSpeed = 0;
    var distAngleRate = 2500;
    var timeStop = false;
    var state = 'normal';
    var shape = 'sphere';
    var clock = 0;
    var newPos = [];
    /*********************************/
    
    var point = [];
    var genCoord = function () {
        var nx = 0;
        var ny = 0;
        var nz = 0;
        if (shape == 'sphere') {
            var th = Math.random() * 2 * Math.PI;
            var th2 = Math.random() * 2 * Math.PI;
            
            nx = R * Math.cos(th2) * Math.cos(th);
            ny = R * Math.sin(th2);
            nz = R * Math.cos(th2) * Math.sin(th);
        } else if (shape == 'ring') {
            var th = Math.random() * 2 * Math.PI;
            nx = R * Math.cos(th);
            nz = R * Math.sin(th);
        } else if (shape == 'pie') {
            var th = Math.random() * 2 * Math.PI;
            var dist = Math.sqrt(Math.random()) * R;
            nx = dist * Math.cos(th);
            nz = dist * Math.sin(th);
        } else if (shape == '2sphere') {
            var shell = parseInt(Math.random() * 5);
            var dist = R;
            
            if (shell == 0) {
                dist = R / 2;
            } else {
                dist = R;
            }
            var th = Math.random() * 2 * Math.PI;
            var th2 = Math.random() * 2 * Math.PI;
            
            nx = dist * Math.cos(th2) * Math.cos(th);
            ny = dist * Math.sin(th2);
            nz = dist * Math.cos(th2) * Math.sin(th);
        } else if (shape == 'cage') {
            var ring = parseInt(Math.random() * 3);
            var th = Math.random() * 2 * Math.PI;
            switch (ring) {
                case 0:
                    ny = R * Math.cos(th);
                    nz = R * Math.sin(th);
                    break;
                case 1:
                    nx = R * Math.cos(th);
                    nz = R * Math.sin(th);
                    break;
                case 2:
                    nx = R * Math.cos(th);
                    ny = R * Math.sin(th);
                    break;
            }
        } else {
            shape = 'sphere';
            return genCoord();
        }
        return [nx,ny,nz];
    };
    var addPoint = function () {
        var newCoord = [];
        var nx = 0;
        var ny = 0;
        var nz = 0;
        
        newCoord = genCoord();
        nx = newCoord[0];
        ny = newCoord[1];
        nz = newCoord[2];
        
        point.push(new Point(nx, ny, nz));
        $('#amount').html(amount);
    };
    var removePoint = function () {
        if (amount == 3) return;
        amount--;
        $('#point'+amount).remove();
        point.pop();
        $('#amount').html(amount);
    };
    var movePoint = function (p) {
        if (timeStop) return;
        //reverse rotate
        var x2 =   p.x*Math.cos(mouseAngle) + p.y*Math.sin(mouseAngle);
        var y2 = 0-p.x*Math.sin(mouseAngle) + p.y*Math.cos(mouseAngle);
        var z2 = p.z;
        if (isNaN(x2) || isNaN(y2) || isNaN(z2)) return;
        //p.coord(x2, y2, z2);
        //return;
        
        var r = Math.sqrt(x2*x2+z2*z2);
        var theta = Math.atan(z2/x2) + rotateSpeed;
        
        if (x2 < 0) {
            theta = theta + Math.PI;
        }
        //console.log(x2, y2, z2, r, theta);
        if (isNaN(r) || isNaN(theta)) return;
        
        var x3 = r*Math.cos(theta);
        var y3 = y2;
        var z3 = r*Math.sin(theta);
        if (isNaN(x3) || isNaN(y3) || isNaN(z3)) return;
        p.coord(x3, y3, z3);
        //return;
        
        var x4 = x3*Math.cos(mouseAngle) - y3*Math.sin(mouseAngle);
        var y4 = x3*Math.sin(mouseAngle) + y3*Math.cos(mouseAngle);
        var z4 = z3;
        if (isNaN(x4) || isNaN(y4) || isNaN(z4)) return;
        
        p.coord(x4, y4, z4);
    };
    var draw = function () {
        //console.log(amount);
        point.map(function (elem, index) {
            //console.log(point[index].z);
            $('#point'+index).css({
                'top'    :point[index].y+center.y,
                'left'   :point[index].x+center.x,
                //'z-index':point[index].z,
                'opacity':(point[index].z+R)/(3*R) + 0.1
            });
        });
    };
    var showShape = function () {
        $('#shape').html(shape);
    };
    var addPointSlow = function () {
        if (state != 'slowadd') return;
        if (amount < 600) {
            addPoint();
            setTimeout(addPointSlow, 100);  
        } else {
            state = 'normal';
        }
    };
    var removePointSlow = function () {
        if (state != 'slowremove') return;
        if (amount > 3) {
            removePoint();
            setTimeout(removePointSlow, 100);  
        } else {
            state = 'normal';
        }
    };
    var setTrans = function (a) {
        state = 'slowtrans';
        clock = 0;
        newPos = [];
        for (var a = 0; a < amount; a++) {
            newPos.push( genCoord() );
        }
        setTimeout(slowTrans, 1);
    };
    var slowTrans = function () {
        if (state != 'slowtrans') return;
        var remainClock = 100 - clock;
        for (var a = 0; a < amount; a++) {
            var dx = (newPos[a][0] - point[a].x) / remainClock;
            var dy = (newPos[a][1] - point[a].y) / remainClock;
            var dz = (newPos[a][2] - point[a].z) / remainClock;
            
            var nx = point[a].x + dx;
            var ny = point[a].y + dy;
            var nz = point[a].z + dz;
            
            point[a].coord(nx,ny,nz);
        }
        clock++;
        if (clock == 100) {
            state = 'normal';
        } else {
            setTimeout(slowTrans, 1);
        }
    };
    
    /**********************************/
    $('#sky').append('<div id="mousemask"></div>');
    $('#sky').append('<div id="center" class="point"></div>');
    $('#center').css({
        'top':center.y,
        'left':center.x
    });
    point.push(new Point(R,0,0));
    point.push(new Point(0,R,0));
    point.push(new Point(0,0,-R));
    for (var a = 0; a < 8; a++) {
        addPoint();
    }
    $('#amount').html(amount);
    
    setInterval(function () {
        point.map(function (elem, index) {
            //console.log(point[index]);
            movePoint(point[index]);
        });
        draw();
    }, 50);
    
    $('#mousemask').mousemove(function (e) {
        mousex = e.offsetX-center.x;
        mousey = e.offsetY-center.y;
        var tempAngle = Math.atan(mousey/mousex);
        if (mousex < 0) {
            mouseAngle = tempAngle + Math.PI;
        } else {
            mouseAngle = tempAngle;
        }
        //console.log(mouseAngle);
        rotateSpeed = Math.sqrt(mousex*mousex + mousey*mousey) / distAngleRate;
        //console.log(rotateSpeed);
    });
    
    showShape();
    $('#shapeList').html(
        '1 sphere<br>'+
        '2 ring<br>'+
        '3 pie<br>'+
        '4 2sphere<br>'+
        '5 cage<br>'
    );
    KeyManager.keydown('pgup', function () {
        addPoint();
    }).keydown('pgdn', function () {
        removePoint();
    }).keydown('space', function () {
        timeStop = !timeStop;
    }).keyup('home', function () {
        state = 'slowadd';
        addPointSlow();
    }).keyup('end', function () {
        state = 'slowremove';
        removePointSlow();
    }).keyup('esc', function () {
        state = 'normal';
    }).keyup('1', function () {
        if (shape == 'sphere') {
            setTrans();
        }
        shape = 'sphere';
        showShape();
    }).keyup('2', function () {
        if (shape == 'ring') {
            setTrans();
        }
        shape = 'ring';
        showShape();
    }).keyup('3', function () {
        if (shape == 'pie') {
            setTrans();
        }
        shape = 'pie';
        showShape();
    }).keyup('4', function () {
        if (shape == '2sphere') {
            setTrans();
        }
        shape = '2sphere';
        showShape();
    }).keyup('5', function () {
        if (shape == 'cage') {
            setTrans();
        }
        shape = 'cage';
        showShape();
    }).keyup('~', function () {
        state = 'normal';
        while (amount > 3) {
            removePoint();
        }
    });
});