/**
CS 465 2nd Assignment
Selin Özdaş
Berke Soysal

3d cat with animation
*/

var canvas;
var gl;
var program;

var projectionMatrix;
var modelViewMatrix;

var instanceMatrix;
var infiniteloop=false;
var modelViewMatrixLoc;


var vertices = [

    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];

//Setting the Id's of body parts
var torsoId = 0;
var headId  = 1;
var head1Id = 1;
var head2Id = 10;
var leftUpperArmId = 2;
var leftLowerArmId = 3;
var rightUpperArmId = 4;
var rightLowerArmId = 5;
var leftUpperLegId = 6;
var leftLowerLegId = 7;
var rightUpperLegId = 8;
var rightLowerLegId = 9;
var tailUpperId = 11;
var tailLowerId = 12;
var mouthUpperId = 13;
var mouthLowerId = 14;
var rightEarId = 15;
var leftEarId = 16;

var colors= [];
//Flag for walk anim
var walk = false;

//Setting the height and width of body parts
var torsoHeight = 2.0;
var torsoWidth = 5.0;
var upperArmHeight = 3.0;
var lowerArmHeight = 2.0;
var upperArmWidth  = 0.5;
var lowerArmWidth  = 0.5;
var upperLegWidth  = 0.5;
var lowerLegWidth  = 0.5;
var lowerLegHeight = 2.0;
var upperLegHeight = 3.0;
var headHeight = 1.5;
var headWidth = 1.5;
var tailUpperHeight = 1.0;
var tailLowerHeight = 3.0;
var tailUpperWidth = 0.5;
var tailLowerWidth = 0.5;
var mouthUpperHeigth = 1.0;
var mouthLowerHeight = 1.0;
var mouthUpperWidth = 0.7;
var mouthLowerWidth = 0.3;

//Flags for animaton
var animationPlays= false;
var firstTime =false;
var loadNewFrames =true;
var numNodes = 16;
var jump = false;
var fall = false;

//Uniform variables
var horizontalSelect ;
var verticalSelect ;
var myHori, myVerti;
//The frame array for animation
var frames = [];

//Intial angles
var theta = [330, 0, 180, 0, 180, 0, 180, 0, 180, 0, 0, 180, 0, 90, -90];

var numVertices = 24;

var stack = [];

var figure = [];

for( var i=0; i<numNodes; i++) figure[i] = createNode(null, null, null, null);
var calculated=false;
var vBuffer;
var modelViewLoc;

var pointsArray = [];

//-------------------------------------------

function scale4(a, b, c) {
   var result = mat4();
   result[0][0] = a;
   result[1][1] = b;
   result[2][2] = c;
   return result;
}

//--------------------------------------------


function createNode(transform, render, sibling, child){
    var node = {
    transform: transform,
    render: render,
    sibling: sibling,
    child: child
    }

    return node;
}

