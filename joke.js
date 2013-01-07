/*jslint es5: true */
var g = 0;

function inherit(proto) {
  function F() {}
  F.prototype = proto;
  var object = new F;
  return object;
}

var collisionType = ['BOTTOM_EDGE',
  'TOP_EDGE',
  'LEFT_EDGE',
  'RIGHT_EDGE',
  'ANOTHER_OBJECT',
  'NO_COLLISION'];

var Root = function (el) {
  this.wrapper = el;
  Root.prototype = {
    get wrapper() {
      return this._wrapper;
    }, set wrapper(value) {
      this._wrapper = value;
    },
  };
};
var sceneObject = function (x, y, w, h) {
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
  this.collideWith = [];
  this.transformArray = [1, 0, 0, 1, 0, 0];
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
  },
  xmov: function (param) {
    this.x += param.dx * param.speedX;
    this.transformArray[4] = param.dx * param.speedX;
    return this;
  },
  ymov: function (param) {
    this.y += param.dy * param.speedY;
    this.transformArray[5] = param.dy * param.speedY;
    if (this.y + this.width > this.canvas.height) {
      this.y -= this.width;
    }
    return this;
  },
  zmov: function (param) {},
  // Default is linear movement
  movement: function () {
    this.xmov(this.movementParam).ymov(this.movementParam);

  },
  collision: function (collResult, context, callback) {

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
      } else {
        var i = 0;
        //$('#history').append($("<li>").append("Коллизия с "+ JSON.stringify(this.collideWith)));
        for (i = 0; i < this.collideWith.length; i++) {
          var obj = context[this.collideWith[i]];
          var right = obj.x + obj.width;
          var left = obj.x;
          var top = obj.y;
          var bottom = obj.y + obj.height;
          if (Math.abs((this.x + this.width) - left) <= 2 || Math.abs(this.x - right) <= 2) {
            this.movementParam.dx = -1 * this.movementParam.dx;
          }

          if (Math.abs(this.y - bottom) <= 2 || Math.abs((this.y + this.height) - top) <= 2) {
            this.movementParam.dy = -1 * this.movementParam.dy;
          }
        }
      }
    }

  }

};


