//images
// part.of joke.js
image =  function(){};
image.prototype = {
	"image": null,
	"url": "",
	"width":0,
	"height":0,
	"name" :0,
	'loadFromFile' : function(url){
		this.url = url;
		this.image = new Image();
		this.image.src = url;
	 }
};
imageList = function(){};
imageList.prototype = {
	'images':[],
	'getImage' : function(index){
		return this.images[index];
	 }	
};


Sprite = function(image,sw,sh,rop){
	if (image){
		if (typeof(image) == "HTMLImageElement" || typeof(image) == "Image" ){
			this.image = image;
		}
		else{
			throw "Unsupported image format";
		}
	}
	if (rop){
		this.rasterOperation = rop;
		this.context.globalCompositeOperation = this.rasterOperation;
	}
};


Sprite.prototype = {
	"colOffset" : 0, //offset for  accurate positioning on sprite sheet
	"image" : null,
	"srcX":0,   // start clipping x on spritesheet
	"srcY":0,   // start clipping y on spritesheet
	"row":0,
	"col":0,
	"srcWidth":0, //sprite width
	"srcHeight":0,  //sprite height
	"rasterOperation":"copy"
};

Sprite.prototype.setSprite = function(imageIndex, row, col){	

	if (this.scene && this.scene.getImage){	
		this.image = this.scene.getImage(imageIndex);
	}
	this.row  = row;
	this.col = col;
	// Предполагается, что данный метод будет примешан к одному из классов sceneObject, у которого есть св-во context
	// Следовательно, габариты спрайта равны габаритам объекта
	if (this.width && this.height){
		this.srcWidth = this.width;
		this.srcHeight = this.height;
	}else
	{
		console.log("Properties width and/or height are not assigned. ");
	}
	this.srcY = this.srcHeight * row;
	this.srcX = this.srcWidth * col + this.colOffset;
};

Sprite.prototype.drawSprite = function (){
	// Предполагается, что данный метод будет примешан к одному из классов sceneObject, у которого есть св-во context
	
	if (this.rasterOperation) {
	if (!this.context) {
		this.context = this._canvas.getContext('2d');
	}
		this.context.globalCompositeOperation = this.rasterOperation;
	}
	try{
		
		this.context.drawImage( 
										this.image.image,
										this.srcX,
										this.srcY,
										this.srcWidth,
										this.srcHeight,
										0,
										0,
										this.width,
										this.height
										);
		//debugger;
		
	}
	catch (e){
		console.error('error occured : ' +e);
	}
};