/*
Create nodes for each body part, give angle and translation
*/
function initNodes(Id) {

    var m = mat4();

    switch(Id) {

    case torsoId:

    m = rotate(theta[torsoId], 0, 1, 0 );
    figure[torsoId] = createNode( m, torso, null, headId );
    break;

    case headId:
    case head1Id:
    case head2Id:


    m = translate(torsoWidth -2, torsoHeight+0.5*headHeight, 0.0);
  m = mult(m, rotate(theta[head1Id], 1, 0, 0))
  m = mult(m, rotate(theta[head2Id], 0, 1, 0));
    m = mult(m, translate(0.0, -0.5*headHeight, 0.0));
    figure[headId] = createNode( m, head, leftUpperArmId, mouthUpperId);
    break;


    case leftUpperArmId:

    m = translate(torsoWidth-3, 0.0, 2.0);
  m = mult(m, rotate(theta[leftUpperArmId], 0, 0, 1));
    figure[leftUpperArmId] = createNode( m, leftUpperArm, rightUpperArmId, leftLowerArmId );
    break;


  case leftLowerArmId:

  m = translate(0, 3.0, 0.0);
    m = mult(m, rotate(theta[leftLowerArmId], 0, 0, 1));
    figure[leftLowerArmId] = createNode( m, leftLowerArm, null, null );
    break;

  case leftUpperLegId:

    m = translate(-torsoWidth+3, 0.0, 2.0);
  m = mult(m , rotate(theta[leftUpperLegId], 0, 0, 1));
    figure[leftUpperLegId] = createNode( m, leftUpperLeg, rightUpperLegId, leftLowerLegId );
    break;

  case rightUpperArmId:

    m = translate(torsoWidth-3, 0.0, -2.0);
  m = mult(m, rotate(theta[rightUpperArmId], 0, 0, 1));
    figure[rightUpperArmId] = createNode( m, rightUpperArm, leftUpperLegId, rightLowerArmId );
    break;

  case rightLowerArmId:

    m =translate(0, 3.0, 0.0);
    m = mult(m, rotate(theta[rightLowerArmId], 0, 0, 1));
    figure[rightLowerArmId] = createNode( m, rightLowerArm, null, null );
    break;

    case rightUpperLegId:

   m = translate(-torsoWidth +3, 0.0, -2.0);
  m = mult(m, rotate(theta[rightUpperLegId], 0, 0, 1));
    figure[rightUpperLegId] = createNode( m, rightUpperLeg, tailUpperId, rightLowerLegId );
    break;

    case leftLowerLegId:

    m = translate(0.0, 3.0, 0.0);
    m = mult(m, rotate(theta[leftLowerLegId], 0, 0, 1));
    figure[leftLowerLegId] = createNode( m, leftLowerLeg, null, null );
    break;


    case rightLowerLegId:

    m = translate(0.0, 3.0, 0.0);
    m = mult(m, rotate(theta[rightLowerLegId], 0, 0, 1));
    figure[rightLowerLegId] = createNode( m, rightLowerLeg, null, null );
    break;

    case tailUpperId:
    m = translate(-2.5, tailUpperHeight, 0.0);
    m = mult(m, rotate(theta[tailUpperId], 1, 0, 0));
    figure[tailUpperId] = createNode( m, tailUpper, null, tailLowerId );
    break;

    case tailLowerId:
    m = translate(-0.5, 0.5, 0.0);
    m = mult(m, rotate(theta[tailLowerId], 1, 0, 0));
    figure[tailLowerId] = createNode( m, tailLower, null, null );
    break;

    case mouthUpperId:
      m = translate(torsoWidth -4.5, torsoHeight-1.5, 0.0);
      m = mult(m, rotate(theta[mouthUpperId], 0, 0, -1));
      figure[mouthUpperId] = createNode( m, mouthUpper, mouthLowerId, null );
      break;

    case mouthLowerId:
      m = translate(torsoWidth -4.5, torsoHeight-1.7, 0.0);
      m = mult(m, rotate(theta[mouthLowerId], 0, 0, 1));
      figure[mouthLowerId] = createNode( m, mouthLower, null, null );
      break;
  }
}
//Translate through each body part and apply manipulations
function traverse(Id) {

   if(Id == null) return;
   stack.push(modelViewMatrix);
   modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
   figure[Id].render();
   if(figure[Id].child != null) traverse(figure[Id].child);
    modelViewMatrix = stack.pop();
   if(figure[Id].sibling != null) traverse(figure[Id].sibling);
}
//Translate and scale for each body parts and draw them using trianglefan
function torso() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*torsoHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4( torsoWidth, torsoHeight, torsoWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function head() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * headHeight, 0.0 ));
  instanceMatrix = mult(instanceMatrix, scale4(headWidth, headHeight, headWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftUpperArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0) );
  instanceMatrix = mult(instanceMatrix, scale4(upperArmWidth, upperArmHeight, upperArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
  instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0) );
  instanceMatrix = mult(instanceMatrix, scale4(upperArmWidth, upperArmHeight, upperArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
  instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function  leftUpperLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
  instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerLeg() {

    instanceMatrix = mult(modelViewMatrix, translate( 0.0, 0.5 * lowerLegHeight, 0.0) );
  instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
  instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0) );
  instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function tailUpper() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * tailUpperHeight, 0.0) );
  instanceMatrix = mult(instanceMatrix, scale4(tailUpperWidth, tailUpperHeight, tailUpperWidth) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function tailLower() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * tailLowerHeight, 0.0) );
  instanceMatrix = mult(instanceMatrix, scale4(tailLowerWidth, tailLowerHeight, tailLowerWidth) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function mouthUpper() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * mouthUpperHeigth, 0.0) );
  instanceMatrix = mult(instanceMatrix, scale4(mouthUpperWidth, mouthUpperHeigth, mouthUpperWidth) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function mouthLower() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * mouthLowerHeight, 0.0) );
  instanceMatrix = mult(instanceMatrix, scale4(mouthLowerWidth, mouthLowerHeight, mouthLowerWidth) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

var vertexColors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];
//Crete quads and give color
function quad(a, b, c, d) {
   colors.push(vertexColors[a]);
     pointsArray.push(vertices[a]);
   colors.push(vertexColors[a]);
     pointsArray.push(vertices[b]);
  colors.push(vertexColors[a]);
     pointsArray.push(vertices[c]);
   colors.push(vertexColors[a]);
     pointsArray.push(vertices[d]);
}

