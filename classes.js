/* Paradigm part */

// Реализует наследование

function inherit(proto) {
	function F() {}
	  F.prototype = proto;
	  var object = new F;
	  return object;
	}

//Реализует примеси

function mixin(dest, src) {
	var field,  tempObj = {};
	for (field in src){
		if (typeof(tempObj[field]) == undefined || (tempObj[field] != src[field])){
			dest[field] = src[field];
		}
	}
}

/* Behaviors  */



//Возвращает имя класса данного объекта, имеющего примесь поведения
function globalGetClassName(e){
	if (e && e.Class){
		return (e.Class);
	}
	else
	{
		return '';
	}
}


function globalGetObj(e) {
	var name = null;
  for ( name in this.global){
      if (this.global[name] == this) {
			return name;
		}
	}
	return null;
}

//Поведение позволяет осуществить примешивание к целевому классу новых методов и свойств.

// приватные свойства
behavior = function (targetObj, name) {
	this.name = name;
	this.owner = targetObj;
};

behavior.prototype = {
	/*"name" : "",
	"owner": '',*/
	"mixin" : function (dest, src) {
		var field, systemNames = ['setOwner', 'getOwner', 'apply'], tempObj = {};
		for (field in src) {
			if (
				(typeof (tempObj[field]) == undefined || (tempObj[field] != src[field])) &&
					systemNames.indexOf(src[field]) === -1
			)
				 {
					dest[field] = src[field];
				}
		}
	},

	"setOwner" :  function(owner){
					this.Class = this.constructor.name;
					this.owner = owner;
					if (this.apply) {
						this.apply();
					}
					mixin(this.owner,  this);

				},
	"getOwner": function () {
					return owner;
				},
	"apply"  :	function(){

						this.mixin(this.owner, this);
						//var func = this.owner[methodName];
						//var func = window[methodName];
						//console.log('Applying to '+targetObj.toString()+ ' ,func =' + methodName);
						//func.call(this.owner,  param);
				}

};

applyToBehavior = function(){};
applyToBehavior.prototype = inherit(behavior.prototype);
applyToBehavior.prototype.applyTo = function(targetObj, methodName, param){
										 //sceneObject  setSprite    imageIndex
	if (targetObj && this[methodName]){
		//Вызвать метод в контексте другого объекта
		this[methodName].call(targetObj, param);
	}
};

setImageBehavior = function(){
};
setImageBehavior.prototype = inherit(applyToBehavior.prototype);

setImageBehavior.prototype.apply = function (){
	var imgList = new imageList();
	this.mixin(this, imgList);
}

spriteBehavior = function(){};
spriteBehavior.prototype = inherit(applyToBehavior.prototype);
spriteBehavior.prototype.apply = function(){
		var sprite = new Sprite(null,0,0,0);
		this.mixin(this, sprite);
	};

threadBehavior =  function(){};
threadBehavior.prototype = inherit(applyToBehavior.prototype);
threadBehavior.prototype.apply = function(){
		var thread = new Thread();
		this.mixin(this,thread);
};
