int maxFrameRate = 120;
int canvasWidth = 650;
int canvasHeight = 800;

void setup() {
	size(canvasWidth, canvasHeight);
	frameRate(maxFrameRate);
} ;


// load stepfile into lines array
String lines [] = loadStrings("Songs/Sakura.sm");


// load music file
var audio = new Audio("Songs/sakurasakura.ogg");
audio.preload = "auto";

// misc vars
var scroll = "Down";
boolean showController = false;
ellipseMode(CENTER);
var defaultTextSize = 12;
textSize(defaultTextSize);

// difficulty vars
var selectHardest = 1;
var selectedDifficulty = 0;


// note position and display vars
var notePos = [[[]],[[]],[[]],[[]]];
if(scroll == "Down"){
	var receptorStart = [[50,620],[150,620],[250,620],[350,620]];	
} else {
	var receptorStart = [[50,180],[150,180],[250,180],[350,180]];
}
var receptors = [[],[],[],[]];
float timeRead = 0;
float timeInitial = 0;
int viewTop = 100;
int viewBottom = 700;
int noteHeight = 45;
float minNoteY = viewTop - noteHeight/2;
float maxNoteY = viewBottom + noteHeight/2;
var noteLocators = [0,0,0,0];
float minTime = 0;
float maxTime = 0;
int millisStart = 0;
int millisCurrent = 0;
// speed in units of milliseconds per 10 pixels
float speed = 18;
float manualOffset = -0.300;

// controller visualization vars
int buttonRadius = 20;
int buttonHeight = 90;
int buttonWidth = 65;
int hitRadius = 10;
int tlButtonX = 430;
int tlButtonY = 0;
var hit = [[tlButtonX+buttonWidth/2, tlButtonY+buttonHeight/2],[tlButtonX+buttonWidth/2, tlButtonY+buttonHeight/2]];
float originalDist = 1;
var currentNote = [-1,-1];
int nearestNote = [,];
int receptorNum = 0;
float nearestDist = 0;
float movePercent = 0;
float defaultBuffer = 4;
float buffer = 0;
float reactionDist = 35;
int controllerDist = 120;
var noteA = [,];
var noteB = [,];
int noteType = 0;
float hitX = 0;
float hitY = 0;
boolean hitDown = false;
// second controller visualization vars
float nearestDist2 = 0;
var currentNote2 = [-1,-1];
var nearestNote2 = [,];
float originalDist2 = 1;
var hit2 = [[tlButtonX+controllerDist+buttonWidth/2, tlButtonY+buttonHeight/2],[tlButtonX+controllerDist+buttonWidth/2, tlButtonY+buttonHeight/2]];
float hitX2 = 0;
float hitY2 = 0;
float buffer2 = 0;
boolean hitDown2 = false;

// noteskin vars
var noteAngle = 0;
var innerAngle = 45;
var noteSize = 65;

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

/** 
 * @function drawArrow
 * @description Draws a vector-based arrow
 * @param {float} arrowAngle 
 * The angle in degrees that the arrow will be pointing. Right is zero, and increases counterclockwise.
 * @param {float} arrowSize 
 * The height of the arrow in pixels, as well as four times the width of the arrow.
 * @param {array} arrowCenter 
 * The position of the center of the arrow [x,y].
 */
