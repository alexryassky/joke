/*jslint es5: true */
//loop iterator
var g = 0, q = 0;
var verbose = false;
var utils = new Utils();

var collisionType = [
    'BOTTOM_EDGE',
    'TOP_EDGE',
    'LEFT_EDGE',
    'RIGHT_EDGE',
    'ANOTHER_OBJECT',
    'NO_COLLISION'
];
var directionKeys = [
    'KEY_LEFT',
    'KEY_UP',
    'KEY_RIGHT',
    'KEY_DOWN',
    'KEY_JUMP'
];

var objectTypes = [
    'PILLAR',
    'PLATFORM',
    'USER'
];

var Root = function(el) {
    this.wrapper = el;
    Root.prototype = {
        get wrapper() {
            return this._wrapper;
        },
        set wrapper(value) {
            this._wrapper = value;
        }
    };
};
var Util = function() {
};
Util.prototype = {
    deg2rad: function(deg) {
        return -1 * deg * Math.PI / 180;
    }
};


/**
 * @class sceneObject
 *
 */
var sceneObject = function(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;

    /** 
     * movement along x and y axis
     */
    this.movementParam = {
        dx: 1,
        dy: 1,
        speedX: 1,
        speedY: 1
    };
    /**
     * User defined data.
     */
    this.data = [];
    /**
     * Determines is object platform
     * If true, then collision with lower quarter of this platform
     * causes setting to zero dy's
     */
    this.type = 'PLATFORM';
    this.rotationAngle = 0.0;
    this.scene = null;
    this.previousX = 0;
    this.previousY = 0;
    this.name = "";
    this.collideWith = [];		
	
};
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
    }, set dx(value) {
        this.movementParam.dx = value;
    },
    get dx() {
        return this.movementParam.dx;
    },
    xmov: function(param) {
        this.x += param.dx * param.speedX;        
        return this;
    },
    ymov: function(param) {
        this.y += param.dy * param.speedY;        
        if (this.y + this.width > this.canvas.height) {
            this.y -= this.width;
        }
        return this;
    },
    zmov: function(param) {
    },
    // Default is linear movement
    movement: function() {
        this.xmov(this.movementParam).ymov(this.movementParam);
    },
    collision: function(collResult, context, callback) {
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
        if (collResult.indexOf('ANOTHER_OBJECT') !== -1) {
            if (!context) {
                this.movementParam.dy = -1 * this.movementParam.dy;
            }
            else {
                var i = 0;
                for (i = 0; i < this.collideWith.length; i++) {
                    var obj = context[this.collideWith[i]],
                            right = obj.x + obj.width,
                            left = obj.x,
                            top = obj.y,
                            bottom = obj.y + obj.height;
                    var quarter1 = Geometry.getCollisionQuarters(obj, this);
                    var quarter2 = Geometry.getOppositeQuarter(quarter1);

                    var vecX = Geometry.getHalfWidthVector(obj, quarter1, 'x');
                    var vecY = Geometry.getHalfWidthVector(obj, quarter1, 'y');
                    var VecX = Geometry.getHalfWidthVector(this, quarter2, 'x');
                    var VecY = Geometry.getHalfWidthVector(this, quarter2, 'y');

                  /*  var vector1 = new mVector(
                            new mPoint(
                            Math.min(vecX.start.x, vecX.end.x), Math.min(vecY.start.y, vecY.end.y)),
                            new mPoint(obj.width / 2, obj.height / 2)
                            );
                    var vector2 = new mVector(
                            new mPoint(
                            Math.min(VecX.start.x, VecX.end.x), Math.min(VecY.start.y, VecY.end.y)),
                            new mPoint(this.width / 2, this.height / 2)
                            );
					*/

					vecX = utils.getActualCoords(vecX, obj);
					VecX = utils.getActualCoords(VecX, this);
					vecY = utils.getActualCoords(vecY, obj);
					VecY = utils.getActualCoords(VecY, this);
						
                    var intersectionX = Geometry.getIntersection(vecX, VecX, 'x', quarter1);
                    var intersectionY = Geometry.getIntersection(vecY, VecY, 'y', quarter1);

                    if (Math.abs(intersectionX) < Math.abs(intersectionY)) {                        
                        var actor = Math.abs(this.movementParam.dx) > 0 ? this :
                                    Math.abs(obj.movementParam.dx) > 0 ? obj :
                                    this.type === 'USER' ? this : obj;
                        actor.movementParam.dx = Math.abs(intersectionX) > 0 ? intersectionX : -1 * actor.movementParam.dx;
                        var counterActor = actor === this ? obj : this;
                        //Set noclip true
                        utils.log(actor.type + 'x' + counterActor.type);
                        this.scene.move(actor, true);                       
                    }
                    else {
                        
                        var old = this.movementParam.dy;
                        var actor = Math.abs(this.movementParam.dy) > 0 ? this :
                                    Math.abs(obj.movementParam.dy) > 0 ? obj :
                                    this.type === 'USER' ? this : obj;						
                        var counterActor = actor === this ? obj : this;
						utils.log(actor.type + 'x' + counterActor.type);
                        actor.movementParam.dy = Math.abs(intersectionY) > 0 ? intersectionY : -1 * actor.movementParam.dy;
                        //Set noclip true
                        this.scene.move(actor, true);
                        //actor.movementParam.dy = -1 * old;

                    }
                }
            }
        }
    },
	/**
	 * Collision handler
	 * @type type
	 */
	onCollision : function (sender, actors){
		
	}
};


