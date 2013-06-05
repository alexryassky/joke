/**
 * 
 * returns reversed vector
 * @returns Reversed vector
 */
vector.prototype.Rev = function() {
	this.x(-1);
};	

//@todo mix to sceneObject
Force = function(name, vector) {
	this.name = "Gravity",
		this.vector = $v([0, 3, 0]);
};


Force.prototype = {
	get name() {
		return  this.name;
	},
	set name(value) {
		this.name = value;
	},
	get vector() {
		return  this.name;
	},
	set vector(value) {
		this.vector = value;
	}
};

Forces = [new Force(), new Force()];
Fizik = function() {
};
//@todo mix to sceneObject
Fizik.prototype = {
	"addForce": function(name, vector) {
		var force = new Force(name, vector);
		Forces.push(force);
	},
	"getAntiForce": function(force) {
		return new Force("Anti" + force.name, this.vector.Rev());
	},
	"applyForces": function() {
		//find vector sum
		var vec = vector.create([0, 0, 0]);
		while (this.Forces.length > 0) {
			vec.add(this.Forces.pop());
		}
		this.Forces.push(vec);
		//result vector applying
	}
};


