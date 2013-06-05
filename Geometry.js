mPoint = function(x, y) {
	this.x = x ? x : 0;
	this.y = y ? y : 0;
};

mVector = function(start, end) {
	this.start = start;
	this.end = end;
};

mVector.prototype = {
	//Горизонтальная составляющая
	get X(){
		return Math.abs(this.start.x-this.end.x);
	},
	//Вертикальная составляющая
	get Y(){
		return Math.abs(this.start.y-this.end.y);
	},
	
	'_translate': function(x, y) {
		this.start.x += ~~x;
		this.end.x += ~~x;
		this.start.y += ~~y;
		this.end.y += ~~y;
		return this;
	},
	
	"Perp": function(vector) // перпендикуляр
	{
		return new mVector(-vector.Y, vector.X);
	}
	,
	"Dot": function(vector) // скалярное произведение
	{
		return this.X * vector.X + this.Y * vector.Y;
	},
	"Rev" : function (){
		return new mVector(this.end, this.start)
	},
	"Add" : function (vector){
		
	}
};


Geometry = {
	/**
	 *
	 * Вычисляет точки кривой Безье 2-го порядка в зависимости от t.
	 * Кривая 2-го порядка - например парабола
	 * @param bezierParams - координаты для опорных точек кривой Безье 2-го порядка
	 * @return Point возвращает точку на кривой безье
	 */
	"getBezierPoints": function(bezierParams, t) {
		var p1 = bezierParams[0];
		var p2 = bezierParams[1];
		var p3 = bezierParams[2];
		var px = ~~(Math.pow((1 - t),
			2) * p1.x + 2 * (1 - t) * t * p2.x + Math.pow(t, 2) * p3.x);
		var py = ~~(Math.pow((1 - t),
			2) * p1.y + 2 * (1 - t) * t * p2.y + Math.pow(t, 2) * p3.y);
		return new mPoint(px, py);
	},
	/**
	 * Скок-поскок
	 * @param function cb - iteration handler
	 * @param sceneObject obj  - jumping actor
	 */
	"testBezier": function(cb, obj) {
		pt1 = new mPoint(obj.x, obj.y + 4);
		pt2 = new mPoint(obj.x + 50, obj.y - 90);
		pt3 = new mPoint(obj.x + 100, obj.y + 4);
		var points = [pt1, pt2, pt3];
		var counter = 1;
		var i = 0;
		var self = this;
		var func = function(counter, self) {
			counter -= 0.02;
			if (counter > 0) {
				var pt = self.getBezierPoints(points, counter);
				cb(pt);
				setTimeout(func, 20, counter, self);
			}
		};
		setTimeout(func, 20, counter, self);
	},
	/**
	 * set of functions for axis-aligned bounding box logic
	 */
	"getMinProjectionAxis": function(obj1, obj2) {

	},
	"getCollisionQuarters": function(obj1, obj2) {
		var centerObj1 = new mPoint(obj1.x + obj1.width / 2,
			obj1.y + obj1.height / 2);
		var centerObj2 = new mPoint(obj2.x + obj2.width / 2,
			obj2.y + obj2.height / 2);
		return  centerObj1.x <= centerObj2.x ?
			centerObj1.y <= centerObj2.y ? 4 : 1
			:
			centerObj1.y <= centerObj2.y ? 3 : 2;
	}
	,
	/**
	 * Возвращает вектор полуширины
	 * @param sceneObject obj
	 * @param int quarter
	 * @param string axis
	 * @returns mVector
	 */
	"getHalfWidthVector": function(obj, quarter, axis) {
		var vec = new mVector();
		vec.start = new mPoint(obj.width / 2, obj.height / 2);
		if (axis === 'x') {
			if (quarter === 1 || quarter === 4) {
				vec.end = new mPoint(obj.width, vec.start.y);
			}
			else {
				if (quarter === 2 || quarter === 3) {
					vec.end = new mPoint(0, vec.start.y);
				}
			}
		}
		else {
			if (axis === 'y') {
				if (quarter === 1 || quarter === 2) {
					vec.end = new mPoint(vec.start.x, 0);
				}
				else {
					if (quarter === 3 || quarter === 4) {
						vec.end = new mPoint(vec.start.x,
							vec.start.y + obj.height / 2);
					}
				}
			}
		}
		return vec;
	},
	"getOppositeQuarter": function(quarter) {
		return (quarter > 2) ? quarter >> 1 : (quarter << 1) + quarter % 2;
	},
	/**
	 *  Находит пересечение между проекциями векторов на разделяющие оси X и Y
	 * для Axis Aligned Bounding Box model
	 */
	"getIntersection": function(vec1, vec2, axis, quarter) {
		console.log('Quarter:', quarter);
		var intersection = [];
                
		switch (quarter) {
			case 1:
				//1st quarter .*/
				if (axis === 'x') {
					return Math.max(vec1.start.x, vec1.end.x) - Math.min(vec2.end.x, vec2.start.x);
				}
				else {
					return  Math.min(vec1.end.y, vec1.start.y) - Math.max(vec2.start.y, vec2.end.y);
				}
				break;
			case 2:
				//2nd quarter . Object 2 approaches from left . */
				if (axis === 'x') {
					return Math.min(vec1.end.x, vec1.start.x) - Math.max(vec2.start.x, vec2.end.x);
				}
				else {

					return  Math.min(vec1.end.y, vec1.start.y) - Math.max(vec2.start.y, vec2.end.y);
				}
				break;
			case 3:
				if (axis === 'x') {
					return Math.min(vec1.end.x, vec1.start.x) - Math.max(vec2.start.x, vec2.end.x);
				}
				else {

					return  Math.min(vec2.end.y, vec2.start.y) - Math.max(vec1.start.y, vec1.end.y);
				}
				break;
			case 4:
				if (axis === 'x') {
					return Math.max(vec1.start.x, vec1.end.x) - Math.min(vec2.end.x, vec2.start.x);
				}
				else {
					return  Math.min(vec2.end.y, vec2.start.y) - Math.max(vec1.start.y, vec1.end.y);
				}
				break;
			default :
				console.log('Quarter not defined');
				break;
		}
	}
}
