# Rhythm-Project

How to Use This Program:
(1) Get a .sm file
(2) Get an audio file
(3) In code.js, edit the line: String lines [] = loadStrings("FILEPATH.sm"); to include your file.
(4) In code.js, edit the line: var audio = new Audio("FILEPATH.abc"); to include your file.
(5) Open main.html in your browser. Due to Chrome and IE security protocols, if you're running it locally, you need to open it in Firefox.
(6) There are several options:
(.) Change your scroll direction by changing line 20 in code.js, either "Up" or "Down"
(.) Change your offset by changing the value of manualOffset on 68 in code.js
(.) Turn the controller visualization on or off by changing showController on line 21 to either true or false

Technical Overview

Parses .sm file:
(1) Converts text into an array of strings, one string per line of the text file
(2) Finds title, artist, offset, and bpms
(3) Finds the line number where the notes for each difficulty starts, and associates the names of the difficulties
(4) Using the bpm and information about the measure, associates each note with a time position

Displays notes:
(1) Based on the size of the display region, scroll speed, and receptor position, determines the range of times that can be displayed for a frame
(2) Populates an array with the positions of the notes to be displayed on screen
(3) Draws receptors and notes

Displays controller visualization:
(1) Finds next note
(2) Based on a set of rules, determine the point to which the hit-circle must move next
(3) Determines distance of the nearest note from receptors
(4) Determines the percent of the distance to the receptors that the note has traveled since it was first found
(5) Display the hit circle based on that percent and its destination and origination points
