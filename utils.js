var gl;
var flatShaderProgram;
var gouraudShaderProgram;
var phongShaderProgram;
var models = {};

var mvMatrix = mat4.create();
var pMatrix  = mat4.create();

var modelVertexPositionBuffer;
var modelVertexNormalBuffer;
var modelVertexFrontColorBuffer;

var startTime = new Date().getTime();

let shaderSourceCode = {
    "flat": {
        "vertex": flatVertex, 
        "fragment": flatFragment 
    },
    "gouraud": { 
        "vertex": gouraudVertex, 
        "fragment": gouraudFragment 
    },
    "phong": { 
        "vertex": phongVertex, 
        "fragment": phongFragment 
    },
}

let shaderPrograms = {
    "Flat" : flatShaderProgram,
    "Gouraud" : gouraudShaderProgram,
    "Phong" : phongShaderProgram
}

let config = {
    "light":[
        { // light 1
            position: [10.0, 1.0, 1.0],
            color: [1.0, 1.0, 1.0]
        },
        { // light 2
            position: [-2.0, 15.0, 3.0],
            color: [1.0, 1.0, 1.0]
        },
        { // light 3
            position: [10.0, 1.0, 20],
            color: [1.0, 1.0, 1.0]
        },
    ],
    
    "item": [
        { // item1
            shader: 'Flat', 
            location: [-40, 0 ,-80], 
            scaling:{
                default: [1.0, 1.0, 1.0], 
                ratio: [1.0, 1.0, 1.0]
            },
            shear: 90, 
            rotation:{ 
                degree: 35, 
                lastTime: new Date().getTime(), 
                lastAngle: 0, 
                direction: [0, 1, 0] }, 
            Ka: 0.1, 
            Kd: 0.1, 
            Ks: 0.1, 
            Shininess: 5, 
            model: "Teapot",
            autoRotate: true, 
            crazy: false,
            vibing: false,
        },
        { // item2
            shader: 'Gouraud', 
            location: [0, 0 ,-80], 
            scaling:{
                default: [1.0, 1.0, 1.0], 
                ratio: [1.0, 1.0, 1.0]
            }, 
            shear: 90, 
            rotation:{ 
                degree: 35, 
                lastTime: new Date().getTime(), 
                lastAngle: 0, 
                direction: [0, 1, 0] }, 
            Ka: 0.1, 
            Kd: 0.1, 
            Ks: 0.1, 
            Shininess: 5, 
            model: "Teapot",
            autoRotate: true, 
            crazy: false,
            vibing: false,            
        },
        { // item3
            shader: 'Phong', 
            location: [40, 0 ,-80], 
            scaling:{
                default: [1.0, 1.0, 1.0], 
                ratio: [1.0, 1.0, 1.0]
            }, 
            shear: 90, 
            rotation:{ 
                degree: 35, 
                lastTime: new Date().getTime(), 
                lastAngle: 0, 
                direction: [0, 1, 0] }, 
            Ka: 0.1, 
            Kd: 0.1, 
            Ks: 0.1, 
            Shininess: 5, 
            model: "Teapot",
            autoRotate: true, 
            crazy: false,
            vibing: false,
        },
    ]
}

function initGL(canvas) {
    try {
        gl = canvas.getContext("webgl") ||canvas.getContext("experimental-webgl");
        gl.getExtension('OES_standard_derivatives');
        gl.viewportWidth  = canvas.width;
        gl.viewportHeight = canvas.height;
    } 
    catch (e) {
        console.log("error catch");
        console.log(e);
    }

    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");

    }
}

function getShader(gl, shaderCode, type) {

    if (!shaderCode) 
        return null;

    var shader;
    if (type == "fragment") 
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    else if (type == "vertex") 
        shader = gl.createShader(gl.VERTEX_SHADER);
    else 
        return null;
    

    gl.shaderSource(shader, shaderCode);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initShader(type) {
    var fragmentShader = getShader(gl, shaderSourceCode[type].fragment, "fragment");
    var vertexShader   = getShader(gl, shaderSourceCode[type].vertex, "vertex");

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
        alert("Could not initialise shaders");
    

    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    shaderProgram.vertexFrontColorAttribute = gl.getAttribLocation(shaderProgram, "aFrontColor");
    gl.enableVertexAttribArray(shaderProgram.vertexFrontColorAttribute);
    shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
    gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

    // light color
    shaderProgram.lightColor1 = gl.getUniformLocation(shaderProgram, "lightColor1");
    shaderProgram.lightColor2 = gl.getUniformLocation(shaderProgram, "lightColor2");
    shaderProgram.lightColor3 = gl.getUniformLocation(shaderProgram, "lightColor3");
    
    // light position
    shaderProgram.lightPosition1 = gl.getUniformLocation(shaderProgram, "lightPosition1");
    shaderProgram.lightPosition2 = gl.getUniformLocation(shaderProgram, "lightPosition2");
    shaderProgram.lightPosition3 = gl.getUniformLocation(shaderProgram, "lightPosition3");

    // light attribute
    shaderProgram.Ka  = gl.getUniformLocation(shaderProgram, "Ka");
    shaderProgram.Kd  = gl.getUniformLocation(shaderProgram, "Kd");
    shaderProgram.Ks  = gl.getUniformLocation(shaderProgram, "Ks");
    shaderProgram.Shininess  = gl.getUniformLocation(shaderProgram, "Shininess");

    shaderProgram.pMatrixUniform  = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");

    return shaderProgram;
}

function setMatrixUniforms(shaderProgram) {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

function handleLoadedModel(modelData, name) {
    modelVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelData.vertexPositions), gl.STATIC_DRAW);
    modelVertexPositionBuffer.itemSize = 3;
    modelVertexPositionBuffer.numItems = modelData.vertexPositions.length / 3;

    modelVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelData.vertexNormals), gl.STATIC_DRAW);
    modelVertexNormalBuffer.itemSize = 3;
    modelVertexNormalBuffer.numItems = modelData.vertexNormals.length / 3;

    modelVertexFrontColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexFrontColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelData.vertexFrontcolors), gl.STATIC_DRAW);
    modelVertexFrontColorBuffer.itemSize = 3;
    modelVertexFrontColorBuffer.numItems = modelData.vertexFrontcolors.length / 3;

    models[name] = {
        modelVertexPositionBuffer: modelVertexPositionBuffer,
        modelVertexNormalBuffer: modelVertexNormalBuffer,
        modelVertexFrontColorBuffer: modelVertexFrontColorBuffer
    }
}

