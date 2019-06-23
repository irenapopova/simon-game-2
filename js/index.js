const WINNING_STEPS = 5;

//simonGame class
function simonGame(){
	this.pattern = [];
	this.strictMode = false;
	this.nextStepPointer = 0;
	this.gameON = false;
	this.endOfCurrentSeries = false;
	this.intervalID = "";
	this.timeoutID = "";
}

//A method that creates a random button press and returns the new pattern
simonGame.prototype.createNextStep = function(){
	var randomStep = Math.floor(Math.random()*4);
	this.pattern.push(randomStep);
	this.resetStepPointer();
	this.endOfCurrentSeries = false;
	return this.pattern;
};

simonGame.prototype.play = function(buttonPress){
	if (buttonPress == this.pattern[this.nextStepPointer]){
		this.nextStepPointer++;
		this.endOfCurrentSeries = (this.nextStepPointer == this.pattern.length) ? true : false;
		return true;
		
	}
	//It was a bad press, so move pointer back to 0.
	this.resetStepPointer();
	return false;
};

simonGame.prototype.resetStepPointer = function(){
	this.nextStepPointer = 0;
};

simonGame.prototype.reset = function(){
	this.gameON = false;
	this.strictMode = false;
	this.restart();
};

simonGame.prototype.restart = function(){
	this.pattern = [];
	this.endOfCurrentSeries = false;
	this.resetStepPointer();
};

simonGame.prototype.toggleStrictMode = function(){
	this.strictMode = !this.strictMode;
};

simonGame.prototype.isWinner = function(){
	return this.pattern.length == WINNING_STEPS;
};

//model layer
var model = {
	game: {},
	setupGame: function(){
		this.game = new simonGame();
	}
};

//controller layer
var controller = {
	initializeGame: function(){
		model.setupGame();
	},
	toggleTurnON: function(){
		if (model.game.gameON){
			model.game.gameON  = false;
		  this.resetGame();
		  view.showCount("");
		  view.showStrictMode(model.game.strictMode);
		}
		else{
			model.game.gameON  = true;
			view.showCount("--")
		}
	},
	resetGame: function(){
		this.clearStepsShows();
		model.game.reset();
	},
	clearStepsShows: function(){
		clearInterval(model.game.intervalID);
		clearTimeout(model.game.timeoutID);
		view.resetOpacity();
	},
	startGame: function(){
		if (model.game.gameON){
		  this.clearStepsShows();
			model.game.restart();
		  this.addStep();
	 }
	},
	toggleStrictMode: function(){
		if (model.game.gameON){
		  model.game.toggleStrictMode();
		  view.showStrictMode(model.game.strictMode);
		}
	},
	addStep: function(){
		if (model.game.isWinner()){
				//winning sound is 7 seconds
				view.showWinner();
				model.game.timeoutID = setTimeout(function(){
					view.hideWinner();
					model.game.timeoutID = setTimeout(function(){
						this.startGame();
						}.bind(this),100);	
				}.bind(this),7000);	
		}else{
		  var updatedSteps = model.game.createNextStep();
		  this.showSteps(updatedSteps);
		}
	},
	//The method wil present the current series of presses
	showSteps: function(steps){
		view.disableColorBtns();
			var i = 0;
			model.game.intervalID = setInterval(function(){
				if (i < steps.length){
					if (i==0){
					view.showCount(steps.length);
					}
					view.showStep(steps[i]);
					model.game.timeoutID = setTimeout(function(step){
							view.resetOpacity();
					},800, steps[i])
					i++;
				}else{
					clearInterval(model.game.intervalID);
					view.enableColorBtns();
				}	
			}.bind(this),900);
	},
	//When the user presses a button, it will check whether it is the correct next Step
	///If the user presses all of the correct button presses, then it will create add an additional button press.
	checkPress: function(buttonPress){
		var isPressCorrect = model.game.play(buttonPress);
		if (isPressCorrect){
			//check if the player completed the series of steps
			if (model.game.endOfCurrentSeries){ 
			  model.game.timeoutID = setTimeout(function(){
			  return this.addStep();
			  }.bind(this),500);	
			}
		}
		else{
			if (model.game.strictMode){
				view.showWrongMove();
				this.startGame();
			}else{
				//Notify the user they pressed the wrong button by playing a noise
				view.disableColorBtns();
				view.showWrongMove();
				model.game.timeoutID = setTimeout(function(){
				  //repeat the series of button presses to remind the player of the patter
				  this.showSteps(model.game.pattern);
				}.bind(this),1000);			
			}
		}
	}
};

var view = {
  setUpEventListeners: function(){
  	var colorBtns = document.getElementsByClassName('colored-btns')[0];
  	var buttonList = colorBtns.querySelectorAll("button");

  	for (var i = 0; i < buttonList.length; i++) {
  		buttonList[i].addEventListener("click", function(){
    		controller.checkPress(parseInt(this.value));
    		view.playSound(this.value);
     	});
  	}

  	var startBtn = document.getElementsByClassName('startBtn')[0];
  	var strictModeBtn = document.getElementsByClassName('strictModeBtn')[0];
  	var toggleON = document.getElementsByClassName('toggleCheckBox')[0];

  	startBtn.addEventListener("click", function(){
    		controller.startGame();
     });
  	
  	strictModeBtn.addEventListener("click", function(){
    		controller.toggleStrictMode();
    });

  	toggleON.addEventListener("click", function(){
    		controller.toggleTurnON();
     });
  },
  playSound: function(value){
  	
  	var soundName = {
  		"0": "audio_0",
  		"1": "audio_1",
  		"2": "audio_2",
  		"3": "audio_3",
  		"winner": "winner",
  		"error": "error"
  	}
  	document.getElementById(soundName[value]).play();
  },
  disableColorBtns: function(){
  	document.getElementsByClassName('colored-btns')[0].classList.add('disable-clicks');
  },
  enableColorBtns: function(){
  	document.getElementsByClassName('colored-btns')[0].classList.remove('disable-clicks')
  },
  showCount: function(count){
  	document.getElementById('count').innerHTML = count;
  },
  showWrongMove: function(){
  	this.playSound("error");
  	document.getElementById('count').innerHTML = "!!";
  },
  showStrictMode: function(flag){
  	var indicator = document.getElementsByClassName('strictModeIndicator')[0].classList;
  	(flag == true) ? indicator.add('led-on') : indicator.remove('led-on');
  },
  showStep: function(step){
  	var gameWell = document.getElementsByClassName('colored-btns')[0];
  	var buttonList = gameWell.querySelectorAll("button")
  	buttonList[step].classList.add('light');
  	this.playSound(step);
  },
  //remove full opacity from buttons inside colored-btns
  resetOpacity: function(){
  	var colorBtns = document.getElementsByClassName('colored-btns')[0];
  	var buttonList = colorBtns.querySelectorAll("button");

  	for (var i =0; i<buttonList.length; i++){
  			buttonList[i].classList.remove('light');
  	}
  },
  showWinner: function(){
  	this.playSound("winner");
  	return $(".winner-display").fadeIn(1000);
  },
  hideWinner: function(){
  	return $(".winner-display").fadeOut(1000);
  }
}
controller.initializeGame();
view.setUpEventListeners();