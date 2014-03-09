// CREATE VARS FOR HTML5 ELEMENTS
var video = document.querySelector("#vid");
var canvas = document.querySelector('#canvas');
var ctx = canvas.getContext('2d');
var localMediaStream = null;
// CREATE VARS TO HOLD WEBCAM IMAGE DATA
// AND ALSO THEN STORE THE PREVIOUS FRAME FROM THE WEBCAM
// YOU WILL COMPARE THESE TWO IMAGES TO SEE IF THERE IS ANY MOTION
var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
var prevImageData = ctx.getImageData(0,0,canvas.width,canvas.height);
// SET VARS FOR DRAWING CIRCLES
var size = 5;
var startPoint = (Math.PI/180)*0;
var endPoint = (Math.PI/180)*360;
// SET UP A TOGGLE VAR FOR WHETHER TO USE WEBCAM COLOURS OR JUST SET TO RED
var colourToggle = true;
// FUNCTION TO TRACE TO THE CONSOLE IF THE CAMERA DOES NOT WORK (pretty useful when things aren't working!)
var onCameraFail = function (e) {
    console.log('Camera did not work.', e);
};
// FUNCTION TO COMPARE TWO FRAMES
function getPixel2(imageData, prevImageData, x, y) {
    // CREATE VARS TO HOLD R,G,B,A VALUES FOR CURRENT WEBCAM FRAME
    // OFFSET WORKS OUT WHICH PIXEL TO USE FROM THE FRAME BASED ON x & y VARS WHEN IT IS CALLED INSIDE A LOOP IN motionDetect() FUNCTION
    var cr, cg, cb, ca, pr, pg, pb, pa, offset = x * 4 + y * 4 * imageData.width;
    cr = imageData.data[offset];
    cg = imageData.data[offset + 1];
    cb = imageData.data[offset + 2];
    ca = imageData.data[offset + 3];
    // CREATE VARS TO HOLD R,G,B,A VALUES FOR PREVIOUS WEBCAM FRAME
    pr = prevImageData.data[offset];
    pg = prevImageData.data[offset + 1];
    pb = prevImageData.data[offset + 2];
    pa = prevImageData.data[offset + 3];
    // THIS CALCULATES THE AMOUNT OF DIFFERENCE IN ALL THE COLOURS, EFFECTIVELY MOTION
    var diff = Math.abs(pr-cr) + Math.abs(pg-cg) + Math.abs(pb-cb);
    // CREATE AN OBJECT TO STORE THE NEW COLOR
    var obj = new Object();
    // CONDITIONAL TO DETECT IF THE AMOUNT OF MOTION IS HIGHER THAN A CERTAIN THRESHOLD.
    if(diff > settings.sensitivity) {//will replace 50 with dat gui var to let user determine sensitivity
        // FILL OBJECT WITH CURRENT COLOURS
        obj.r = cr;
        obj.g = cg;
         obj.b = cb;
    } else {
        // ...OR FILL THEM WITH A HIGH VALUE OUTSIDE THE NORMAL 255 RANGE
        // THIS ALLOWS YOU TO TEST FOR A HIGH VALUE BUT IT COULD PROBABLY BE DONE IN A DIFFERENT WAY
        obj.r = 555;
        obj.g = 555;
        obj.b = 555;
    }
    // GIVE THE OBJECT THE AMOUNT OF DIFFERENCE
    obj.d = diff;
    // RETURN THAT OBJECT FOR USE IN motionDetect() FUNCTION
    return obj;
}
// FUNCTION TO TOGGLE THE colourToggle VAR
function toggleColours() {
    colourToggle =  settings.toggle_colors;         
}
// FUNCTION TO DETECT MOTION, THAT RUNS EVERY FRAME
function motionDetect() {
    // UPDATE THE IMAGE DATA TO BE THE NEW IMAGE DATA FROM WEBCAM
    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    // WIPE THE BACKGROUND
    ctx.clearRect(0,0,canvas.width, canvas.height);
    // VARS TO LOOP THROUGH ALL THE PIXELS IN THE IMAGE
    var x, y;
    for(x = 0; x < canvas.width; x += size) {
        for(y = 0; y < canvas.height; y += size) {
            // RUN THE getPixel2 FUNCTION ON EVERY PIXEL
           var cob = getPixel2(imageData, prevImageData, x, y);
           //console.log(cob.g);
           // CHECK colourToggle STATE
           if(settings.toggle_colors == false) {
                // IF BELOW IS TRUE SET COLOURS TO BE WEBCAM IMAGE
                if(cob.g < 255) {
                    // DRAW A CIRCLE
                    ctx.fillStyle = "rgba(" + cob.r + "," + cob.g + "," + cob.b + "," + 255 + ")";
                    ctx.beginPath();
                    ctx.arc(x,y,cob.d/settings.size, startPoint, endPoint,true);//originally 10 not 50.
                    ctx.fill();
                    ctx.closePath();
                }

            } else {
                // SET COLOURS TO BE RED
                if(cob.g < 555) {
                    // DRAW A CIRCLE
                    ctx.fillStyle = settings.setcolor;//"rgba(" + 255 + "," + 0 + "," + 0 + "," + 255 + ")";
                    ctx.beginPath();
                    ctx.arc(x,y,cob.d/settings.size, startPoint, endPoint,true);//originally 10
                    ctx.fill();
                    ctx.closePath();
                }
            }
        }
    }
    // UPDATE PREVIOUS IMAGE DATA
    prevImageData = imageData;
}
// FUNCTION TO GET WEBCAM FEED AND RENDER TO CANVAS
function drawVideoAtCanvas(obj, context) {
    window.setInterval(function() { 
        // DRAW VIDEO IMAGE TO CANVAS
        context.drawImage(obj, 0, 0);
        motionDetect();
    }, 60);
}
// EVENT LISTENER FOR VIDEO PLAYING
video.addEventListener('play', function() { drawVideoAtCanvas(video, ctx) }, false);

// GET THE WEBCAM HOOKED UP
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
window.URL = window.URL || window.webkitURL;
navigator.getUserMedia({video:true}, function (stream) {
    video.src = window.URL.createObjectURL(stream);
    localMediaStream = stream;
}, onCameraFail);