var Scene = function (RootObj) {
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
  getScObject: function (index) {
    return (index in this.objects) ? this.objects[index] : (function () {
      return new sceneObject();
    })(index);
  },
  clearOld: function (obj) {
    obj.ctx.save();

    obj.ctx.translate(-(obj.movementParam.dx * obj.movementParam.speedX), -(obj.movementParam.dy * obj.movementParam.speedY));

    obj.ctx.clearRect(-7, -7, obj.width + 14, obj.height + 14);

    obj.ctx.restore();
  },
  render: function () {
    var i;
    for (i = 0; i < this.objects.length; i++) {
      var obj = this.objects[i];

      this.drawObject(obj);
      if (obj.rotationAngle > 0) {
        this.rotate(-obj.rotationAngle);
      }
    }
  },
  putObj: function (obj) {
    //obj.ctx.save();
    var canvas = document.createElement('canvas');
    canvas.setAttribute('width', this.rootObj.wrapper.clientWidth + 'px');
    canvas.setAttribute('height', this.rootObj.wrapper.clientHeight + 'px');
    canvas.setAttribute('style', 'position: absolute; left:' + this.rootObj.wrapper.offsetLeft + '; top:' + this.rootObj.wrapper.offsetTop + '; z-index:' + this.rootObj.wrapper.children.length + ';');
    this.rootObj.wrapper.appendChild(canvas);
    obj.canvas = canvas;
    obj.scene = this;
    //        obj.ctx.translate(obj.x, obj.y);

    obj.ctx.setTransform(1, 0, 0, 1, obj.x, obj.y);
    this.objects.push(obj);
  },
  getObj: function (index) {

    //this.objects[index].ctx.restore();
    return this.objects[index];
  },
  move: function (obj) {
    obj.previousX = obj.x;
    obj.previousY = obj.y;
    var collisionResult = this.getCollision(obj);
    obj.collision(collisionResult, this.objects);
    obj.movement();
    obj.ctx.translate(obj.x - obj.previousX, obj.y - obj.previousY);

  },
  rotate: function (obj, angle) {
    obj.ctx.save();
    obj.rotationAngle += angle;
    obj.rotationAngle = obj.rotationAngle % 360
    obj.ctx.translate(obj.width / 2, obj.height / 2);
    obj.ctx.rotate(angle * Math.PI / 180);
    obj.ctx.translate(-(obj.width / 2), -(obj.height / 2));
    this.drawObject(obj);
    obj.ctx.restore();

  },
  drawObject: function (obj) {
    //obj.ctx.save();            
    obj.ctx.fillStyle = "rgb(" + obj.color + ")";
    obj.ctx.fillRect(0, 0, obj.width, obj.height);
  },
  getCollision: function (obj) {
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



function angularMovingSceneObject(x, y, w, h, angle) {
  this.movingAngle = angle;
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
angularMovingSceneObject.prototype.xmov = function (param) {
  this.x += param.dx * param.speedX * Math.cos(this.movingAngle).toPrecision(3);
  return this;
};

angularMovingSceneObject.prototype.ymov = function (param) {
  this.y += param.dx * param.speedY * Math.sin(this.movingAngle).toPrecision(3);

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

circularMovingSceneObject.prototype.xmov = function (param) {
  this.x = this.centerX +this.radius * Math.cos(this.movingAngle+=0.01%360).toPrecision(3);
  return this;
};

circularMovingSceneObject.prototype.ymov = function (param) {
  this.y = this.centerY + this.radius * Math.sin(this.movingAngle+=0.01%360).toPrecision(3);
  return this;
};

circularMovingSceneObject.prototype.collision = function (a, b, c) {

}

Interface = {
  scene: null,
  init: function (root) {
    this.scene = new Scene(root);
    this.onInit();
  },
  onInit: function () {
    var o1 = new sceneObject(160, 160, 20, 20);
    var o2 = new sceneObject(320, 50, 20, 150);
    var o3 = new sceneObject(140, 40, 100, 20);
    var o4 = new angularMovingSceneObject(150, 100, 20, 20, 0);
    var o5 = new circularMovingSceneObject(200, 250, 20, 20, 50);

    o1.color = '10,100,40';
    o2.color = '250,40,40';
    o3.color = '30,30,250';
    o4.color = '60,50,180';
    o5.color = '180,50,30';
    this.scene.putObj(o1);
    this.scene.putObj(o2);
    this.scene.putObj(o3);
    this.scene.putObj(o4);
    this.scene.putObj(o5);
    o1.movementParam.dy = 1;
    o2.movementParam.dx = 0;
    o3.movementParam.dy = 0;        
    o4.movingAngle = 70;
    
    
    this.doStart();
  },
  doStart: function () {
    setInterval(

    function () {
      //debugger;
      var obj = Interface.scene.getObj(0);
      var obj2 = Interface.scene.getObj(1);
      var obj3 = Interface.scene.getObj(2);
      var obj4 = Interface.scene.getObj(3);
      var obj5 = Interface.scene.getObj(4);
      Interface.scene.clearOld(obj3);
      Interface.scene.move(obj3);
      Interface.scene.drawObject(obj3);
      Interface.scene.clearOld(obj2);
      Interface.scene.move(obj2);
      Interface.scene.drawObject(obj2);
      Interface.scene.clearOld(obj);
      Interface.scene.rotate(obj, g += 2 % 360);
      Interface.scene.move(obj);
      Interface.scene.clearOld(obj4);
      Interface.scene.move(obj4);
      Interface.scene.drawObject(obj4);
      Interface.scene.clearOld(obj5);
      Interface.scene.move(obj5);
      Interface.scene.drawObject(obj5);
      //obj.ctx.restore();           
    }, 20);
  }
};


var root;
document.addEventListener("DOMContentLoaded", function (event) {

  var container = document.getElementById('wrapper');
  root = new Root(container);
});
document.getElementsByTagName('button')[0].addEventListener('click', function (event) {
  var container = document.getElementById('wrapper');
  root = new Root(container);
  console.log(root);
  Interface.init(root);

});