//Create cube with quads
function cube(){
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}
//Save angles to the frame
function saveFrame(){
  for(i=0; i < theta.length ; i++)
    frames.push(theta[i]);
}
//Empty frames
function clearFrame(){
  frames=[];

}
//Saves frames to file
function saveFramesToFile(){
  var stringFrames= "";
  for(i=0; i< frames.length; i++)
        stringFrames= stringFrames+  "" + frames[i] + " ";
  var a = document.createElement('a');
    a.href = 'data:text/plain;base64,' + btoa(stringFrames);
    a.download = 'frames.txt';
    a.click();
}
//PreDefined walk anim
function catWalk(){
  if(walk){
  clearFrame();
  for(i = 0 ; theta.length>i ; i++){
    frames.push(theta[i]);
  }
  //Proper positions for walk
  for(j = 1; j!=2; j++){
    theta[leftUpperArmId]+=20;
    theta[leftLowerArmId]-=20;
    theta[rightUpperArmId]-=20;
    theta[rightLowerArmId]+=20;
    theta[rightUpperLegId]+=20;
    theta[rightLowerLegId]-=20;
    theta[leftUpperLegId]-=20;
    theta[leftLowerLegId]+=20;
    theta[tailUpperId]+=20;
    theta[mouthUpperId]-=15;
    theta[mouthLowerId]-=15;
    for(i = 0 ; theta.length>i ; i++){
      frames.push(theta[i]);
    }
  }
  for(j = 2; j<4; j++){
    theta[leftUpperArmId]-=20;
    theta[leftLowerArmId]+=20;
    theta[rightUpperArmId]+=20;
    theta[rightLowerArmId]-=20;
    theta[rightUpperLegId]-=20;
    theta[rightLowerLegId]+=20;
    theta[leftUpperLegId]+=20;
    theta[leftLowerLegId]-=20;
    theta[tailUpperId]-=20;
    for(i = 0 ; theta.length>i ; i++){
      frames.push(theta[i]);
    }
  }
  //Open the flags for anim
  infiniteloop = true;
  animationPlays = true;
}
//Reset pos
else {
	animationPlays = false;
	theta = [330, 0, 180, 0, 180, 0, 180, 0, 180, 0, 0, 180, 0, 90, -90];

	for(i = 0 ; theta.length>i ; i++){
		frames.push(theta[i]);
	}
   }
}
//Jump the cat, same logic with walk
function jumpBabe(){
  if(jump){
  clearFrame();
  for(i = 0 ; theta.length>i ; i++){
    frames.push(theta[i]);
  }
  for(j = 1; j!=2; j++){
    theta[leftUpperArmId]-=20;
    theta[leftLowerArmId]+=20;
    theta[rightUpperArmId]-=20;
    theta[rightLowerArmId]+=20;
    theta[rightUpperLegId]-=20;
    theta[rightLowerLegId]+=20;
    theta[leftUpperLegId]-=20;
    theta[leftLowerLegId]+=20;
    for(i = 0 ; theta.length>i ; i++){
      frames.push(theta[i]);
    }
  }
  for(j = 2; j<4; j++){
    theta[leftUpperArmId]+=20;
    theta[leftLowerArmId]-=20;
    theta[rightUpperArmId]+=20;
    theta[rightLowerArmId]-=20;
    theta[rightUpperLegId]+=20;
    theta[rightLowerLegId]-=20;
    theta[leftUpperLegId]+=20;
    theta[leftLowerLegId]-=20;
    for(i = 0 ; theta.length>i ; i++){
      frames.push(theta[i]);
    }
  }
  infiniteloop = false;
  animationPlays = true;
  for(i = 0 ; theta.length>i ; i++)
  {
    frames.push(theta[i]);
  }
}
//Fall after jump
function fallBabe(){
  if(fall){
    clearFrame();
    for(i = 0 ; theta.length>i ; i++)
    {
		frames.push(theta[i]);
	}
  for(j = 1; j!=2; j++){
    theta[leftUpperArmId]+=20;
    theta[leftLowerArmId]-=20;
    theta[rightUpperArmId]+=20;
    theta[rightLowerArmId]-=20;
    theta[rightUpperLegId]+=20;
    theta[rightLowerLegId]-=20;
    theta[leftUpperLegId]+=20;
    theta[leftLowerLegId]-=20;
    for(i = 0 ; theta.length>i ; i++){
      frames.push(theta[i]);
    }
  }
  for(j = 2; j<4; j++)
  {
    theta[leftUpperArmId]-=20;
    theta[leftLowerArmId]+=20;
    theta[rightUpperArmId]-=20;
    theta[rightLowerArmId]+=20;
    theta[rightUpperLegId]-=20;
    theta[rightLowerLegId]+=20;
    theta[leftUpperLegId]-=20;
    theta[leftLowerLegId]+=20;
    for(i = 0 ; theta.length>i ; i++)
    {
      frames.push(theta[i]);
    }
  }
  infiniteloop = false;
  animationPlays = true;
}
   
   theta = [330, 0, 180, 0, 180, 0, 180, 0, 180, 0, 0, 180, 0, 90, -90];

   for(i = 0 ; theta.length>i ; i++)
   {
     frames.push(theta[i]);
   }

}
}

