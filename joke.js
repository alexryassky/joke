/*jslint es5: true */

var locations = ['ABOVE',
                              'BELOW',
                              'BEHIND',
                              'BEYOND',
                              'ORIGIN',
                              'DESTINATION',
                              'BETWEEN'];

var collisionType = ['BOTTOM_EDGE',
                                         'TOP_EDGE',
                                         'LEFT_EDGE',
                                         'RIGHT_EDGE',
                                         'ANOTHER_OBJECT',
                                         'NO_COLLISION'
                                        ];


var vectorPoint = function(x, y) {
    this.x = x;
    this.y = y;
};


vectorPoint.prototype = {
    get x() {
        return this._x;
    }, set x(value) {
        this._x = value;
    }, get y() {
        return this._y;
    }, set y(value) {
        this._y = value;
    }, operatorMinus: function(pt) {
        return new Point(this.x - pt.x, this.y - pt.y);
    },
    operatorEqual: function(pt) {
        return (pt.x == this.x && pt.y == this.y);
    },
    length: function() {
        return Math.sqrt(x * x - y * y);
    },
    classify: function(p0, pl) {
        var p2 = this;
        var a = p1.operatorMinus(pO);
        var b = p2.operatorMinus(pO);
        var sa = a.x * b.y - b.x * a.y;
        if (sa > 0.0) {
            return locations[0];
        }
        if (sa < 0.0) {
            return locations[1];
        }
        if ((a.x * b.x < 0.0) || (a.y * b.y < 0.0)) {
            return locations[2];
        }
        if (a.length < b.length) {
            return locations[3];
        }
        if (p2.operatorEqual(p0)) {
            return locations[4];
        }
        if (p1.operatorEqual(p0)) {
            return locations[5];
        }
        return locations[6];
    }
};




var Root = function(el) {
    this.wrapper = el;
    Root.prototype = {
        get wrapper() {
            return this._wrapper;
        }, set wrapper(value) {
            this._wrapper = value;
        },
    };
};
var sceneObject = function(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.movementParam = {
        dx: 1,
        dy: 1,
        speedX: 1,
        speedY: 1
    };
    this.rotationParam = {
        axisX: this.width / 2,
        axisY: this.height / 2
    };
    this.scene = null;
    this.previousX = 0;
    this.previousY = 0;
    this.collideWith = [];

};
//Defined  abstract  movement  functions and coordinates on rectangular grid
sceneObject.prototype = {

    get canvas() {
        return this._canvas;
    }, set canvas(value) {
        this._canvas = value;
    }, get ctx() {
        return this._canvas.getContext('2d');
    }, set ctx(value) {

    }, get x() {
        return this._x;
    }, set x(value) {
        this._x = value;
    }, get y() {
        return this._y;
    }, set y(value) {
        this._y = value;
    }, get color() {
        return this._color;
    }, set color(value) {
        this._color = value;
    }, get width() {
        return this._width;
    }, set width(value) {
        this._width = value;
    }, get height() {
        return this._height;
    }, set height(value) {
        this._height = value;
    }, xmov: function(param) {
        this.x += param.dx * param.speedX;
        return this;
    },
    ymov: function(param) {
        this.y += param.dy;
        if (this.y + this.width > this.canvas.height) {
            this.y -= this.width;
        }
        return this;
    },
    zmov: function(param) {},
    // Default is linear movement
    movement: function() {


        this.xmov(this.movementParam).ymov(this.movementParam);
    },
    collision: function(collResult, context, callback) {
        $('#info').append("Коллизия с "+ JSON.stringify(this.collideWith));
        if (collResult.indexOf('RIGHT_EDGE') != -1) {
            this.movementParam.dx = -1 * this.movementParam.dx;
        }
        if (collResult.indexOf('BOTTOM_EDGE') != -1) {
            this.movementParam.dy = -1 * this.movementParam.dy;
        }
        if (collResult.indexOf('TOP_EDGE') != -1) {
            this.movementParam.dy = -1 * this.movementParam.dy;
        }
        if (collResult.indexOf('LEFT_EDGE') != -1) {
            this.movementParam.dx = -1 * this.movementParam.dx;
        }
        if (collResult.indexOf('ANOTHER_OBJECT') != -1) {
            if (!context) {
                this.movementParam.dy = -1 * this.movementParam.dy;
            }
            else {
                var i = 0;

                for (i = 0; i < this.collideWith.length; i++) {
                    var obj = context[this.collideWith[i]];
                    var right = obj.x + obj.width;
                    var left = obj.x;
                    var top = obj.y;
                    var bottom = obj.y + obj.height;

                    if (Math.abs((this.x + this.width)-left) <= 1 || Math.abs(this.x - right) <= 1) {
                        this.movementParam.dx = -1 * this.movementParam.dx;
                    }
                    // if (this.y > top || this.x > right) {
                    if (Math.abs(this.y - bottom) <=1 || Math.abs((this.y + this.height) - top) <= 1) {
                        this.movementParam.dy = -1 * this.movementParam.dy;
                    }
                }
            }
        }

    },
    rotation: function(center) {


    }

};


var Scene = function(RootObj) {
    this.rootObj = RootObj;
    this.width = this.rootObj.wrapper.clientWidth;
    this.height = this.rootObj.wrapper.clientHeight;

    console.log(this.rootObj.wrapper.clientWidth, this.rootObj.wrapper.clientHeight);
};