function drawArrow(arrowAngle, arrowSize, arrowCenter) {
    var m1 = 0;
	var m2 = 0;
	var x1 = 0;
	var y1 = 0;
	var Fx = 0;
	var Fy = 0;
	var Dx = 0;
	var Dy = 0;
	var I1 = 0;
	var I2 = 0;
    var arrowWidth = arrowSize/4;
    var arrowHeight = arrowSize;
    strokeWeight(1);
    if((arrowAngle+innerAngle)%90 !== 0 && (arrowAngle+90)%180 !== 0){
        arrowAngle += 0.00001;
    }
    m1 = (arrowCenter[0] + arrowHeight/2/tan(radians(innerAngle))*cos(radians(arrowAngle-90)) - arrowCenter[0] + arrowHeight/2*cos(radians(arrowAngle)))/(arrowCenter[1] - arrowHeight/2/tan(radians(innerAngle))*sin(radians(arrowAngle-90)) - arrowCenter[1] - arrowHeight/2*sin(radians(arrowAngle)));
    m2 = -(arrowCenter[1] + arrowHeight/2*sin(radians(arrowAngle)) + arrowWidth/2*sin(radians(arrowAngle+90)) - arrowCenter[1] + arrowHeight/2*sin(radians(arrowAngle)) - arrowWidth/2*sin(radians(arrowAngle+90)))/(arrowCenter[0] - arrowHeight/2*cos(radians(arrowAngle)) - arrowWidth/2*cos(radians(arrowAngle+90)) - arrowCenter[0] - arrowHeight/2*cos(radians(arrowAngle)) + arrowWidth/2*cos(radians(arrowAngle+90)));
    Fx = arrowCenter[0] + arrowHeight/2/tan(radians(innerAngle))*cos(radians(arrowAngle-90)) - arrowWidth*cos(radians(arrowAngle-innerAngle));
    Fy = arrowCenter[1] - arrowHeight/2/tan(radians(innerAngle))*sin(radians(arrowAngle-90)) + arrowWidth*sin(radians(arrowAngle-innerAngle));
    Dx = arrowCenter[0] - arrowHeight/2*cos(radians(arrowAngle)) - arrowWidth/2*cos(radians(arrowAngle+90));
    Dy = arrowCenter[1] + arrowHeight/2*sin(radians(arrowAngle)) + arrowWidth/2*sin(radians(arrowAngle+90));
    I1 = Fy + m1*Fx;
    I2 = Dy + m2*Dx;
    x1 = (I1 - I2)/(m1 - m2);
    y1 = -m1*x1 + I1;
    
    beginShape();
    
    // left base
    vertex(arrowCenter[0] - arrowHeight/2*cos(radians(arrowAngle)) + arrowWidth/2*cos(radians(arrowAngle+90)), arrowCenter[1] + arrowHeight/2*sin(radians(arrowAngle)) - arrowWidth/2*sin(radians(arrowAngle+90)));
    // right base
    vertex(arrowCenter[0] - arrowHeight/2*cos(radians(arrowAngle)) - arrowWidth/2*cos(radians(arrowAngle+90)), arrowCenter[1] + arrowHeight/2*sin(radians(arrowAngle)) + arrowWidth/2*sin(radians(arrowAngle+90)));
    // right inner
    vertex(x1, y1);
    // right arm bottom
    vertex(arrowCenter[0] + arrowHeight/2/tan(radians(innerAngle))*cos(radians(arrowAngle-90)) - arrowWidth*cos(radians(arrowAngle-innerAngle)), arrowCenter[1] - arrowHeight/2/tan(radians(innerAngle))*sin(radians(arrowAngle-90)) + arrowWidth*sin(radians(arrowAngle-innerAngle)));
    // right arm top
    vertex(arrowCenter[0] + arrowHeight/2/tan(radians(innerAngle))*cos(radians(arrowAngle-90)), arrowCenter[1] - arrowHeight/2/tan(radians(innerAngle))*sin(radians(arrowAngle-90)));
    // tip
    vertex(arrowCenter[0] + arrowHeight/2*cos(radians(arrowAngle)), arrowCenter[1] - arrowHeight/2*sin(radians(arrowAngle)));
    // left arm top
    vertex(arrowCenter[0] - arrowHeight/2/tan(radians(innerAngle))*cos(radians(arrowAngle-90)), arrowCenter[1] + arrowHeight/2/tan(radians(innerAngle))*sin(radians(arrowAngle-90)));
    // left arm bottom
    vertex(arrowCenter[0] - arrowHeight/2/tan(radians(innerAngle))*cos(radians(arrowAngle-90)) - arrowWidth*cos(radians(arrowAngle+innerAngle)), arrowCenter[1] + arrowHeight/2/tan(radians(innerAngle))*sin(radians(arrowAngle-90)) + arrowWidth*sin(radians(arrowAngle+innerAngle)));
    // left inner
    vertex(x1 + arrowWidth*cos(radians(arrowAngle+90)), y1 - arrowWidth*sin(radians(arrowAngle+90)));
    endShape(CLOSE);
};

