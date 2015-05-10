//Create json dataset download element and append it to DOM
//Credits to user "potatosalad" on SO (http://stackoverflow.com/questions/16329293/save-json-string-to-client-pc-using-html5-api)
//Assumes variable "dataset" already loaded in HTML, which will be used to creat the JSON download 
var json = JSON.stringify(dataset);
var blob = new Blob([json], {type: "application/json"});
var url  = URL.createObjectURL(blob);

var a = document.createElement('a');
a.download    = "points.json";
a.href        = url;
a.textContent = "Download JSON of Points";

document.getElementById('search_buttons').appendChild(a);