//Loading frames from file with FileReader
function loadFramesFromFile(file){
  //clear current frame
  frames=[];
  //read file
  var reader = new FileReader();
  reader.onload = function (progressEvent) {
        
        window.alert(this.result);
        frameM = [];
        var thetas = this.result.split(' ');

        for (var degree = 0; degree < thetas.length-1; degree++) {
            var inttheta = parseInt(thetas[degree]);
        frames.push(inttheta);
        }
    };
    reader.readAsText(file);
  
}

var index= 0;
var counter = 0;
var difference=[];
var currentFrame = [];
function animate() {

  //get frame
  if(loadNewFrames){
    currentFrame=[];
    difference=[];
    for(j = 0; j < theta.length; j++)
    {
      currentFrame.push(frames[index]);
      index++;
    }
    loadNewFrames = false;
    calculated=false;
  }
  if(firstTime) //if first time load the initial angles
  {
    for(k = 0; k < currentFrame.length; k++){
      theta[k] = currentFrame[k];
      initNodes(k);
      loadNewFrames= true;
      firstTime=false;
    }

  }
  else
  {
    if(!calculated) //Calculate the difference between two frame
    {
      for(l = 0 ; l<theta.length; l++){
        difference[l] = currentFrame[l] - theta[l];
        if (difference [l]>180)
          difference[l]=-(360-difference[l])%360;
        if (difference[l]<-180)
          difference[l]=(360+difference[l])%360;

      }
      calculated=true;
    }
    for(l = 0 ; l<theta.length; l++){
      if(difference[l]!=0)
      {
        theta[l] = theta[l] + difference[l]/40.0; //Get closer to next frame by 1/40 each display
      }
      initNodes(l); //Recreate the nodes at new angles and pos
    }
    counter++;
  }

  if (counter>40) //Next frame
  {
    if(index>=frames.length-1) //End anim
    {
      currentFrame=[];
      if(infiniteloop==false){
        if (jump) {jump=false;fall=true;}   //If jump ends go to fall
        else if (fall) {jump=false;fall=false;}
        animationPlays = false;
        if(fall==true)
          animationPlays=true;
      }
      index=0;
      counter = 0;
      for(i =0; i< theta.length; i++)
        if(theta[i]<0)
          theta[i]=360+ theta[i];
    }
    currentFrame=[];
    loadNewFrames = true;
    counter=0;
  }
}