Scene.prototype = {
    get rootObj() {
        return this._rootObj;
    }, set rootObj(value) {
        this._rootObj = value;
    }, objects: [],
    getScObject: function(index) {
        return (index in this.objects) ? this.objects[index] : (function() {
            return new sceneObject();
        })(index);
    },
    render: function() {
        var i;
        for (i = 0; i < this.objects.length; i++) {
            this.objects[i].drawObject(this.canvasObject);
        }
    },
    putObj: function(obj) {
        //obj.ctx.save();
        var canvas = document.createElement('canvas');
        canvas.setAttribute('width', this.rootObj.wrapper.clientWidth + 'px');
        canvas.setAttribute('height', this.rootObj.wrapper.clientHeight + 'px');
        canvas.setAttribute('style', 'position: absolute; left:' + this.rootObj.wrapper.offsetLeft + '; top:' + this.rootObj.wrapper.offsetTop + '; z-index:' + this.rootObj.wrapper.children.length + ';');
        this.rootObj.wrapper.appendChild(canvas);
        obj.canvas = canvas;
        obj.scene = this;
        obj.ctx.translate(obj.x, obj.y);
        this.objects.push(obj);
    },
    getObj: function(index) {

        //this.objects[index].ctx.restore();
        return this.objects[index];
    },
    move: function(obj) {


        //obj.ctx.clearRect(obj.x, obj.y, obj.width , obj.height );
        obj.previousX = obj.x;
        obj.previousY = obj.y;
        var collisionResult = this.getCollision(obj);
        obj.collision(collisionResult, this.objects);
/*  if (obj.collideWith.length>0){
            var collagent =this.objects[obj.collideWith];
            if (Math.abs(collagent.x - obj.x)>
        }*/
        obj.movement();

        obj.ctx.translate((obj.movementParam.dx * obj.movementParam.speedX), (obj.movementParam.dy * obj.movementParam.speedY));

        
    },
    rotate: function(obj) {

        obj.ctx.translate(obj.width / 2, obj.height / 2);
        obj.ctx.rotate(Math.PI / 180);
        obj.ctx.translate(-(obj.width / 2), -(obj.height / 2));

    },
    drawObject: function(obj) {
        //var obj = scene.getObj(index);        
        //debugger;
        obj.ctx.save();
        obj.ctx.translate(-(obj.movementParam.dx * obj.movementParam.speedX), -(obj.movementParam.dy * obj.movementParam.speedY));
        obj.ctx.clearRect(0, 0, obj.width, obj.height);
        obj.ctx.restore();
        obj.ctx.fillStyle = "rgb(" + obj.color + ")";
        obj.ctx.fillRect(0, 0, obj.width, obj.height);
    },
    getCollision: function(obj) {
        obj.collideWith.length = 0;
        var result = [collisionType[5]];
        if (obj.x + obj.width >= this.width) {
            result.push(collisionType[3]);
        }
        if (obj.x <= 0) {
            result.push(collisionType[2]);
        }

        if (obj.y + obj.height >= this.height) {
            result.push(collisionType[0]);
        }
        if (obj.y <= 0) {
            result.push(collisionType[1]);
        }
        var i = 0;
        for (i = 0; i < this.objects.length; i++) {
            if (this.objects[i] !== obj && obj.x <= (this.objects[i].x + this.objects[i].width) && this.objects[i].x <= (obj.x + obj.width) && obj.y <= (this.objects[i].y + this.objects[i].height) && this.objects[i].y < (obj.y + obj.height)) {
                result.push(collisionType[4]);
                obj.collideWith.push(i);
            }
        }
        //TODO check collision wth another object
        return result;
    }
};

Interface = {
    scene: null,
    init: function(root) {
        this.scene = new Scene(root);
        this.onInit();
    },
    onInit: function() {
        var o1 = new sceneObject(110, 300, 20, 20);
        var o2 = new sceneObject(320, 50, 20, 250);
        var o3 = new sceneObject(140, 40, 100, 20);
        var o4 = new sceneObject(120, 250, 100, 20);
        o1.color = '10,100,40';
        o2.color = '60,40,100';
        o3.color = '100,20,20';
        o4.color = '100,20,20';

        this.scene.putObj(o1);
        this.scene.putObj(o2);
        this.scene.putObj(o3);
        this.scene.putObj(o4);
        o1.movementParam.dy = 1;
        o2.movementParam.dx = 0;
        o3.movementParam.dy = 0;
        this.scene.drawObject(o2);
        this.scene.drawObject(o3);
        this.scene.drawObject(o4);
        this.doStart();
    },
    doStart: function() {
        setInterval(

        function() {
            //debugger;
            var obj = Interface.scene.getObj(0);
            var obj2 = Interface.scene.getObj(1);
            var obj3 = Interface.scene.getObj(2);
           
            Interface.scene.drawObject(obj3);
            Interface.scene.move(obj3);
            Interface.scene.drawObject(obj2);
            Interface.scene.move(obj2);
            Interface.scene.drawObject(obj);
            Interface.scene.move(obj);

        }, 10);
    }
};


var root;
document.addEventListener("DOMContentLoaded", function(event) {
    console.log('handler worked');
    var container = document.getElementById('wrapper');
    root = new Root(container);
});
document.getElementsByTagName('button')[0].addEventListener('click', function(event) {
    var container = document.getElementById('wrapper');
    root = new Root(container);
    console.log(root);
    Interface.init(root);

});