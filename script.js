//For debugging
class Debugger {

    constructor() {
        this.reset();
    }
    
    //Start a new line
    newLine(line) {
        if (this.active) {
            this.line++;
            this.word=0;
            this.syllable=0;
            this.output("► Line " + this.line + ": " + line);
        }
    }
    //Start a new word
    newWord(word) {
        if (this.active) {
            this.word++;
            this.syllable=0;

            this.appendToWordLog("   • Word " + this.word + ": " + word);
        }
    }   
    //Start a new syllable
    newSyllable(syllable) {
        if (this.active) {
            this.syllable++;
            this.appendToSyllableLog("\n       - Syllable " + this.syllable + ": " + syllable);
            this.depth = 0;
        }
    }

    //Append custom messages
    appendToWordLog( msg ) {
        if (this.active) {
            this.wordLog += "\n" + msg;
        }
    }
    appendToSyllableLog( msg ) {
        if (this.active) {
            this.syllLog += "\n" + msg;
        }
    }
    appendToLocalLog( msg ) {
        if (this.active) {
            this.localLog += "\n" + this.M_ + msg;
        }
    }

    //Submission functions hierarchy
        // Local     submits to   Syllable
        // Syllable  submits to   Word
        // Word      submits to   Console
    submitWordLog() {
        if (this.active) {
            this.output(this.wordLog);
            this.wordLog = "";
        }
    }
    submitSyllableLog() {
        if (this.active) {
            this.appendToWordLog(this.syllLog);
            this.syllLog = "";
        }
    }
    submitLocalLog() {
        if (this.active) {
            this.appendToSyllableLog(this.localLog);
            this.localLog = "";
            this.depth--;
        }
    }

    addLocalHeader( header ) {
        this.appendToLocalLog( this.offset( header, this.depth ) );
        this.depth++;
        this.appendToSyllableLog(this.localLog);
        this.localLog = "";
    }

    //Misc functions
    offset(msg, n) {
        if (this.active) {
            while (n > 0) {
                msg = "  " + msg;
                n--;
            }
            return msg;
        }
    }
    output(msg) {
        console.log(msg);
    }
    reset() {
        console.clear();
        
        this.active = false; //Debug status

        this.line = 0;      //line number
        this.word = 0;      //word number within line
        this.syllable = 0;  //syllable number within word

        this.depth = 0;     //callstack depth, used for offset

        this.wordLog = "";  //Output log of current word cycle
        this.syllLog = "";  //Output log of current syllable cycle within word
        this.localLog = ""; //Output log of each function within syllable cycle (re-used by every function)
        
        this.M_ = "           "; //Margine used in debug messages
    }

}

//Debugging variable
const Debug = new Debugger;

//Global variables
var finalOutput = "";   //concatinated onto by concatOutput() function, holds final result
var currentWord = "";   //stores word currently being formatted

var boundChar = "*";    //character that bounds words

var syllPosition = 0;   //0: word start      1: word middle      2: word end
var linkSyllables = false;

var colorFactor = 0;    //used by concatOutput() to determine color of concatinated syllable

    //Called on window load
//Sets up button
function onLoad() {
    Bformat = document.getElementById("format");

    Bformat.addEventListener("click", formatInput, false);
}

    //Main function
//Extracts input
//Sends it to formatWord() function
//Prints output after finishing
function formatInput() {
    try {
        var Input = document.getElementById("inputarea").value;
        var lineOutput = "";
        
        var arr0 = Input.split("\n");

        Debug.reset();

        //loop through each line
        for (var line in arr0) {
            Debug.newLine(arr0[line]);
            
            var arr1 = arr0[line].split(" ");
            
            //loop through each word
            for (var word in arr1) {
                linkSyllables = false;
                Debug.newWord(arr1[word]);

                //stars to highlight first/last syllables
                formatWord( boundChar + arr1[word] + boundChar );
                lineOutput += currentWord + " ";
                currentWord = "";
                
                Debug.submitSyllableLog();
                Debug.submitWordLog();
            }
            
            lineOutput += "<br>";
            finalOutput += lineOutput;
            lineOutput = "";
        }

        document.getElementById("outputarea").innerHTML = finalOutput;

        //Value Resets
        colorFactor = 0;
        finalOutput = "";
        Input = "";
    } catch(e) {
        document.getElementById("outputarea").innerHTML = e.message;
    }
}

    //Indirectly recursive function