function moveItUp(){
  myVerti += 0.002; //Translation from vertexshader
  gl.uniform1f(verticalSelect,myVerti);
}
function moveItDown(){
  myVerti -= 0.002;
  gl.uniform1f(verticalSelect,myVerti);
}
function moveItLeft(){
  myHori += 0.001;
  gl.uniform1f(horizontalSelect,myHori);
}
window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader");

    gl.useProgram( program);

    instanceMatrix = mat4();

    projectionMatrix = ortho(-10.0,10.0,-10.0, 10.0,-10.0,10.0);
    modelViewMatrix = mat4();


    gl.uniformMatrix4fv(gl.getUniformLocation( program, "modelViewMatrix"), false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( gl.getUniformLocation( program, "projectionMatrix"), false, flatten(projectionMatrix) );
   horizontalSelect = gl.getUniformLocation(program, "horizontal");
   verticalSelect = gl.getUniformLocation(program, "vertical");
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")

    cube();

    vBuffer = gl.createBuffer();

    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

  cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );
   myHori=0;
   myVerti=0;

        document.getElementById("slider0").onchange = function() {
        theta[torsoId ] = parseInt(event.srcElement.value);
        initNodes(torsoId);
    };
        document.getElementById("slider1").onchange = function() {
        theta[head1Id] = parseInt(event.srcElement.value);
        initNodes(head1Id);
    };

    document.getElementById("slider2").onchange = function() {
         theta[leftUpperArmId] = parseInt(event.srcElement.value);
         initNodes(leftUpperArmId);
    };
    document.getElementById("slider3").onchange = function() {
         theta[leftLowerArmId] =  parseInt(event.srcElement.value);
         initNodes(leftLowerArmId);
    };

        document.getElementById("slider4").onchange = function() {
        theta[rightUpperArmId] = parseInt(event.srcElement.value);
        initNodes(rightUpperArmId);
    };
    document.getElementById("slider5").onchange = function() {
         theta[rightLowerArmId] =  parseInt(event.srcElement.value);
         initNodes(rightLowerArmId);
    };
        document.getElementById("slider6").onchange = function() {
        theta[leftUpperLegId] = parseInt(event.srcElement.value);
        initNodes(leftUpperLegId);
    };
    document.getElementById("slider7").onchange = function() {
         theta[leftLowerLegId] = parseInt(event.srcElement.value);
         initNodes(leftLowerLegId);
    };
    document.getElementById("slider8").onchange = function() {
         theta[rightUpperLegId] =  parseInt(event.srcElement.value);
         initNodes(rightUpperLegId);
    };
        document.getElementById("slider9").onchange = function() {
        theta[rightLowerLegId] = parseInt(event.srcElement.value);
        initNodes(rightLowerLegId);
    };
    document.getElementById("slider10").onchange = function() {
         theta[head2Id] = parseInt(event.srcElement.value);
         initNodes(head2Id);
    };
    document.getElementById("slider11").onchange = function() {
         theta[tailUpperId] = parseInt(event.srcElement.value);
         initNodes(tailUpperId);
    };
    document.getElementById("slider12").onchange = function() {
         theta[tailLowerId] = parseInt(event.srcElement.value);
         initNodes(tailLowerId);
    };
    document.getElementById("slider13").onchange = function() {
         theta[mouthUpperId] = parseInt(event.srcElement.value);
         initNodes(mouthUpperId);
    };
    document.getElementById("slider14").onchange = function() {
         theta[mouthLowerId] = parseInt(event.srcElement.value);
         initNodes(mouthLowerId);
    };
  document.getElementById("saveButton").onclick = function() {
    saveFrame();
  }
  document.getElementById("clearButton").onclick = function() {
    clearFrame();
  }
  document.getElementById("saveFileButton").onclick = function() {
    saveFramesToFile();
  }
  document.getElementById("loadFile").onchange = function() {
    loadFramesFromFile(this.files[0]);
  }
  document.getElementById("walkButton").onclick = function() {
    walk=!walk;
    catWalk();
  }
  document.getElementById("jumpButton").onclick = function() {
    jump =!jump;
    jumpBabe();
  }
  document.getElementById("animateButton").onclick = function() {
    if(frames.length != 0)
      animationPlays= (!animationPlays);
      loadNewFrames=true;
      firstTime= true;
  }
  document.getElementById("moveRight").onclick = function() {
    myHori += 0.1;
	//Binding with uniformshaders
    gl.uniform1f(horizontalSelect,myHori);
  }
    document.getElementById("moveLeft").onclick = function() {
    myHori -= 0.1;
    gl.uniform1f(horizontalSelect,myHori);
  }
  document.getElementById("moveUp").onclick = function() {
    myVerti += 0.1;
    gl.uniform1f(verticalSelect,myVerti);
  }
  document.getElementById("moveDown").onclick = function() {
     myVerti -= 0.1;
     gl.uniform1f(verticalSelect,myVerti);

  }

  gl.uniform1f(verticalSelect,myVerti);
    for(i=0; i<numNodes; i++) initNodes(i);

    render();
}


var render = function() {
	//animate when flag is true
    if(animationPlays)
    {
      animate();
      if(walk) moveItLeft(); //Translation with animation
      if(fall) {
        moveItDown();
        moveItLeft();
      }
      if(jump){
        moveItLeft();
        moveItUp();
      }
    }
    gl.clear( gl.COLOR_BUFFER_BIT );
    traverse(torsoId);
    requestAnimFrame(render);
}