function loadModel(model) {
    if(model == 'Hide') 
        return;
    var request = new XMLHttpRequest();
    request.open("GET", "./model/" + model + ".json");
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            handleLoadedModel(JSON.parse(request.responseText), model);
        }
    }
    request.send();
}

/*
    TODO HERE:
    add two or more objects showing on the canvas
    (it needs at least three objects showing at the same time)
*/

function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Setup Projection Matrix
    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 200.0, pMatrix);
    
    for(let i = 0; i < 3; i++){

        let item = config.item[i]
        let shaderProgram = shaderPrograms[item.shader];

        if(!models.hasOwnProperty(item.model)){
            continue;
        }

        
        let modelVertexPositionBuffer = models[item.model].modelVertexPositionBuffer;
        let modelVertexNormalBuffer = models[item.model].modelVertexNormalBuffer;
        let modelVertexFrontColorBuffer = models[item.model].modelVertexFrontColorBuffer;

        
        // Setup Model-View Matrix
        mat4.identity(mvMatrix);

        // translation
        mat4.translate(mvMatrix, item.location);

        // rotation
        if(item.model !== "Teapot")
            mat4.rotate(mvMatrix, degToRad(90), [-1.0, 0.0, 0.0]);

        if(item.autoRotate){
            let now = new Date().getTime();
            item.rotation.lastAngle += item.rotation.degree * ( (now - item.rotation.lastTime) / 1000);
            if(!item.crazy)
                item.rotation.lastTime = now;
            mat4.rotate(mvMatrix, degToRad(item.rotation.lastAngle), item.rotation.direction);
        }
        else
            mat4.rotate(mvMatrix, degToRad(item.rotation.degree), item.rotation.direction);

        // scaling
        let ratio = item.scaling.ratio.slice();
        let scaling = item.scaling.default.slice();

        if(item.vibing){
            let now = new Date().getTime() % 200;
            if(now > 100)   
                ratio = ratio.map( a => a*1.2);
        }
        for(var d=0 ; d<3 ; d++)
            scaling[d] *= ratio[d]

        mat4.scale(mvMatrix, scaling);

        // shearing
        let shearMatrix = mat4.create();
        mat4.identity(shearMatrix);
        shearMatrix[4] = 1 / Math.tan(degToRad(item.shear));
        mat4.multiply(mvMatrix, shearMatrix, mvMatrix); 

        // original shader
        gl.useProgram(shaderProgram);
        setMatrixUniforms(shaderProgram);

        // Setup model position data
        gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, modelVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        // Setup model front color data
        gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexFrontColorBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexFrontColorAttribute, modelVertexFrontColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
        
        // Setup model vertex normal data
        gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, modelVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

        // Setup light color
        gl.uniform3fv(shaderProgram.lightColor1, config['light'][0].color);
        gl.uniform3fv(shaderProgram.lightColor2, config['light'][1].color);
        gl.uniform3fv(shaderProgram.lightColor3, config['light'][2].color);
        gl.uniform4fv(shaderProgram.lightPosition1, config['light'][0].position.concat([1.0]));
        gl.uniform4fv(shaderProgram.lightPosition2, config['light'][1].position.concat([1.0]));
        gl.uniform4fv(shaderProgram.lightPosition3, config['light'][2].position.concat([1.0]));

        // Setup constant
        gl.uniform1f(shaderProgram.Ka, config.item[i].Ka);
        gl.uniform1f(shaderProgram.Kd, config.item[i].Kd);
        gl.uniform1f(shaderProgram.Ks, config.item[i].Ks);
        gl.uniform1f(shaderProgram.Shininess, config.item[i].Shininess);

        gl.drawArrays(gl.TRIANGLES, 0, modelVertexPositionBuffer.numItems);
    }
}

function tick() {
    requestAnimFrame(tick);
    drawScene();
}

function webGLStart() {
    var canvas = document.getElementById("ICG-canvas");
    initGL(canvas);
    shaderPrograms.Flat = initShader("flat");
    shaderPrograms.Gouraud = initShader("gouraud");
    shaderPrograms.Phong = initShader("phong");

    loadModel('Teapot');
    loadModel('Kangaroo');
    loadModel('Easter');

    gl.clearColor(0.0, 0.2, 0.2, 1.0);
    gl.enable(gl.DEPTH_TEST);

    tick();
}
