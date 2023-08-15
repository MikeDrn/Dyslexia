//HANDLES PAGE FUNCTIONS, BUTTONS, etc...

var Bclear = document.getElementById("clear");
var Bcopy = document.getElementById("copy");

    //Called on window load
function onLoad() {
    Bclear.addEventListener("click", clearInput, false);
    Bcopy.addEventListener("click", copyOutput, false);
}



    //Clear button
function clearInput() {
    document.getElementById("inputarea").value = "";
}

window.addEventListener("load", onLoad, false);