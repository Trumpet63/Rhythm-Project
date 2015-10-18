# Rhythm-Project
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