/**
 * @class Scene
 *
 */
var Scene = function(RootObj) {
    this.rootObj = RootObj;
    this.width = this.rootObj.wrapper.clientWidth;
    this.height = this.rootObj.wrapper.clientHeight;
    var beh = new setImageBehavior();
    beh.setOwner(this);
    var spritesSheet = new image();
    spritesSheet.loadFromFile('resources/sprites.png');
    this.images.push(spritesSheet);

};
Scene.prototype = {
    get rootObj() {
        return this._rootObj;
    }, set rootObj(value) {
        this._rootObj = value;
    },
    objects: [],
    getScObject: function(index) {
        return (index in this.objects) ? this.objects[index] : (function() {
            return new sceneObject();
        })(index);
    },
    /**
     * Internal method
     * Delete old visual content
     * @param sceneObject obj
     * @returns nothing
     */
    clearOld: function(obj) {
        obj.ctx.save();
        obj.ctx.translate(-(obj.movementParam.dx * obj.movementParam.speedX),
                -(obj.movementParam.dy * obj.movementParam.speedY));
        obj.ctx.clearRect(-7, -7, obj.width + 14, obj.height + 14);
        obj.ctx.restore();
    },
    /**
     * Visualize scene
     * @returns {undefined}
     */
    render: function() {
        var i;
        for (i = 0; i < this.objects.length; i++) {
            var obj = this.objects[i];
            this.drawObject(obj);
            if (obj.rotationAngle > 0) {
                this.rotate(-obj.rotationAngle);
            }
        }
    },
    /**
     * Adds object to scheme
     * @param sceneObject obj
     * @returns nothing
     */
    putObj: function(obj) {
        var canvas = document.createElement('canvas');
        canvas.setAttribute('width', this.rootObj.wrapper.clientWidth + 'px');
        canvas.setAttribute('height', this.rootObj.wrapper.clientHeight + 'px');
        canvas.setAttribute('style',
                'position: absolute; left:' + this.rootObj.wrapper.offsetLeft + '; top:' + this.rootObj.wrapper.offsetTop + '; z-index:' + this.rootObj.wrapper.children.length + ';');
        this.rootObj.wrapper.appendChild(canvas);
        obj.canvas = canvas;
        obj.scene = this;
        obj.ctx.setTransform(1, 0, 0, 1, obj.x, obj.y);
        this.objects.push(obj);
    },
    /** Returns sceneObject by index
     *
     * @param int index
     * @returns sceneObject object
     */
    getObj: function(index) {
        //this.objects[index].ctx.restore();
        return this.objects[index];
    },
    /**
     *  Performing movement of given object
     * @param sceneObject obj
     * @returns nothing
     */
    move: function(obj, noclip) {
        obj.previousX = obj.x;
        obj.previousY = obj.y;
        if (!noclip) {
            var collisionResult = this.getCollision(obj);
            obj.collision(collisionResult, this.objects);
        }
        obj.movement();
        obj.ctx.translate(obj.x - obj.previousX, obj.y - obj.previousY);
    },
    /**
     *  Performs rotating of given object to given angle
     *
     * @param sceneObject object
     * @param float angle rotating angle in degrees
     * @returns nothing
     */
    rotate: function(obj, angle) {
        obj.ctx.save();
        obj.rotationAngle += angle;
        obj.rotationAngle = obj.rotationAngle % 360
        obj.ctx.translate(obj.width / 2, obj.height / 2);
        obj.ctx.rotate(angle * Math.PI / 180);
        obj.ctx.translate(-(obj.width / 2), -(obj.height / 2));
        this.drawObject(obj);
        obj.ctx.restore();
    },
    drawObject: function(obj) {
//obj.ctx.save
        if (!obj.drawSprite) {
            obj.ctx.fillStyle = "rgb(" + obj.color + ")";
            obj.ctx.fillRect(0, 0, obj.width, obj.height);
        } else {
            obj.drawSprite();
        }
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
        return result;
    }
};

function angularMovingSceneObject(x, y, w, h, angle) {
    this.movingAngle = new Util().deg2rad(angle);
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
    this.rotationAngle = 0.0;
    this.scene = null;
    this.previousX = 0;
    this.previousY = 0;
    this.canvas = null;
    this.collideWith = [];
    return this;
}
angularMovingSceneObject.prototype = inherit(sceneObject.prototype);
angularMovingSceneObject.prototype.xmov = function(param) {
    this.x += param.dx * param.speedX * Math.cos(this.movingAngle).toPrecision(1);
    return this;
};
angularMovingSceneObject.prototype.ymov = function(param) {
    this.y += param.dy * param.speedY * Math.sin(this.movingAngle).toPrecision(3);
    return this;
};

