function getLineInfo(line) {
    var key = line.substring(line.indexOf('#')+1, line.indexOf(':'));
    var value = line.substring(line.indexOf(':')+1, line.indexOf(';'));
    return [key, value];
}

// get the notes in a line
function getNotes(line) {
    var lineNotes = [];

    for(i=0; i < line.length; i++){
        // accept normal notes and hold heads as notes
        if(line.charAt(i) == 1 || line.charAt(i) == 2){
            lineNotes.push(i);
        }
    }
    return lineNotes;
}

// get the number of notes in a measure
// lines - array of lines in file
// start - starting line number
function getNotesInMeasure(lines, start) {
    var i = start;
    // assumes #NOTES ends with a semicolon
    while (lines[i].substring(0,1) !== "," && lines[i].substring(0,1) !== ";") {
        i++;
    }
    return i-start;
}

// get current bpm
// bpms - array containing all bpms and the beat where they start to take effect
// [[bpm, beat#]]
// b - the current beat for which we're trying to find the bpm
function getBpm(bpms, b) {
    // assumes bpms are in chronological order
    var beatBpms = [];
    var i = 0;

    while (i < bpms.length && bpms[i][0] <= b) {
        i++;
    }
    beatBpms.push(bpms[i-1]);

    while (i < bpms.length && Math.floor(bpms[i][0]) == b) {
        beatBpms.push(bpms[i]);
        i++;
    }
    
    return beatBpms;
}

// get seconds per note
// bpm - current bpm of the measure
// numNotes - number of notes in the beat
function getSecPerNote(bpm, numNotes) {
    return 60 / bpm / numNotes;
}

// Begin stepfile conversion <p></p>
// Grab stepfile info: title, artist, offset, bpms
function parseHeader(lines) {
    var title = "";
    var artist = "";
    var offset = 0;
    var bpms = [];

    var i = 0;

    var lineInfo, key, value;
    var bpmString, bpmSubstrings;

    while (lines[i].charAt(0) == "#") {
        lineInfo = getLineInfo(lines[i]);
        key = lineInfo[0];
        value = lineInfo[1];

        if (key == "TITLE") {
            title = value;
        }
        else if (key == "ARTIST") {
            artist = value;
        }
        else if (key == "OFFSET") {
            offset = parseFloat(value);
        }
        
        // assumes bpms are in one line
        else if (key == "BPMS") {
            bpmString = value;
            bpmSubstrings = bpmString.split(",");
            for (var j=0; j<bpmSubstrings.length; j++) {
                bpms[j] = bpmSubstrings[j].split("=").map(parseFloat);
            }           
            console.log(bpms);
        }
        i++;
    }
    return {
        "title" : title,
        "artist" : artist,
        "offset" : offset,
        "bpms" : bpms,
        "i" : i // current line
    };
}

function addNotes(notes, line, time) {
    var lineNotes = getNotes(line);

    for (var i = 0; i < lineNotes.length; i++) {
        notes[lineNotes[i]].push(time);
    }
    return notes;
}

// assumes bpm only changes at most 1x between notes
function parseBeat(lines, start, end, beatNum, bpms) {
    var beatFrac = 1.0/(end-start); // fraction of beat for each note
    var beatBpms = getBpm(bpms, beatNum);
    
    var lineNotes;
    var timeElapsed = 0;
    var fracElapsed = 0;

    var curBpmInd = 0;
    var nextBpmInd = (beatBpms.length > 1) ? 1 : 0;

    var notes = [[],[],[],[]];

    var i = start;
    var numNotes; // number of notes until next bpm change
    var secPerNote;

    var nextSecPerNote, beatChangeFrac;

    while (i != end) {
        secPerNote = getSecPerNote(beatBpms[curBpmInd][1], (end-start));

        // check whether the bpm changes mid-beat
        if (beatBpms.length == 1) { // if there's only one bpm
            numNotes = end-start;
        }
        else if (curBpmInd == nextBpmInd) { // if all bpms have been used
            numNotes = end - i;
        }
        else { // there is a bpm change
            numNotes = Math.floor((beatBpms[nextBpmInd][0]-beatNum-fracElapsed) / beatFrac);
        }

        // add all notes with the same bpm
        for (var j = i; j < i+numNotes; j++) {
            notes = addNotes(notes, lines[j], timeElapsed);

            timeElapsed += secPerNote;
            fracElapsed += beatFrac;
        }

        i += numNotes;

        // if the bpm changed mid-beat, parse the note on which it changed
        if (i != end) {
            nextSecPerNote = getSecPerNote(beatBpms[nextBpmInd][1], (end-start));
            beatChangeFrac = (beatBpms[nextBpmInd][0]-beatNum) - beatFrac;

            notes = addNotes(notes, lines[i], timeElapsed);

            timeElapsed += (beatChangeFrac/beatFrac * secPerNote) + ((1.0-beatChangeFrac/beatFrac) * nextSecPerNote);
            fracElapsed += beatFrac;
            i++;
        }

        // update bpm index pointers
        curBpmInd++;
        if (nextBpmInd != beatBpms.length-1) {
            nextBpmInd++;
        }
    }
    return {
        "notes" : notes,
        "timeElapsed" : timeElapsed
    };
}

