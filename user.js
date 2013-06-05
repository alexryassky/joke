
/**
 * @class spriteObject
 */
function spriteObject(x, y, w, h) {
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
   this.type = 'USER';
   this.rotationAngle = 0.0;
   this.scene = null;
   this.previousX = 0;
   this.previousY = 0;
   this.collideWith = [];
   this.transformArray = [1, 0, 0, 1, 0, 0];
   var behSpriteable = new spriteBehavior();
   behSpriteable.setOwner(this);
   var behThreadable = new threadBehavior();
   behThreadable.setOwner(this);
}

spriteObject.prototype = inherit(sceneObject.prototype);
spriteObject.prototype.moveLeft = function() {
   //counter must be 4
   this.movementParam.dx = -2;
   this.movementParam.dy = 0;
   this.onTick = function(sender, param) {
      
      sender.setSprite(0, 3, sender.counter);
      Interface.scene.clearOld(sender);
      Interface.scene.move(sender);
      Interface.scene.drawObject(sender);
   };

};

spriteObject.prototype.moveRight = function() {
   //counter must be 4
   this.movementParam.dx = 2;
   this.movementParam.dy = 0;
   this.onTick = function(sender, param) {
      
      sender.setSprite(0, 0, sender.counter);
      if (sender.counter == 0){
         sender.setSprite(0, 0, 2);
      }
      Interface.scene.clearOld(sender);
      Interface.scene.move(sender);
      Interface.scene.drawObject(sender);
      
   };
}

spriteObject.prototype.moveUp = function() {
   //counter must be 4
   this.movementParam.dx = 0;
   this.movementParam.dy = -2;
   this.onTick = function(sender, param) {
      
      sender.setSprite(0, 2, sender.counter);
      Interface.scene.clearOld(sender);
      Interface.scene.move(sender);
      Interface.scene.drawObject(sender);
   };
};

spriteObject.prototype.moveDown = function() {
   //counter must be 4
   this.movementParam.dx = 0;
   this.movementParam.dy = 2;
   this.onTick = function(sender, param) {
      
      sender.setSprite(0, 1, sender.counter);
      Interface.scene.clearOld(sender);
      Interface.scene.move(sender);
      Interface.scene.drawObject(sender);
   };
};

spriteObject.prototype.moveJump = function() {
   this.movementParam.dx = 0;
   this.movementParam.dy = 0;

   var obj = Interface.scene.getObj(1);   
   var cb_bezierTest = function(pt) {
      var obj = Interface.scene.getObj(1);
      obj.movementParam.dy = pt.y - obj.y;      
      Interface.scene.clearOld(obj);
      Interface.scene.move(obj);
      Interface.scene.drawObject(obj);      
   };
   Geometry.testBezier(cb_bezierTest,obj);
   obj.dx = 0;
   obj.dy = 0;

   this.onTick = function(sender, param) {
      //counter must be 8
      //console.log("Jump Counter:", sender.counter);         
      //sender.setSprite(0, 6, sender.counter);
      /*Interface.scene.clearOld(sender);
       Interface.scene.move(sender);
       Interface.scene.drawObject(sender);*/
   };
};