function circularMovingSceneObject(x, y, w, h, r) {
    this.radius = r;
    // TODO Call parent constructor
    this.centerX = x;
    this.centerY = y;
    this.x = x;
    this.y = y;
    this.movingAngle = 0;
    this.width = w;
    this.height = h;
    this.movementParam = {
        dx: 1,
        dy: 1,
        speedX: 1,
        speedY: 1
    };
    this.rotationAngle = 0.0;
    this.scene = null;
    this.previousX = 0;
    this.previousY = 0;
    this.canvas = null;
    this.collideWith = [];
    return this;
    //circular.prototype.apply(x, y, w, h, 0);
}
circularMovingSceneObject.prototype = inherit(angularMovingSceneObject.prototype);
circularMovingSceneObject.prototype.xmov = function(param) {
    this.x = this.centerX + this.radius * Math.cos(this.movingAngle += 0.01 % 6.19 * this.movementParam.dx).toPrecision(
            3);
    return this;
};
circularMovingSceneObject.prototype.ymov = function(param) {
    this.y = this.centerY + this.radius * Math.sin(this.movingAngle += 0.01 % 6.19 * this.movementParam.dy).toPrecision(
            3);
    return this;
};
circularMovingSceneObject.prototype.collision = function(collResult, context, callback) {
    if (collResult.indexOf('ANOTHER_OBJECT') != -1) {
        if (context) {
            var i = 0;
            var obj = context[this.collideWith[0]];
            //obj.collideWith()
            obj.collideWith[0] = this;
            this.movementParam.dx = -1 * this.movementParam.dx;
            this.movementParam.dy = -1 * this.movementParam.dy;
            this.movingAngle += this.movementParam.dx * 0.1;
        }
    }
}



/**
 * @class Interface
 */
Interface = {
    scene: null,
    init: function(root) {
        this.scene = new Scene(root);
        this.onInit();
    },
    onInit: function() {
        var o1 = new sceneObject(160, 160, 20, 20);
        o1.name = 'Rotating block';
        /*Setting up sprites and threading  for object 2*/
        var o2 = new spriteObject(320, 150, 28, 40);
        o2.name = 'Mario';
        o2.setSprite(0, 0, 0);
        o2.onTick = function(sender, param) {
            sender.setSprite(0, 0, sender.counter);
            Interface.scene.clearOld(o2);
            Interface.scene.move(o2);
            Interface.scene.drawObject(o2);
        };
        var o3 = new sceneObject(140, 240, 100, 20);
        o3.name = 'Long blue block';
        var o4 = new angularMovingSceneObject(150, 100, 20, 20, 15);
        o4.name = 'angular moving block';
        o1.color = '10,100,40';
        o2.color = '250,40,40';
        o3.color = '30,30,250';
        o4.color = '60,50,180';
        //o5.color = '180,50,30';
        o2.movementParam.dx = 0;
        o2.movementParam.dy = 0;
        o3.movementParam.dx = 1;
        o3.movementParam.dy = 0;
        this.scene.putObj(o1);
        this.scene.putObj(o2);

        this.scene.putObj(o3);
        this.scene.putObj(o4);
        //  this.scene.putObj(o5);

        this.doStart();
    },
    doStart: function() {
        var obj = Interface.scene.getObj(0);
        var obj2 = Interface.scene.getObj(1);

        document.addEventListener('keydown',
                function(event) {
                    var key = event.which;
                    switch (key) {
                        case 37:
                            key = 'KEY_LEFT';
                            obj2.moveLeft();
                            obj2.start();
                            break;
                        case 38:
                            key = 'KEY_UP';
                            obj2.moveUp();
                            obj2.start();
                            break;
                        case 39:
                            key = 'KEY_RIGHT';
                            obj2.moveRight();
                            obj2.start();
                            break;
                        case 40:
                            key = 'KEY_DOWN';
                            obj2.moveDown();
                            obj2.start();
                            break;
                        case 32:
                            key = 'KEY_JUMP';
                            obj2.moveJump();
                            obj2.start();
                            break;
                        default:
                            console.log('Unknown key: ' + key);
                    }
                }
        );
        var j = 0;
        setInterval(
                function() {
                    j = (g % 60 == 0) ? ++j : j;

                    var obj3 = Interface.scene.getObj(2);
                    var obj4 = Interface.scene.getObj(3);
                    /*var obj5 = Interface.scene.getObj(4);*/
                    Interface.scene.clearOld(obj3);
                    Interface.scene.move(obj3);
                    Interface.scene.drawObject(obj3);

                    Interface.scene.clearOld(obj);
                    Interface.scene.rotate(obj, g += 2 % 360);
                    Interface.scene.move(obj);
                    Interface.scene.clearOld(obj4);
                    Interface.scene.move(obj4);
                    Interface.scene.drawObject(obj4);
                    /*Interface.scene.clearOld(obj5);
                     // Interface.scene.rotate(obj5, g );
                     Interface.scene.move(obj5);
                     Interface.scene.drawObject(obj5);
                     //obj.ctx.restore();           */
                },
                20);
    }
};


