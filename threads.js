//loops.js
//part of joke.js
// Represents "thread" of  concrete object or group of objects

Thread  = function(){};

Thread.prototype  = {
	"threadPriority" :{
		'HIGHEST': 10,
		'HIGH' : 50,
		'MEDIUM' : 200,
		'SLOW' : 2000,
		'SLOWEST' :2000,
		'ALMOST_DEAD': 10000,
		'CUSTOM':100
	},
	"threadPriopiry":0,		// Priority of thread, or simply timer Interval
	"counter":0,			// When object ticks "counter" times, then ticking become terminated
	"terminated" : true,	// determines whether loop is executed or not
	"ticker" : null,		// ticking timer
	"tick": function(self, param){		// ticking action
		param = self.onTick(self, param);
		if (self.counter> 0){
			self.counter--;
			this.ticker = setTimeout( self.tick, self.threadPriority.CUSTOM, self,param);
		}
		else {
			self.counter = 0;
			self.terminate();
		}
	},
	"start": function(tickParam){
      
		if (this.ticker)
			return false;
      this.counter = 4;
		var self = this;
		this.ticker = setTimeout( this.tick, this.threadPriority.CUSTOM, self,tickParam);
	},
	"terminate": function() {
		this.terminated = true;
		clearTimeout(this.ticker);
		this.ticker=null;
	},
	// Just example, you should implement this method by himself
	"onTick" : function(sender, param){		
		return param;
	},
	"onTerminated" : function(){}
};