var parsed = parse(lines);
var title = parsed["title"];
var artist = parsed["artist"];
var offset = parsed["offset"];
var bpms = parsed["bpms"];
var difficulties = parsed["difficulties"];
var notes = parsed["notes"];

if (selectHardest) {
 	selectedDifficulty = difficulties.length - 1;
}
else {
	// user prompt to select difficulty goes here
}

// Handle Input Module 1
window.addEventListener('keydown', handleKeyDown, true)
window.addEventListener('keyup', handleKeyUp, true)
var buttonsDown = [0,0,0,0];
var buttonsPressed = [0,0,0,0];
var buttonsKeys = [69, 70, 75, 79];

// memory of the notes on screen that have been hit, listed by note number
var hitMemory = [[],[],[],[]];

// defined repeatedly in the draw loop later
var hitWindowMin = 0;
var hitWindowMax = 0;

// the arrays contain the note number for the latest unhit note within the hit window, must initialize at zero, -1 is the null value
var hitRangeOld = [-1,-1,-1,-1];
var hitRangeNew = [-1,-1,-1,-1];

// Max late or early, set to FFR standard of 1/60 + 3/30, rounded to nearest whole millisecond
var timeMiss = 0.117;

// var misses = [0,0,0,0];

// executed on hit only, not on hold
function causeHit(buttonNum){
	buttonsPressed[buttonNum] = 1;
	
	var success = false;
	// find note in notePos that matches latest note in hit window
	// console.log(notePos[buttonNum].length + ", " + hitRangeNew[buttonNum] + ", " + notePos[buttonNum]);
	var i = 0;
	while(i < notePos[buttonNum].length){
		if(hitRangeNew[buttonNum] == notePos[buttonNum][i][2]){
			success = true;
			break;
		}
		i++
	}
	
	if(success == true){
		hitRangeOld[buttonNum] = -1;
		hitRangeNew[buttonNum] = -1;
		console.log("hit at time " + timeRead + ", number " + notePos[buttonNum][i][2] + ", with accuracy " + (round((notePos[buttonNum][i][4] - timeRead)*1000)) + "ms")
		hitMemory[buttonNum].push(notePos[buttonNum][i][2]);
	} else {
		// cause boo
		console.log("boo at time " + timeRead);
	}
	
}

function handleKeyDown(event) {
	for(i=0; i < buttonsDown.length; i++){
		if(event.keyCode == buttonsKeys[i]){
		
		// if button is not being held, trigger as pressing a button
			if(buttonsDown[i] == 0){
				causeHit(i);
			}
		
			buttonsDown[i] = 1;
		}
	}
}

function handleKeyUp(event) {
	for(i=0; i < buttonsDown.length; i++){
		
		if(event.keyCode == buttonsKeys[i]){
			buttonsDown[i] = 0;	
		}
		
	}
}
	
function causeMiss(receptorNumber){
	fill(0,255,0);
	textSize(defaultTextSize + 15);
	text("MISS",200, 300);
	textSize(defaultTextSize);
	fill(0,0,0);
	// misses[receptorNumber] ++;
}	

// end Handle Input Module 1


// initialize time for display loop
millisStart = millis();
timeInitial = offset + manualOffset;
noteLocators.length = notes.length;

audio.play();