//Splits each word into syllables
//Sends each syllable to concatOutput()
function formatWord( word ) {
    //Start new Syllable
    var currentSyll = getCurrentSyllable( word );

    if (currentSyll !== undefined) {
        recurseWordFunc(currentSyll, word);
    }
}

//Helper function
//Indirect Recursion here with formatWord() function
function recurseWordFunc(syllable, word) {

    concatSyllable( syllable );

    if (syllPosition == 0)
        word = word.substr(syllable.length + 1);
    else 
        word = word.substr(syllable.length);

    if (syllPosition < 2) {
        formatWord(word);
    }
}


//-------------------------------------------------------------------------------//
// TODO ::  Implement "getCurrentSyllable()" to recognize characters that aren't //
//      letters and send them to "ConctatSyllable()" as seperate syllables       //
//-------------------------------------------------------------------------------//

    //Helper function
//returns next syllable to be worked with
function getCurrentSyllable( word ) {

    if ( syllPosition != 1) {
        // If start or middle of word
        if ( word[0] == boundChar ) {
            word = word.substr(1);
            setSyllPosition(0);
        } else setSyllPosition(1)
    }

    var isLong;
    
    if (checkForAl(word) == 0)
        isLong = checkNextCharIfLong( word, 0 );    //If no AL, start from first letter
    else
        isLong = checkNextCharIfLong( word, 2 );    //If AL, skip it and start from first letter after it
    var endIndex;

    if (isLong) {
        endIndex = caseLongSound( word ) + 1;
    } else {
        endIndex = caseNotLongSound( word );
    }

    if (syllPosition == 2) {
        word = word.substr(0, word.length - 1);
        return word;
    }

    if (endIndex != -1) {
        return word.substr(0, endIndex);
    }
}

function caseLongSound( word ) {

    // Sets start position in word
    var currIndex = checkForAl( word );

    // Take Al el taarif if amari
    if (currIndex == -1)
        return 2;


        //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    if ( !checkIfCharIsMharrak( word, currIndex ) ) {
        // Because substr() is exclusive, move two letters and
        // return index of letter after the syllable

        currIndex = findNextChar( word, currIndex );
        if ( (word[currIndex+1] != null) ) {
            currIndex = findNextChar( word, currIndex );    //CL
            
            if ( (word[currIndex+1] != null) )
                currIndex = findNextChar( word, currIndex );    //CLCC
            
            return currIndex;
        } else {
            return -1;
        }
    } else {
        if ( (word[currIndex+1] != null) ) {
            currIndex = findNextChar( word, currIndex );

            if ( word[currIndex+1] != "ْ" )
                return currIndex;   //CLC
            else {
                currIndex = findNextChar( word, currIndex );
                return currIndex; //CLCC
            }
        } else return -1;
    }
}

function caseNotLongSound( word ) {

    // Sets start position in word
    var currIndex = checkForAl( word );

    // Take Al el taarif if amari
    if (currIndex == -1)
        return 2;

    if ( (word[currIndex+1] != null) ) {
        currIndex = findNextChar( word, currIndex );

        if ( word[currIndex+1] != "ْ" )
            return currIndex;   //CV

        else {
            if ( (word[currIndex+1] != null) ) {
                currIndex = findNextChar( word, currIndex );

                if ( word[currIndex+1] != "ْ" )
                    return currIndex;   //CVC
                else {
                    currIndex = findNextChar( word, currIndex );
                    return currIndex; //CVCC
                }
            } else return -1;
        }
    } else return -1;
}

    //Helper function
//Checks for Al el taarif
function checkForAl( word ) {

    var Chamsia = ["ث", "ت", "ن", "ل", "ظ", "ط", "ض", "ص", "ش", "س", "ز", "ر", "ذ", "د"];

    if ( word[0] + word[1] == "ال" && syllPosition == 0) {
        if ( Chamsia.includes(word[2]) ) return 2;  // Chamsi
        else return -1;                             // Amari
    } else return 0;                                // No ال

}

    //Helper function