function parseMeasure(lines, start, end, startTime, bpms, notes, measureNum) {
    var currentTime = startTime;
    var beatNum = measureNum*4;

    var tmpBeat, tmpNotes, timeElapsed;

    for (var i = start; i < end; i+=(end-start)/4) {
        tmpBeat = parseBeat(lines, i, i+(end-start)/4, beatNum, bpms);
        tmpNotes = tmpBeat["notes"];
        timeElapsed = tmpBeat["timeElapsed"];

        // merge tmpNotes into actual notes array
        for (var j = 0; j < tmpNotes.length; j++) {
            for (var k = 0; k < tmpNotes[j].length; k++) {
                notes[j].push(tmpNotes[j][k]+currentTime);
            }
        }
        currentTime += timeElapsed;
        beatNum++;
    }
    return {
        "notes" : notes,
        "time" : currentTime
    };
}

/**
 * @module Stepfile conversion 
 * @description Converts the stepfile into note, timing, and other information
 * @param {array} lines 
 * The stepfile (.sm) with each element of the array being a line text from the file.
 * @return {array} <p>**bpms**</p>
 * - The beats per minute of a section of music and the beat at which that bpm goes into effect, in the form [[beat, bpm], ...] for each change in bpm, with the first bpm being defined at beat 0
 * <p></p>
 * @return {array} <p>**difficulties**</p>
 * - The list of difficulties available within a stepfile, and the line number in lines[] at which the notes for that difficulty start, in the form [[difficulty, line number], ...].
 * <p></p>
 * @return {array} <p>**notes**</p>
 * - All of the notes contained in a specified difficulty, organized so that notes[0] = the set of notes for receptor 1, and notes[i][j] = the time position relative to the start of the notes (does not factor in offset at this point).
 */
function parse(lines) {
    var currentLine = 1;
    var lineNotes = [];

    // [[beat, bpm], [beat, bpm], ...]
    // var bpms = [];
    // [[difficulty, line number], [difficulty, line number], ...]
    var difficulties = [];
    var notes = [[],[],[],[]];

    /* Extract header info */
    var headerInfo = parseHeader(lines);
    var title = headerInfo["title"];
    var artist = headerInfo["artist"];
    var offset = headerInfo["offset"];
    var bpms = headerInfo["bpms"];
    var i = headerInfo["i"];

    /* Extract difficulties info */
    // this loop extracts difficulties in the form: ["difficulty", line number where notes start]
    while (i < lines.length) {
        while (lines[i] != "#NOTES:" && i < lines.length) {
            i++;
        }
        if (i+3 < lines.length) {
            i += 3;
            // encountered bizarre error where difficulties array would simply return "C6" or "C5", fixed after PC restart
            difficulties.push([lines[i].substring(5,lines[i].length-1),i+3]);
        }
    }   

    console.log(difficulties);

    currentLine = difficulties[difficulties.length-1][1]; // assume hardest difficulty for now

    // fixes issue where if at the start of a difficulty, the .sm file devotes a line to "  // measure 1", the program is expecting note information, and produces an error
    if (lines[currentLine].indexOf('measure') !== -1) {
        currentLine++;
    }

    /* Extract notes info */
    // NOTE: lines array starts counting at zero, therefore values may seem like they are off by one
    var currentTime = 0;
    var measureNum = 0;
    var tmpMeasure;

    while (lines[currentLine-1] !== ';') {
        // count number of notes in a measure
        i = currentLine;

        notesInMeasure = getNotesInMeasure(lines, i);

        tmpMeasure = parseMeasure(lines, i, i+notesInMeasure, currentTime, bpms, notes, measureNum);
        notes = tmpMeasure["notes"];
        currentTime = tmpMeasure["time"];

        currentLine += (notesInMeasure+1);
        measureNum++;
    }

    return {
        "title" : title,
        "artist" : artist,
        "offset" : offset,
        "bpms" : bpms, 
        "difficulties" : difficulties, 
        "notes" : notes
    };
}

 
 