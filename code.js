
void setup() { 
  size(650, 800); 
  frameRate(120);
} ;

// load stepfile into lines array
String lines [] = loadStrings("Island.sm");
// String lines [] = loadStrings("sm.sm")

// load music file
var audio = new Audio("04 Island.ogg");
// var audio = new Audio("960 BPM Speedcore.ogg")
audio.preload = "auto";

// misc vars
int i = 0;
var title = "";
var artist = "";
var scroll = "Down";
ellipseMode(CENTER);

// [[beat, bpm], [beat, bpm], ...]
var bpms = [[,]];

// [[difficulty, line number], [difficulty, line number], ...]
array difficulties = [];

// difficulty vars
boolean selectHardest = 1;
int selectedDifficulty = 0;

// sm file conversion vars
int currentLine = 1;
int measureNum = 1;
float currentBpm = 0;
float secPerNote = 0;
int linesProcessed = 0;
float currentTime = 0;
var notes = [[],[],[],[]];
var lineNotes = [];
boolean notesEnd = 0;

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
float offset = 0;
int millisStart = 0;
int millisCurrent = 0;
// speed in units of milliseconds per 10 pixels
float speed = 18;
float manualOffset = -0.356;

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


// grab stepfile info: title, artist, offset, bpms
while(lines[i].charAt(0) == "#"){
	//console.log(lines[i]);
	if(lines[i].substring(1,lines[i].indexOf(":")) == "TITLE"){
		title = lines[i].substring(lines[i].indexOf(":")+1,lines[i].indexOf(";"));
	}
	if(lines[i].substring(1,lines[i].indexOf(":")) == "ARTIST"){
		artist = lines[i].substring(lines[i].indexOf(":")+1,lines[i].indexOf(";"));
	}
	if(lines[i].substring(1,lines[i].indexOf(":")) == "OFFSET"){
		offset = float(lines[i].substring(lines[i].indexOf(":")+1,lines[i].indexOf(";")));
	}
	
	// assumes bpms are in one line
	if(lines[i].substring(1,lines[i].indexOf(":")) == "BPMS"){
		var bpmString = lines[i].substring(lines[i].indexOf(":")+1,lines[i].indexOf(";"));
		var bpmSubstrings = bpmString.split(",");
		for(j=0;j<bpmSubstrings.length;j++){
			bpms[j] = bpmSubstrings[j].split("=");
		}
		// convert the array of strings to an array of floats
		for(j=0;j<bpms.length;j++){
			for(k=0;k<2;k++){
				bpms[j][k] = float(bpms[j][k]);
			}		
		}
		
		console.log(bpms);
	}	
	i++;
}

// this loop extracts difficulties in the form: ["difficulty", line number where notes start]
do{	
		
	while(lines[i] != "#NOTES:" && i < lines.length){
		i++;
	}
	
	if(i+3 < lines.length){
		i += 3;
		
		// encountered bizarre error where difficulties array would simply return "C6" or "C5", fixed after PC restart
		append(difficulties,[lines[i].substring(5,lines[i].length-1),i+3]);
	}
	
}
while(i < lines.length);

// NOTE: lines array starts counting at zero, therefore values may seem like they are off by one
console.log(difficulties);

function getNotes(j){
	lineNotes = [];
	for(i=0; i < lines[j].length; i++){
		if(lines[j].charAt(i) == 1){
			append(lineNotes, i);
		}
	}	
}

if(selectHardest){
 	selectedDifficulty = difficulties.length - 1;
 } else {
	// user prompt goes here
}

currentLine = difficulties[selectedDifficulty][1];

// begin note conversion loop
do{
// count number of notes in a measure
i = currentLine;

// assumes #NOTES ends with a semicolon
while(lines[i] != "," && lines[i] != ";"){
	i ++;	
}

// check if the notes have finished, if true, this is last loop

if(lines[i] == ";"){
	notesEnd = 1;
} else {
	notesEnd = 0;
}

notesInMeasure = i - currentLine;
// console.log(notesInMeasure);

// get current bpm
// measureNum is initially 1
// assumes bpm starts at the beginning of a measure
// assumes bpms are in chronological order
i = bpms.length - 1;
while(bpms[i][0]/4 > measureNum - 1){
	i --;
}
currentBpm = bpms[i][1];
// console.log(bpms[i][1]);

// get seconds per notes
secPerNote = 240 / currentBpm / notesInMeasure;
// console.log(secPerNote);

linesProcessed = 0;

// put notes into array with time values
if(currentTime == 0 && linesProcessed == 0){
	getNotes(currentLine);
	
	if(lineNotes.length != 0){
		for(i=0; i < lineNotes.length; i++){
			append(notes[lineNotes[i]], 0);
		}
	}
	
	linesProcessed = 1;
	currentLine ++;
	
} 
	
while(linesProcessed < notesInMeasure){
	currentTime += secPerNote;
	getNotes(currentLine);	
	
	if(lineNotes.length != 0){
		for(i=0; i < lineNotes.length; i++){
			append(notes[lineNotes[i]], currentTime);
		}
	}
	linesProcessed ++;
	currentLine ++;
}

currentLine ++;
measureNum ++;

// console.log(linesProcessed + " , " + currentLine + " , " + currentBpm);
}
while(notesEnd == 0);

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
	text("FPS:  " + round(frameRate) + " / 120", 335, 15);
	
	if(audio.ended == false){
		// begin note and receptor display loop
		millisCurrent = millis();
		timeRead = timeInitial + (millisCurrent - millisStart)/1000;
		text("Read Time = " + timeRead.toFixed(3) + "s", 0, 60);
		
		for(i=0; i < receptors.length; i++){
			
			receptors[i][0] = receptorStart[i][0] + 11*sin(timeRead + i/3.14);
			receptors[i][1] = receptorStart[i][1];
		
			if(scroll == "Down"){
				minTime = timeRead - (minNoteY - receptors[i][1])*speed/10000;
				maxTime = timeRead - (maxNoteY - receptors[i][1])*speed/10000;
			} else {
				maxTime = timeRead + (minNoteY - receptors[i][1])*speed/10000;
				minTime = timeRead + (maxNoteY - receptors[i][1])*speed/10000;
			}
			
			while(notes[i][noteLocators[i]] < maxTime){
				noteLocators[i] ++;
			}
			
			notePos[i].length = 0;
			
			// populate note positions
			j = noteLocators[i];
			
			while(notes[i][j] <= minTime){
				if(scroll == "Down"){
					notePos[i].push([receptors[i][0], receptors[i][1] - (notes[i][j] - timeRead)*10000/speed]);
				} else {
					notePos[i].push([receptors[i][0], receptors[i][1] + (notes[i][j] - timeRead)*10000/speed]);
				}
				j++;
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
				drawArrow(noteAngle, noteSize, notePos[i][j]);
				
				// if(scroll == "Down"){
					// var test = timeRead - (notePos[i][j][1] - receptors[i][1])*speed/10000;
				// } else {
					// var test = timeRead + (notePos[i][j][1] - receptors[i][1])*speed/10000;
				// }
				// text(test.toFixed(3), notePos[i][j][0] + 45, notePos[i][j][1] + 5);
				
			}
			
		}
		
		// begin controller visualization loop
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
		
		if(scroll == "Down"){
			
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
		
		if(scroll == "Down"){
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