//Checks found character type
function checkNextCharIfLong( word, index ) {

    var charAt = findNextChar(word, index);
    var longSounds = ["ي" , "و" , "ا"];
    //var vowels = ["َ", "ُ", "ِ", "ْ", "ّ"];
    var vowels1 = ["َ", "ً", "ِ","ٍ", "ْ", "ّ", "ُ", "ٌ"]; 

    var contained = longSounds.includes(word[charAt]);
    if (!contained) return false;

    var vowel = word[charAt - 1];       //vowel on letter before long sound 

    //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    //added
    if(!vowels1.includes(vowel)) return false;
    else return true;
    //end added

    // var longVowel = vowels.includes( word[charAt + 1] );   //if the character after long sound is a 7arake
    // var long = false;

    // //if long sound doesn't have a vowel
    // if (!longVowel) {
    //     switch (word[charAt]) {
    //         case "ا":
    //         case "ى":
    //             if (vowel == "َ" || vowel == "ً")
    //             long = true;
    //             break;
    //         case "و":
    //             if (vowel == "ُ" || vowel == "ٌ")
    //             long = true;
    //             break;
    //         case "ي":
    //             if (vowel == "ِ" || vowel == "ٍ")
    //             long = true;
    //             break;
    //     }
    // }

    // return long;
}

    //Helper function
//Checks if letter has a Harake
function checkIfCharIsMharrak( word, index ) {

    var isMharrak = false;
    var Haraket = ["َ","ُ","ِ"];

    var nextChar = findNextChar(word, index);

    if ( Haraket.includes(word[nextChar - 1]) )
        isMharrak = true;

    return isMharrak;

}

    //Helper function
//Find next character after given index
function findNextChar( word, startIndex ) {
    var index = startIndex;
    var k = 1; //used to scan forward in word without changing the index
    var lettersArr = ["ا", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر", "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف", "ق", "ك", "ل", "م", "ن", "ه", "و", "ي", "ؤ", "أ", "آ", "ء", "ئ", "ة","ل","ى","إ"];

    while ( word[index + k] != undefined ) {
        if (!lettersArr.includes(word[index + k])) {
            if (word[index + k] == boundChar) {
                setSyllPosition(2);
                return index;
            } else
                k++;
        } else
            return index + k;
    }
    
    return index
}

    // Helper function
// Concatenates syllables onto output string
// Respects class (color) distribution
// Uses global variable to check color
// Expects a single syllable, of a specific type*
// *Type: letters or particle (ex: , . / ; etc..)
function concatSyllable( syllable ) {

    var lettersArr = ["ا", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر", "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف", "ق", "ك", "ل", "م", "ن", "ه", "و", "ي", "ؤ", "أ", "آ", "ء", "ئ", "ة","ل","ى","إ"];

    var isLetter;
    isLetter = lettersArr.includes(syllable[0]);

    if ( isLetter ) {
        syllable = checkForLink( syllable );

        colorSyll( colorFactor );            
        currentWord += syllable + "</span>";
        colorFactor++;

    } else {
        currentWord += "<span class='blue'>" + syllable + "</span>";
    }

        //nested function
    //specifies color of syllable only
    function colorSyll( factor ) {
        //case first word has الـ
        if (factor < 0)
            factor = 0;

        //color syllable
        if (factor % 2 == 0)
                currentWord += "<span class='red'>";
            else
                currentWord += "<span class='black'>";
    }

}

    //Helper function
//Links letters
function checkForLink( syllable ) {
    //Case الـ:
    if (syllable.indexOf("ال") != -1 && syllPosition == 0 && syllable.length == 2) {
        syllable = syllable + "ـ";
        linkSyllables = true;
    }
    else {
        var lettersNoLinkLeft = ["ا","أ","إ","و","ؤ","ر","د","ز","ذ","ى","ة","آ","ؤ"/*,"'",".",",",":",";","?","!"*/];

        if (syllPosition == 0) {            //Case: start of word
            syllable = linkAfter( syllable );
        } else if (syllPosition == 1) {     //Case: middle of word 
            syllable = linkBefore( syllable ); 
            syllable = linkAfter( syllable );          
        } else if (syllPosition == 2) {     //Case: end of word
            syllable = linkBefore( syllable );
            linkSyllables = false;
        }
    }

        //Nested Function
    function linkBefore( str ) {

        for (var i in lettersNoLinkLeft) {
            if (!linkSyllables)
                return str;
        }
        return "ـ" + str;
        
    }

        //Nested Function
    function linkAfter( str ) {
        index=0;
        // (str[index+1] != null)
        while ( index != findNextChar(str, index) )
            index=findNextChar(str, index);

        //Checking for last letter if NOT of Index1[]
        if (lettersNoLinkLeft.includes(str[index]) || syllPosition == 2) {
            linkSyllables = false;
            return str;
        } else {
            linkSyllables = true;
            return str + "ـ";
        }
    }

    return syllable;
}

function setSyllPosition(pos) {
    syllPosition = pos;
}

window.addEventListener("load", onLoad, false);