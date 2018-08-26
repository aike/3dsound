/*
 * view.js
 *
 * This program is licensed under the MIT License.
 * Copyright 2015, aike (@aike1000)
 *
 */

var gui;
var stats;
var actx = null;

$(function() {
	document.querySelector('button').addEventListener('click', function() {
		var audioctx = new AudioContext();
		actx = audioctx;
	 
		var drumsound = null;
		var basssound = null;
		var pianosound = null;
		 
		function Play() {
		    var srcdrum = audioctx.createBufferSource();
		    srcdrum.buffer = drumsound;
		    srcdrum.loop = true;
		    var pandrum = audioctx.createPanner();
	    	pandrum.panningModel = "HRTF";
			pandrum.setPosition(0, 0, 5);
		    srcdrum.connect(pandrum);
		    pandrum.connect(audioctx.destination);


		    var srcbass = audioctx.createBufferSource();
		    srcbass.buffer = basssound;
		    srcbass.loop = true;
		    var panbass = audioctx.createPanner();
	    	panbass.panningModel = "HRTF";
			panbass.setPosition(4, 2, 15);
		    srcbass.connect(panbass);
		    panbass.connect(audioctx.destination);


		    var srcpiano = audioctx.createBufferSource();
		    srcpiano.buffer = pianosound;
		    srcpiano.loop = true;
		    var panpiano = audioctx.createPanner();
	    	panpiano.panningModel = "HRTF";
			panpiano.setPosition(-3, 2, 18);
		    srcpiano.connect(panpiano);
		    panpiano.connect(audioctx.destination);

		    srcdrum.start();
		    srcbass.start();
		    srcpiano.start();
		}

		function LoadSample(ctx, url, fn) {
		    var req = new XMLHttpRequest();
		    req.open("GET", url, true);
		    req.responseType = "arraybuffer";
		    req.onload = function() {
		        if(req.response) {
		            ctx.decodeAudioData(req.response).then(function(b){fn(b);},function(){});
		        }
		    }
		    req.send();
		}

		LoadSample(audioctx, "wav/drum.wav", function(b0){
			drumsound = b0;
			LoadSample(audioctx, "wav/bass.wav", function(b1){
				basssound = b1;
				LoadSample(audioctx, "wav/piano.wav", function(b2){
					pianosound = b2;
					Play();
				});
			});
		});

	});



	document.body.style.cursor = "default";

	gui = new ThreePiece('draw', 1100, 600, true);

	var min_x = -20;
	var max_x = 20;
	var min_y = -10;
	var max_y = 10;
	var min_z = -40;
	var max_z = 25;
	var step_x = (max_x - min_x) / 10;
	var step_y = (max_y - min_y) / 10;
	var step_z = (max_z - min_z) / 10;


	var grid = {obj:'group', data:[]};

	var z;
	for (var i = 0; i <= 10; i++) {
		x = min_x + step_x * i;
		y = min_y + step_y * i;
		z = min_z + step_z * i;
		// 下 縦
		grid.data.push({obj:'line',x:x,  y:min_y,z:max_z,  tx:x, ty:min_y,tz:min_z,col:0xFFFFFF});
		// 下 横
		grid.data.push({obj:'line',x:min_x,y:min_y,z:z,tx:max_x,ty:min_y,tz:z,col:0xFFFFFF});
		// 上 縦
		grid.data.push({obj:'line',x:x,y:max_y,z:max_z,tx:x,ty:max_y,tz:min_z,col:0xFFFFFF});
		// 上 横
		grid.data.push({obj:'line',x:min_x,y:max_y,z:z,tx:max_x,ty:max_y,tz:z,col:0xFFFFFF});

		// 左 縦
		grid.data.push({obj:'line',x:min_x,y:y,z:max_z,tx:min_x,ty:y,tz:min_z,col:0xFFFFFF});
		// 左 横
		grid.data.push({obj:'line',x:min_x,y:min_y,z:z,tx:min_x,ty:max_y,tz:z,col:0xFFFFFF});

		// 右 縦
		grid.data.push({obj:'line',x:max_x,y:y,z:max_z,tx:max_x,ty:y,tz:min_z,col:0xFFFFFF});
		// 右 横
		grid.data.push({obj:'line',x:max_x,y:min_y,z:z,tx:max_x,ty:max_y,tz:z,col:0xFFFFFF});
	}

	var red = 0xBB0000;
	var white = 0xFFFFFF;

	//////////// Define Objects
	gui.define("marker", {obj:'group', data:[
		{obj:'cylinder', scale:5, h:0.05, rx:Math.PI/2, col:red},
		{obj:'circle', scale:4.5, z:0.13, col:white},
		{obj:'circle', scale:3, z:0.14, col:red},
		{obj:'circle', scale:2.7, z:0.15, col:white},
		{obj:'circle', scale:0.8, z:0.16, col:red},
	]});

	var y0 = 2;
	var z0 = 8;
	var objects = {
		scale: 0.1,
		data:[
		{obj:'texture', name:'drum', file:'images/drum.png'},
		{obj:'texture', name:'bass', file:'images/bass.png'},
		{obj:'texture', name:'piano', file:'images/piano.png'},

		{obj:'box', x:0, y:y0+0, z:z0+5, d:0.01, scale:2, tex:'drum'},
		{obj:'box', x:4, y:y0+2, z:z0+15, d:0.01, scale:2, tex:'bass'},
		{obj:'box', x:-3, y:y0+2, z:z0+18, d:0.01, scale:2, tex:'piano'}
	]};
	objects.data.push(grid);

	gui.eval(objects);

	// show frame rate
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '10px';
	stats.domElement.style.right = '15px';
	gui.element.appendChild(stats.domElement);
	gui.addHook(function() { stats.update(); });
	stats.domElement.style.display = 'none';
	///////////////////////////////////


	gui.enableMouseEvent(true);


	// resize callback
	var fitToWindow = function() {
		var w = window.innerWidth;
		var h = window.innerHeight;
		if (w / h > 11 / 6) {
			w = Math.floor(h * 11 / 6);
		} else {
			h = Math.floor(w * 6 / 11);
		}
		gui.resize(w, h);
		gui.setDirty();
	}
	fitToWindow();

	window.addEventListener('resize', function() {
		fitToWindow();
	}, false );

	var world = gui.obj('world');
	var camera = gui.obj('camera');

	///////////////////////
	var video = document.getElementById('video');

	var tracker = new tracking.ObjectTracker('face');
	tracker.setInitialScale(4);
	tracker.setStepSize(2);
	tracker.setEdgesDensity(0.1);

	tracking.track('#video', tracker, { camera: true });

	var current_y = 0;
	var current_x = 0;
	var current_l = 150;
	var lpf = 0.05;


	var len = 10;  // low pass filter
	var ax = [len];
	var ay = [len];
	var al = [len];
	var ap = 0;

	tracker.on('track', function(event) {
		if (event.data.length > 0) {
			var rect = event.data[0];

			ax[ap] = rect.x - rect.width;
			ay[ap] = rect.y - rect.height;
			al[ap] = rect.width;
			ap = (ap + 1) % len;


			current_x = 0;
			current_y = 0;
			current_l = 0;
			for (var i = 0; i < len; i++) {
				current_x += ax[i];
				current_y += ay[i];
				current_l += al[i];
			}
			current_x /= len;
			current_y /= len;
			current_l /= len;

			var cx = current_x * -0.005;
			var cy = current_y * -0.005;
			var cz = 4 - current_l * 0.01;

			camera.position.x = cx;
			camera.position.y = cy;
			camera.position.z = cz;

			camera.rotation.y = current_x * -0.002;
			camera.rotation.x = current_y * 0.002;

			if (actx != null) {
				actx.AudioListener.setPosition(cx, cy, cz);
			}
			gui.setDirty();
		}
	});
});