void draw() {
    background(255, 255, 255);
	fill(0,0,0);
    text("Title: " + title,0,15);
	text("Artist: " + artist,0,30);
	text("Difficulty: " + difficulties[selectedDifficulty][0], 0, 45);
	text("FPS:  " + round(frameRate) + " / " + maxFrameRate, 335, 15);
	
	if(audio.ended == false){
		
		/**
		* @module Display notes and receptors 
		* @description Converts notes[] timing information into position information and displays it
		* @param {array} notes 
		* All of the notes contained in a specified difficulty, organized so that notes[0] = the set of notes for receptor 1, and notes[i][j] = the time position relative to the start of the notes (does not factor in offset at this point).
		* @return {array} <p>**receptors**</p>
		* - The position of each receptor, where the position of receptor (i+1) is given by receptors[i] = [x,y] (in pixels).
		* <p></p>
		* @return {array} <p>**notePos**</p>
		* - The position of each note on screen, in the form notePos[receptorNumber][noteNumber] = [x,y]. Receptor and note number initialize at zero and notes are in ascending chronological order.
		* <p></p>
		* @return {array} <p>**noteLocators**</p>
		* - The position of the earliest note on screen in notes[], or, the array index for each earliest note for each receptor, and noteLocators[receptorNumber] = #
		*/
		
		// begin note and receptor display loop
		// requires receptorStart[], minNoteY, maxNoteY (determined by view dimensions and noteHeight)
		millisCurrent = millis();
		timeRead = timeInitial + (millisCurrent - millisStart)/1000;
		text("Read Time = " + timeRead.toFixed(3) + "s", 0, 60);
		
		
		for(i=0; i < receptors.length; i++){
			
			// cause movement of receptors
			receptors[i][0] = receptorStart[i][0] + 11*sin(timeRead + i/3.14);
			receptors[i][1] = receptorStart[i][1];
			
			if(scroll == "Down"){
				minTime = timeRead - (minNoteY - receptors[i][1])*speed/10000;
				maxTime = timeRead - (maxNoteY - receptors[i][1])*speed/10000;
			} else {
				maxTime = timeRead + (minNoteY - receptors[i][1])*speed/10000;
				minTime = timeRead + (maxNoteY - receptors[i][1])*speed/10000;
			}
			
			// find latest note that will be displayed
			while(notes[i][noteLocators[i]] < maxTime){
				noteLocators[i] ++;
			}
			
			// clear positions from last frame
			notePos[i].length = 0;
			
			// initialize j at latest note number
			j = noteLocators[i];
			
			// populate note positions
			// notePos[i][j] = [x, y, note number, is hit, time position]
			// "is hit" is meant to make a note disappear after it is hit, which will require a memory of hit notes (not yet implemented)
			while(notes[i][j] <= minTime){
				if(scroll == "Down"){
					notePos[i].push([receptors[i][0], receptors[i][1] - (notes[i][j] - timeRead)*10000/speed, j, 0, notes[i][j]]);
				} else {
					notePos[i].push([receptors[i][0], receptors[i][1] + (notes[i][j] - timeRead)*10000/speed, j, 0, notes[i][j]]);
				}
				j++;
			}
			
			// reassign hit state of notes on screen from memory
			j = 0;
			while(j < hitMemory[i].length){
				var k = 0
				
				while(k < notePos[i].length){
					
					if(hitMemory[i][j] == notePos[i][k][2]){
						notePos[i][k][3] = 1;
					}
					k ++;
				
				}
				
				j ++;
			}
			
			// clean up memory
			if(hitMemory[i].length !== 0){
			
				if(notePos[i].length !== 0){
					
					// if the latest note in memory is no longer on screen, delete it
					if(hitMemory[i][0] < notePos[i][0][2]){
						hitMemory[i].remove(0);
					}
					
				} else {	

					// if notPos is empty, clear memory
					hitMemory[i].length = 0;
				}				
			}
			
			// draw receptors
			fill(255,255,255);
			if(i == 0){
				noteAngle = 180;
			}
			if(i == 1){
				noteAngle = 270;
			}
			if(i == 2){
				noteAngle = 90;
			}
			if(i == 3){
				noteAngle = 0;
			}
			drawArrow(noteAngle, noteSize, receptors[i]);
			
			// draw notes
			fill(255,0,0);
			for(j=0; j < notePos[i].length; j++){
				if(i == 0){
				noteAngle = 180;
				}
				if(i == 1){
					noteAngle = 270;
				}
				if(i == 2){
					noteAngle = 90;
				}
				if(i == 3){
					noteAngle = 0;
				}
				if(notePos[i][j][3] == 0){
					drawArrow(noteAngle, noteSize, notePos[i][j]);
				}
				
				// Debug notPos[], display info next to each note on screen
				// if(scroll == "Down"){
					// var test = timeRead - (notePos[i][j][1] - receptors[i][1])*speed/10000;
				// } else {
					// var test = timeRead + (notePos[i][j][1] - receptors[i][1])*speed/10000;
				// }
				// test = notePos[i][j][4];
				// text(test.toFixed(3) + ", " + notePos[i][j][2], notePos[i][j][0] + 45, notePos[i][j][1] + 5);
				
			}
		}
		
		
		// Handle Input Module 2
		
		timeWindowMax = timeRead + timeMiss;
		timeWindowMin = timeRead - timeMiss;
		
		// store the position of the latest unhit note in the hitRange array
		for(i=0; i < receptors.length; i++){
			
			var success = false;
			
			for(j=0; j < notePos[i].length; j++){
				
				if(notePos[i][j][4] <= timeWindowMax){
					
					if(notePos[i][j][4] >= timeWindowMin && notePos[i][j][3] == 0){
						success = true;
						break;
					}
					
				} else {
					break;
				}		
			}
			
			// fill(0,0,0);
			// text(misses,0,130);
			
			if(success == true){
				hitRangeNew[i] = notePos[i][j][2];
			} else {
				hitRangeNew[i] = -1;
			}
			
			// compare new to old, if different, cause miss
			if(hitRangeNew[i] !== hitRangeOld[i] && hitRangeOld[i] !== -1){
				// option to implement receptor-specific miss features
				causeMiss(i);
			}
			
			// store new on old
			hitRangeOld[i] = hitRangeNew[i];
		
		}
		
		// fill(0,0,0);
		// text(buttonsDown, 0, 100);
		// text(buttonsPressed, 0, 115);
		
		// at end of handle input, default to not pressed
			for(i=0; i < buttonsPressed.length; i++){
				buttonsPressed[i] = 0;
			}
			
		// end Handle Input Module 2
		
		
		
		/**
		* @module Controller visualization
		* @param {array} notePos 
		* The position of each note on screen, in the form notePos[receptorNumber][noteNumber] = [x,y]. Receptor and note number initialize at zero and notes are in ascending chronological order.
		* @param {array} receptors
		* The position of each receptor, where the position of receptor (i+1) is given by receptors[i] = [x,y] (in pixels).
		* @param {array} noteLocators
		* The position of the earliest note on screen in notes[], or, the array index for each earliest note for each receptor, and noteLocators[receptorNumber] = #.
		* @return {array} <p>**hit**</p>
		* - The old and new position of the hit circle, where hit[0] = [x_old, y_old] and hit[1] = [x_new, y_new]
		*/
		
		// begin controller visualization loop
		if(scroll == "Down" && showController === true){
		fill(255,255,255);
		// button set 1
		arc(tlButtonX,tlButtonY,buttonRadius*2,buttonRadius*2,0,PI);
		arc(tlButtonX,tlButtonY+buttonHeight,buttonRadius*2,buttonRadius*2,PI,2*PI);
		arc(tlButtonX+buttonWidth,tlButtonY,buttonRadius*2,buttonRadius*2,0,PI);
		arc(tlButtonX+buttonWidth,tlButtonY+buttonHeight,buttonRadius*2,buttonRadius*2,PI,2*PI);
		
		// button set 2
		arc(tlButtonX + controllerDist,tlButtonY,buttonRadius*2,buttonRadius*2,0,PI);
		arc(tlButtonX + controllerDist,tlButtonY+buttonHeight,buttonRadius*2,buttonRadius*2,PI,2*PI);
		arc(tlButtonX + controllerDist+buttonWidth,tlButtonY,buttonRadius*2,buttonRadius*2,0,PI);
		arc(tlButtonX + controllerDist+buttonWidth,tlButtonY+buttonHeight,buttonRadius*2,buttonRadius*2,PI,2*PI);
		fill(0,0,0);
		
			
			int j = -1;
			for(i=0; i < notePos[0].length; i++){
				if(notePos[0][i][1] > receptors[0][1]){
					j = i;
				}
			}
			if(notePos[0].length - 1 > j){
				j ++;
			} else {
				j = -1;
			}
			if(notePos[0].length == 0 || j == -1){
				noteA = [-10000, j];
			} else {
				noteA = [notePos[0][j][1] , j + 1];
			}
			
			int j = -1;
			for(i=0; i < notePos[1].length; i++){
				if(notePos[1][i][1] > receptors[1][1]){
					j = i;
				}
			}
			if(notePos[1].length - 1 > j){
				j ++;
			} else {
				j = -1;
			}
			if(notePos[1].length == 0 || j == -1){
				noteB = [-10000, j];
			} else {
				noteB = [notePos[1][j][1] , j + 1];
			}
			
			// if there is no nearest note, do not cause nearest note to update
			if(noteA[1] == -1){
				noteA = [-100000, currentNote[2]];
			} 
			if(noteB[1] == -1){
				noteB = [-100000, currentNote[2]];
			}
			
			if(noteA[0] > noteB[0]){
				// noteType = 0;
				nearestDist = receptors[0][1] - noteA[0];
				nearestNote = [0, noteA[1] + noteLocators[0] + 1];
			}
			if(noteB[0] > noteA[0]){
				// noteType = 1;
				nearestDist = receptors[1][1] - noteB[0];
				nearestNote = [1, noteB[1] + noteLocators[1] + 1];
			}
			if(noteA[0] ==  noteB[0]){
				// noteType = 2;
				nearestDist = receptors[0][1] - noteA[0];
				nearestNote = [2, noteA[1] + noteLocators[0] + 1];
			}
			
			// text(nearestNote + " , " + nearestDist.toFixed(3),receptors[0][0]-25,receptors[0][1] + 30);
			// text(nearestDist.toFixed(3),receptors[1][0],receptors[1][1] + 30);
			// text((nearestDist < 5000) + " , " + (currentNote[0] != nearestNote[0]) + " , " + (currentNote[1] != nearestNote[1]), 0, 120);
			// text(currentNote, 0, 135);
			// text(nearestNote, 0, 150);
			
			// replace old note with new note when appropriate
			if(nearestDist < 5000 && ((currentNote[0] != nearestNote[0]) || (currentNote[1] != nearestNote[1]))){
				
				currentNote[0] = nearestNote[0];
				currentNote[1] = nearestNote[1];
				originalDist = nearestDist;
				
				// do up
				if(hitDown == false){
					hitDown = true;
					
					// old = new
					hit[0] = hit[1];
					
					if(currentNote[0] == 0) {
						hit[1] = [tlButtonX, tlButtonY + buttonRadius + hitRadius];
					}
					if(currentNote[0] == 1) {
						hit[1] = [tlButtonX + buttonWidth, tlButtonY + buttonRadius + hitRadius];
					}
					if(currentNote[0] == 2) {
						hit[1] = [tlButtonX + buttonWidth/2, tlButtonY + hitRadius];
					}
					
				// do down
				} else {
					hitDown = false;
					
					// old = new
					hit[0] = hit[1];
					
					if(currentNote[0] == 0) {
						hit[1] = [tlButtonX, tlButtonY + buttonHeight - buttonRadius - hitRadius];
					}
					if(currentNote[0] == 1) {
						hit[1] = [tlButtonX + buttonWidth, tlButtonY + buttonHeight - buttonRadius - hitRadius];
					}
					if(currentNote[0] == 2) {
						hit[1] = [tlButtonX + buttonWidth/2, tlButtonY + buttonHeight - hitRadius];
					}
					
				}
				
				
			}
			
			// calculate percent animation
			
			if(nearestDist >= reactionDist ){
				buffer = defaultBuffer + originalDist - reactionDist;
			}
			
			if(2*defaultBuffer < originalDist){
				movePercent = (originalDist/(originalDist - buffer))*(1-(nearestDist + buffer)/originalDist);
			} else {
				movePercent = 1 - nearestDist/originalDist;
			}
			
			if(nearestDist > 5000){
				movePercent = 1;
			}
			
			if(movePercent < 0){
				hitX = hit[0][0];
				hitY = hit[0][1];
			} else {
				hitX = hit[0][0] + movePercent*(hit[1][0] - hit[0][0]);
				hitY = hit[0][1] + movePercent*(hit[1][1] - hit[0][1]);
			}
			
			
			fill(0, 0, 0);
			ellipse(hitX, hitY, hitRadius*2, hitRadius*2);
			
		} else {
		}
		
		// controller visualization 2
		
		if(scroll == "Down" && showController === true){
			int j = -1;
			for(i=0; i < notePos[2].length; i++){
				if(notePos[2][i][1] > receptors[2][1]){
					j = i;
				}
			}
			if(notePos[2].length - 1 > j){
				j ++;
			} else {
				j = -1;
			}
			if(notePos[2].length == 0 || j == -1){
				noteA = [-10000, j];
			} else {
				noteA = [notePos[2][j][1] , j + 1];
			}
			
			int j = -1;
			for(i=0; i < notePos[3].length; i++){
				if(notePos[3][i][1] > receptors[3][1]){
					j = i;
				}
			}
			if(notePos[3].length - 1 > j){
				j ++;
			} else {
				j = -1;
			}
			if(notePos[3].length == 0 || j == -1){
				noteB = [-10000, j];
			} else {
				noteB = [notePos[3][j][1] , j + 1];
			}
			
			// if there is no nearest note, do not cause nearest note to update
			if(noteA[1] == -1){
				noteA = [-100000, currentNote2[2]];
			} 
			if(noteB[1] == -1){
				noteB = [-100000, currentNote2[2]];
			}
			
			if(noteA[0] > noteB[0]){
				nearestDist2 = receptors[2][1] - noteA[0];
				nearestNote2 = [0, noteA[1] + noteLocators[2] + 1];
			}
			if(noteB[0] > noteA[0]){
				nearestDist2 = receptors[3][1] - noteB[0];
				nearestNote2 = [1, noteB[1] + noteLocators[3] + 1];
			}
			if(noteA[0] ==  noteB[0]){
				nearestDist2 = receptors[2][1] - noteA[0];
				nearestNote2 = [2, noteA[1] + noteLocators[2] + 1];
			}
			
			// replace old note with new note when appropriate
			if(nearestDist2 < 5000 && ((currentNote2[0] != nearestNote2[0]) || (currentNote2[1] != nearestNote2[1]))){
				
				currentNote2[0] = nearestNote2[0];
				currentNote2[1] = nearestNote2[1];
				originalDist2 = nearestDist2;
				
				// do up
				if(hitDown2 == false){
					hitDown2 = true;
					
					// old = new
					hit2[0] = hit2[1];
					
					if(currentNote2[0] == 0) {
						hit2[1] = [tlButtonX + controllerDist, tlButtonY + buttonRadius + hitRadius];
					}
					if(currentNote2[0] == 1) {
						hit2[1] = [tlButtonX + controllerDist + buttonWidth, tlButtonY + buttonRadius + hitRadius];
					}
					if(currentNote2[0] == 2) {
						hit2[1] = [tlButtonX + controllerDist + buttonWidth/2, tlButtonY + hitRadius];
					}
					
				// do down
				} else {
					hitDown2 = false;
					// old = new
					hit2[0] = hit2[1];
					if(currentNote2[0] == 0) {
						hit2[1] = [tlButtonX + controllerDist, tlButtonY + buttonHeight - buttonRadius - hitRadius];
					}
					if(currentNote2[0] == 1) {
						hit2[1] = [tlButtonX + controllerDist + buttonWidth, tlButtonY + buttonHeight - buttonRadius - hitRadius];
					}
					if(currentNote2[0] == 2) {
						hit2[1] = [tlButtonX + controllerDist + buttonWidth/2, tlButtonY + buttonHeight - hitRadius];
					}
				}
			}
			
			// calculate percent animation
			
			if(nearestDist2 >= reactionDist ){
				buffer2 = defaultBuffer + originalDist2 - reactionDist;
			}
			
			if(2*defaultBuffer < originalDist2){
				movePercent = (originalDist2/(originalDist2 - buffer2))*(1-(nearestDist2 + buffer2)/originalDist2);
			} else {
				movePercent = 1 - nearestDist2/originalDist2;
			}
			
			if(nearestDist2 > 5000){
				movePercent = 1;
			}
			
			if(movePercent < 0){
				hitX2 = hit2[0][0];
				hitY2 = hit2[0][1];
			} else {
				hitX2 = hit2[0][0] + movePercent*(hit2[1][0] - hit2[0][0]);
				hitY2 = hit2[0][1] + movePercent*(hit2[1][1] - hit2[0][1]);
			}
			
			
			fill(0, 0, 0);
			ellipse(hitX2, hitY2, hitRadius*2, hitRadius*2);
			
		} else {
		}
		
	}	
	
};