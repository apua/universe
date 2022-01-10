$(function () {
    var Point = function (xi, yi, zi) {
        this.coord = function (xx, yy, zz, ss) {
            this.x = xx;
            this.y = yy;
            this.z = zz;
            if (ss != undefined) {
                this.scale = ss;
            }
        };
        this.x = xi;
        this.y = yi;
        this.z = zi;
        this.scale = DEFAULT_SCALE;
        //$('#sky').append('<div id="point'+amount+'" class="point star"></div>');
        //amount++;
    };
    
    var DEFAULT_SCALE = 10;
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
    var colorChanging = false;
    var colorValue = [0,0,255];
    var colorFlowState = 'B2G';
    var colorDelta = 5;
    var clock = 0;
    var newPos = [];
    /*********************************/
    var point = [];
    
    var addPoint = function () {
        var newCoord = [];
        var nx = 0;
        var ny = 0;
        var nz = 0;
        
        newCoord = genCoord(shape, R);
        nx = newCoord[0];
        ny = newCoord[1];
        nz = newCoord[2];
        
        point.push(new Point(nx, ny, nz));
        $('#sky').append('<div id="point'+amount+'" class="point star"></div>');
        $('#point'+amount).mousemove(function (e) {
            console.log(this.id);
            var thisIndex = parseInt( (this.id).substr(5) );
            console.log(thisIndex);
            console.log(point[thisIndex].x);
            var xx = e.offsetX + point[thisIndex].x;
            var yy = e.offsetY + point[thisIndex].y;
            senseMouse(xx, yy);
        });
        amount++;
        
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
        //p.coord(x3, y3, z3);
        //return;
        
        var x4 = x3*Math.cos(mouseAngle) - y3*Math.sin(mouseAngle);
        var y4 = x3*Math.sin(mouseAngle) + y3*Math.cos(mouseAngle);
        var z4 = z3;
        if (isNaN(x4) || isNaN(y4) || isNaN(z4)) return;
        
        p.coord(x4, y4, z4);
    };
    var colorChange = function () {
        switch (colorFlowState) {
            case 'B2G':
                if (colorValue[2] > 0) {
                    colorValue[2] -= colorDelta;
                    colorValue[1] += colorDelta;
                } else { colorFlowState = 'G2R'; }
            break;
            case 'G2R':
                if (colorValue[1] > 0) {
                    colorValue[1] -= colorDelta;
                    colorValue[0] += colorDelta;
                } else { colorFlowState = 'R2B'; }
            break;
            case 'R2B':
                if (colorValue[0] > 0) {
                    colorValue[0] -= colorDelta;
                    colorValue[2] += colorDelta;
                } else { colorFlowState = 'B2G'; }
            break;
        }
    };
    var draw = function () {
        //console.log(amount);
        var colorStr =
            'rgb('+colorValue[0]+','+colorValue[1]+','+colorValue[2]+')';
        $('.star').css('background', colorStr);
        $('#changeColorStr').css('color', colorStr);
        point.map(function (elem, index) {
            //console.log(point[index].z);
            var yy = (point[index].y * point[index].scale) / DEFAULT_SCALE;
            var xx = (point[index].x * point[index].scale) / DEFAULT_SCALE;
            var zz = (point[index].z * point[index].scale) / DEFAULT_SCALE;
            $('#point'+index).css({
                'top'    :yy+center.y,
                'left'   :xx+center.x,
                'z-index':parseInt(zz),
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
        if (state == 'slowtrans') return;
        state = 'slowtrans';
        clock = 0;
        newPos = [];
        point.map(function (elem) {
            var xx = (elem.x * elem.scale) / DEFAULT_SCALE;
            var yy = (elem.y * elem.scale) / DEFAULT_SCALE;
            var zz = (elem.z * elem.scale) / DEFAULT_SCALE;
            elem.coord(xx, yy, zz, DEFAULT_SCALE);
        });
        for (var a = 0; a < amount; a++) {
            newCoord = genCoord(shape, R);
            var nx = newCoord[0];
            var ny = newCoord[1];
            var nz = newCoord[2];
            newPos.push(new Point(nx, ny, nz));
        }
        setTimeout(slowTrans, 1);
    };
    var slowTrans = function () {
        if (state != 'slowtrans') return;
        var remainClock = 50 - clock;
        for (var a = 0; a < amount; a++) {
            var dx = (newPos[a].x - point[a].x) / remainClock;
            var dy = (newPos[a].y - point[a].y) / remainClock;
            var dz = (newPos[a].z - point[a].z) / remainClock;
            
            var nx = point[a].x + dx;
            var ny = point[a].y + dy;
            var nz = point[a].z + dz;
            
            point[a].coord(nx,ny,nz);
        }
        clock++;
        if (clock == 50) {
            state = 'normal';
            newPos = [];
        } else {
            setTimeout(slowTrans, 1);
        }
    };
    
    /**********************************/
    $('#sky').append('<div id="center" class="point"></div>');
    $('#center').css({
        'top':center.y,
        'left':center.x
    });
    $('#center').mousemove(function (e) {
        //console.log(this.id);
        //var thisIndex = parseInt( (this.id).substr(5) );
        //console.log(thisIndex);
        //console.log(point[thisIndex].x);
        var xx = e.offsetX;
        var yy = e.offsetY;
        senseMouse(xx, yy);
    });
    /*
    point.push(new Point(R,0,0));
    $('#sky').append('<div id="point'+amount+'" class="point star"></div>');
    amount++;
    point.push(new Point(0,R,0));
    $('#sky').append('<div id="point'+amount+'" class="point star"></div>');
    amount++;
    point.push(new Point(0,0,-R));
    $('#sky').append('<div id="point'+amount+'" class="point star"></div>');
    amount++;/**/
    for (var a = 0; a < 11; a++) {
        addPoint();
    }
    
    setInterval(function () {
        point.map(function (elem, index) {
            //console.log(point[index]);
            movePoint(point[index]);
        });
        if (state == 'slowtrans') {
            newPos.map(function (elem, index) {
                movePoint(newPos[index]);
            })
        }
        if (colorChanging) {
            colorChange();
        }
        draw();
    }, 50);
    
    var senseMouse = function (xi, yi) {
        //console.log(xi);
        mousex = xi - 15;
        mousey = yi - 15;
        var tempAngle = Math.atan(mousey/mousex);
        if (mousex < 0) {
            mouseAngle = tempAngle + Math.PI;
        } else {
            mouseAngle = tempAngle;
        }
        //console.log(mouseAngle);
        rotateSpeed = Math.sqrt(mousex*mousex + mousey*mousey) / distAngleRate;
        //console.log(rotateSpeed);
    };
    
    $('#mousemask').mousemove(function (e) {
        //var ex = (e.offsetX === undefined) ? e.layerX : e.offsetX;
        //var ey = (e.offsetY === undefined) ? e.layerY : e.offsetY;
        var xx = e.offsetX - center.x;
        var yy = e.offsetY - center.y;
        senseMouse(xx, yy);
    });
    
    showShape();
    $('#funcList').html(
        '1 : sphere<br>'+
        '2 : ring<br>'+
        '3 : 2ring<br>'+
        '4 : cage<br>'+
        '5 : 2cube<br>'+
        '6 : 2sphere<br>'+
        '7 : tetrahedron<br>'+
        '<br>'+
        'PgUp : + star<br>'+
        'PgDn : - star<br>'+
        'Home : ++ stars<br>'+
        'End : -- stars<br>'+
        'Esc : stop +/- stars<br>'+
        'Enter : change shape<br>'+
        'Space : stop rotating<br>'+
        'd : clean stars<br>'+
        '<span id="changeColorStr">c : change color</span>'
    );
    KeyManager.keydown('PGUP', function () {
        addPoint();
    }).keydown('PGDN', function () {
        removePoint();
    }).keydown('SPACE', function () {
        timeStop = !timeStop;
    }).keyup('HOME', function () {
        state = 'slowadd';
        addPointSlow();
    }).keyup('END', function () {
        state = 'slowremove';
        removePointSlow();
    }).keyup('ESC', function () {
        state = 'normal';
    }).keyup('1', function () {
        shape = 'sphere';
        showShape();
    }).keyup('2', function () {
        shape = 'ring';
        showShape();
    }).keyup('3', function () {
        shape = '2ring';
        showShape();
    }).keyup('4', function () {
        shape = 'cage';
        showShape();
    }).keyup('5', function () {
        shape = '2cube';
        showShape();
    }).keyup('6', function () {
        shape = '2sphere';
        showShape();
    }).keyup('7', function () {
        shape = 'tetrahedron';
        showShape();
    }).keyup('ENTER', function () {
        setTrans();
    }).keyup('d', function () {
        state = 'normal';
        while (amount > 3) {
            removePoint();
        }
    }).keyup('c', function () {
        colorChanging = !colorChanging;
    });
    
    $('body').bind('DOMMouseScroll', function(e){
        if(e.detail > 0) {
            //scroll down
            if (point.every(function (elem) {
                return elem.scale > 1;
            })) {
                point.map(function (elem) {
                    elem.scale--;
                });
            }
        }else {
            //scroll up
            if (point.every(function (elem) {
                return elem.scale < DEFAULT_SCALE*10;
            })) {
                point.map(function (elem) {
                    elem.scale++;
                });
            }
        }
        return false;
    });

    //IE, Opera, Safari
    $('body').bind('mousewheel', function(e){
        console.log(e.originalEvent.wheelDelta);
        if(e.originalEvent.wheelDelta < 0) {
            //scroll down
            if (point.every(function (elem) {
                return elem.scale > 1;
            })) {
                point.map(function (elem) {
                    elem.scale--;
                });
            }
        } else {
            //scroll up
            if (point.every(function (elem) {
                return elem.scale < DEFAULT_SCALE * 10;
            })) {
                point.map(function (elem) {
                    elem.scale++;
                });
            }
        }
        //prevent page from scrolling
        return false;
    });
});
