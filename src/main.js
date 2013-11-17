/**
 * Notes:
 * - Coordinates are specified as (X, Y, Z) where X and Z are horizontal and Y
 *   is vertical
 */
 

// 12 walls are hard-coded based upon no. of categories via API. (for now)
/* // 1  2  3  4  5  6  7  8  9
           [1, 1, 1, 1, 1, 1, 1, 1, 1, 1,], // 0
           [1, 1, 0, 0, 0, 0, 0, 1, 1, 1,], // 1
           [1, 1, 0, 0, 2, 0, 0, 0, 0, 1,], // 2
           [1, 0, 0, 0, 0, 2, 0, 0, 0, 1,], // 3
           [1, 0, 0, 2, 0, 0, 2, 0, 0, 1,], // 4
           [1, 0, 0, 0, 2, 0, 0, 0, 1, 1,], // 5
           [1, 1, 1, 0, 0, 0, 0, 1, 1, 1,], // 6
           [1, 1, 1, 0, 0, 1, 0, 0, 1, 1,], // 7
           [1, 1, 1, 1, 1, 1, 0, 0, 1, 1,], // 8
           [1, 1, 1, 1, 1, 1, 1, 1, 1, 1,], // 9
           [1, 1, 1, 0, 1, 1, 1, 1, 1, 1,], // 10
           [1, 1, 1, 1, 1, 1, 0, 1, 1, 0,], // 11
*/
var map = [
    // 1  2  3  4  5  6  7  8  9
           [1, 1, 1, 1, 1, 1, 1, 1, 1, 1,], // 0
           [1, 1, 0, 0, 0, 0, 0, 1, 1, 1,], // 1
           [1, 1, 0, 0, 2, 0, 0, 0, 0, 1,], // 2
           [1, 0, 0, 0, 0, 2, 0, 0, 0, 1,], // 3
           [1, 0, 0, 2, 0, 0, 2, 0, 0, 1,], // 4
           [1, 0, 0, 0, 2, 0, 0, 0, 1, 1,], // 5
           [1, 1, 1, 0, 0, 0, 0, 1, 1, 1,], // 6
           [1, 1, 1, 0, 0, 1, 0, 0, 1, 1,], // 7
           [1, 1, 1, 1, 1, 1, 0, 0, 1, 1,], // 8
           [1, 1, 1, 1, 1, 1, 1, 1, 1, 1,], // 9
           [1, 1, 1, 0, 1, 1, 1, 1, 1, 1,], // 10
           [1, 1, 1, 1, 1, 1, 0, 1, 1, 0,], // 11
    ], mapW = map.length, mapH = 0;

// Semi-constants
var WIDTH = window.innerWidth,
	HEIGHT = window.innerHeight,
	ASPECT = WIDTH / HEIGHT,
	UNITSIZE = 250,
	WALLHEIGHT = UNITSIZE / 3,
	MOVESPEED = 100,
	LOOKSPEED = 0.075,
	BULLETMOVESPEED = MOVESPEED * 5,
	NUMAI = 5,
	PROJECTILEDAMAGE = 20,
	TIP_ID = 'elem-tip';
	
// Global vars
var t = THREE;
var scene, cam, 
    renderer, controls, clock, 
    projector, model, skin, 
    vector, categories, category,
    isSmallWorld = false, activeCat = null,
    cube, materials, units;
var runAnim = true, mouse = { x: 0, y: 0 }, walls = [];
var spinner = Spin();
spinner.init('spinner');
// DOM db.
window.__db = window.__db || {};

// Initialize and run on document ready
$(document).ready(function() {
    $('body').append('<div id="intro">Welcome to MySMA Mart!</div>');
    $('#intro').css({width: WIDTH, height: HEIGHT}).one('click', function(e) {
        e.preventDefault();
        $(this).fadeOut();
        init();
        animate();
    });
});

// Setup
function init() {
	clock = new t.Clock(); // Used in render() for controls.update()
	projector = new t.Projector(); // Used in bullet projection
	scene = new t.Scene(); // Holds all objects in the canvas
	scene.fog = new t.FogExp2(0xD6F1FF, 0.0005); // color, density
	
	// Set up camera
	cam = new t.PerspectiveCamera(60, ASPECT, 1, 10000); // FOV, aspect, near, far
	cam.position.y = UNITSIZE * .2;
	scene.add(cam);
	
	// Camera moves with mouse, flies around with WASD/arrow keys
	controls = new t.FirstPersonControls(cam);
	controls.movementSpeed = MOVESPEED;
	controls.lookSpeed = LOOKSPEED;
	controls.lookVertical = false; // Temporary solution; play on flat surfaces only
	controls.noFly = true;

	// World objects
	setupScene();
	
	// Artificial Intelligence
	//setupAI();
	
	// Handle drawing as WebGL (faster than Canvas but less supported)
	renderer = new t.WebGLRenderer();
	renderer.setSize(WIDTH, HEIGHT);
	
	// Add the canvas to the document
	renderer.domElement.style.backgroundColor = '#D6F1FF'; // easier to see
	document.body.appendChild(renderer.domElement);
	
	// Track mouse position so we know where to see
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	
	// Track mouse position so we know which shelf is clicked.
	document.addEventListener( 'click', onDocumentClicked, false );
	
	
	// Display HUD
	//$('body').append('<div id="credits"><p>Developed at <a href="http://www.gnstudio.com/">GNStudio</a> by <a href="http://github.com/ArkeologeN">Hamza Waqas</a></p></div>');
	
	// Set up "hurt" flash
	$('body').append('<div id="hurt"></div>');
	$('#hurt').css({width: WIDTH, height: HEIGHT,});
}

// Helper function for browser frames
function animate() {
	if (runAnim) {
		requestAnimationFrame(animate);
	}
	render();
}

// Update and display
function render() {
    var delta = clock.getDelta(), speed = delta * BULLETMOVESPEED;
    var aispeed = delta * MOVESPEED;
    controls.update(delta); // Move camera

    // Update AI.
    for (var i = ai.length-1; i >= 0; i--) {
            var a = ai[i];
            // Move AI
            var r = Math.random();
            if (r > 0.995) {
                    a.lastRandomX = Math.random() * 2 - 1;
                    a.lastRandomZ = Math.random() * 2 - 1;
            }
            a.translateX(aispeed * a.lastRandomX);
            a.translateZ(aispeed * a.lastRandomZ);
            var c = getMapSector(a.position);
            if (c.x < 0 || c.x >= mapW || c.y < 0 || c.y >= mapH || checkWallCollision(a.position)) {
                    a.translateX(-2 * aispeed * a.lastRandomX);
                    a.translateZ(-2 * aispeed * a.lastRandomZ);
                    a.lastRandomX = Math.random() * 2 - 1;
                    a.lastRandomZ = Math.random() * 2 - 1;
            }

            var cc = getMapSector(cam.position);
            if (Date.now() > a.lastShot + 750 && distance(c.x, c.z, cc.x, cc.z) < 2) {
                    createBullet(a);
                    a.lastShot = Date.now();
            }
    }

    renderer.render(scene, cam); // Repaint
}

// Set up the objects in the world
function setupScene(subCat, catId) {
	var UNITSIZE = 250;
        units = mapW;

	// Geometry: floor
	var floor = new t.Mesh(
			new t.CubeGeometry(units * UNITSIZE, 10, units * UNITSIZE),
			new t.MeshLambertMaterial({map: t.ImageUtils.loadTexture('images/floor-3.jpg')})
	);
	//color: 0xEDCBA0,
	scene.add(floor);
	
	// Geometry: walls
	cube = new t.CubeGeometry(UNITSIZE, WALLHEIGHT, UNITSIZE);
	materials = [
		 new t.MeshLambertMaterial({/*color: 0x00CCAA,*/map: t.ImageUtils.loadTexture('images/shelf.png')}),
		 new t.MeshLambertMaterial({/*color: 0xC5EDA0,*/map: t.ImageUtils.loadTexture('images/shelf-2.png')}),
		 new t.MeshLambertMaterial({color: 0xFBEBCD}),
	 ];
	 spinner.start();
	 // If load subcategories;
	 // NO. Its categories world.
	 APIRequest.loadCategories(function(data) {
            categories = data.categories;
            window.__db.categories = categories;
            buildMap(categories.length, categories);
            spinner.stop();
	 });	
         
	// Lighting
	var directionalLight1 = new t.DirectionalLight( 0xF7EFBE, 0.7 );
	directionalLight1.position.set( 0.5, 1, 0.5 );
	scene.add( directionalLight1 );
	var directionalLight2 = new t.DirectionalLight( 0xF7EFBE, 0.8 );
	directionalLight2.position.set( -0.5, -1, -0.5 );
	scene.add( directionalLight2 );
}

/**
 * Takes the length of no. of walls to be drawn.
 * @param {type} l
 * @returns void
 */
function buildMap(l, categories, is_sub) {
    var k, j = 1;
    /*
     * for (k = 1; k <= l; k++) {
        map.push([
            1,// 0
            getRandBetween(0,1),// 1
            getRandBetween(0,1),// 2
            getRandBetween(0,2),// 3
            getRandBetween(0,2),// 4
            getRandBetween(0,2),// 5
            getRandBetween(0,2),// 6
            getRandBetween(0,1),// 7
            getRandBetween(0,1),// 8
            getRandBetween(0,1),// 9
        ]);
    }
     */
    
    if ( categories.length > 0) {
        for (var i = 0; i < categories.length; i++) {
            for (var j = 0, m = map[i].length; j < m; j++) {
                if (map[i][j]) {
                    var wall = new t.Mesh(cube, materials[map[i][j]-1])
                            , category = categories[i];
                            wall.name = category.name;
                            wall.ops = {id: category.category_id, name: category.name}
                    wall.position.x = (i - units/2) * UNITSIZE;
                    wall.position.y = WALLHEIGHT/2;
                    wall.position.z = (j - units/2) * UNITSIZE;
                    wall.is_wall = true;
                    wall.shootFire = function(e) {
                            var div = $("<div />")
                            div.attr('id',TIP_ID);
                            div.css({top: e.pageY, left: e.pageX + 20, position: 'absolute', color: '#fff'});
                            div.html(this.name);
                            
                            $("body").append(div)
                    }
                    wall.initSubCategoriesWorld = function(e) {
                        isSmallWorld = true;
                        activeCat = this.ops.id;
                        console.log("Load sub-categories!");
                        APIRequest.loadSubCategories(function(data) {
                            if ( data.success === true ) {

                                APIRequest.loadSubCategories(function(subcat) {
                                    flushScene();
                                    walls = [];
                                    scene.updateMatrixWorld();
                                    // Re-paint the world.
                                    buildMap(subcat.categories.length, subcat.categories, true);
                                    render();
                                });

                            }
                        });
                    };

                    if ( is_sub === true ) {
                        wall.initProductsOnShelf = function(evt, o) {
                            // Put the products in shelf here.
                            APIRequest.loadProducts(o.ops.id, function(data) {
                                if ( data.success === true ) {
                                    // Products found.
                                    for (var n = 1; n <= data.products.length; n++) {
                                        // Iterate n products. Put them in shelf respectively..
                                        /*
                                        * var p_cube = new t.CubeGeometry(50, 50 / 3, 50);
                                       var product = new t.Mesh(
                                               p_cube, 
                                               new t.MeshLambertMaterial({map: t.ImageUtils.loadTexture('images/box_100x100.png')})
                                           );

                                       product.position.x = (evt.clientX / WIDTH) * 2 - 1;
                                       //product.position.y = (evt.clientY / HEIGHT) * 2 + 1;
                                       //product.position.z = (j - units/2) * 100;
                                       product.position.x = (evt.pageX / j) - 20;
                                       product.position.y = evt.pageY / 2;
                                       // add product on shelf.
                                       o.add(product);
                                       scene.updateMatrixWorld();
                                       render();
                                       console.log(evt);
                                        */
                                    }
                                } else {
                                    // Failed Loading Products.
                                }
                            });
                            
                        }
                    }
                    wall.ops.has_small = is_sub === true ? false : true;
                    scene.add(wall);
                    walls.push(wall);
                }
        }
    }
    }
    /*      // 1  2  3  4  5  6  7  8  9
           [1, 1, 1, 1, 1, 1, 1, 1, 1, 1,], // 0
           [1, 1, 0, 0, 0, 0, 0, 1, 1, 1,], // 1
           [1, 1, 0, 0, 2, 0, 0, 0, 0, 1,], // 2
           [1, 0, 0, 0, 0, 2, 0, 0, 0, 1,], // 3
           [1, 0, 0, 2, 0, 0, 2, 0, 0, 1,], // 4
           [1, 0, 0, 0, 2, 0, 0, 0, 1, 1,], // 5
           [1, 1, 1, 0, 0, 0, 0, 1, 1, 1,], // 6
           [1, 1, 1, 0, 0, 1, 0, 0, 1, 1,], // 7
           [1, 1, 1, 1, 1, 1, 0, 0, 1, 1,], // 8
           [1, 1, 1, 1, 1, 1, 1, 1, 1, 1,], // 9
           [1, 1, 1, 0, 1, 1, 1, 1, 1, 1,], // 10
           [1, 1, 1, 1, 1, 1, 0, 1, 1, 0,], // 11
    */
   
    
    mapW = map.length, mapH = map[0].length;
    scene.updateMatrixWorld();
}

function flushScene() {
    var obj, i;
    for ( i = scene.children.length - 1; i >= 0 ; i -- ) {
        obj = scene.children[ i ];
        if ( obj.is_wall === true) {
            scene.remove(obj);
            obj.remove();
            scene.children.splice(i,1);
        }
    }
}

var ai = [];


/**
 * Find a path from one grid cell to another.
 *
 * @param sX
 *   Starting grid x-coordinate.
 * @param sZ
 *   Starting grid z-coordinate.
 * @param eX
 *   Ending grid x-coordinate.
 * @param eZ
 *   Ending grid z-coordinate.
 * @returns
 *   An array of coordinates including the start and end positions representing
 *   the path from the starting cell to the ending cell.
 */

function distance(x1, y1, x2, y2) {
	return Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
}

function getMapSector(v) {
	var x = Math.floor((v.x + UNITSIZE / 2) / UNITSIZE + mapW/2);
	var z = Math.floor((v.z + UNITSIZE / 2) / UNITSIZE + mapW/2);
	return {x: x, z: z};
}

/**
 * Check whether a Vector3 overlaps with a wall.
 *
 * @param v
 *   A THREE.Vector3 object representing a point in space.
 *   Passing cam.position is especially useful.
 * @returns {Boolean}
 *   true if the vector is inside a wall; false otherwise.
 */
function checkWallCollision(v) {
	var c = getMapSector(v);
	return map[c.x][c.z] > 0;
}



function onDocumentMouseMove(e) {
	e.preventDefault();
	mouse.x = (e.clientX / WIDTH) * 2 - 1;
	mouse.y = - (e.clientY / HEIGHT) * 2 + 1;
	
	vector = new t.Vector3( 
        ( e.clientX / window.innerWidth ) * 2 - 1, 
        - ( e.clientY / window.innerHeight ) * 2 + 1, 
        0.5 );
        
        // OK OK. Time to remove tooltip.
        $('#'+TIP_ID).remove();
	
	projector.unprojectVector( vector, cam );
    
    var ray = new THREE.Ray( cam.position, 
                             vector.subSelf( cam.position ).normalize() );
    var intersects = ray.intersectObjects( walls );    
    if ( intersects.length > 0 ) {
        intersects[0].object.shootFire(e);
    }
	
}

function onDocumentClicked(e) {
	e.preventDefault();
	mouse.x = (e.clientX / WIDTH) * 2 - 1;
	mouse.y = - (e.clientY / HEIGHT) * 2 + 1;
	
	vector = new t.Vector3( 
        ( e.clientX / window.innerWidth ) * 2 - 1, 
        - ( e.clientY / window.innerHeight ) * 2 + 1, 
        0.5 );
        
        // OK OK. Time to remove tooltip.
        $('#'+TIP_ID).remove();
	
	projector.unprojectVector( vector, cam );
    
    var ray = new THREE.Ray( cam.position, 
                             vector.subSelf( cam.position ).normalize() );
    var intersects = ray.intersectObjects( walls );    
    if ( intersects.length > 0 ) {
        if (intersects[0].object.ops.has_small === true) {
            // We're in parent world. Load the sub-categories world.
            intersects[0].object.initSubCategoriesWorld(e);
        } else {
            // We're in sub-categories world. Load products on shelf.
            intersects[0].object.initProductsOnShelf(e, intersects[0].object);
        }
    }
}

// Handle window resizing
$(window).resize(function() {
	WIDTH = window.innerWidth;
	HEIGHT = window.innerHeight;
	ASPECT = WIDTH / HEIGHT;
	if (cam) {
		cam.aspect = ASPECT;
		cam.updateProjectionMatrix();
	}
	if (renderer) {
		renderer.setSize(WIDTH, HEIGHT);
	}
	$('#intro, #hurt').css({width: WIDTH, height: HEIGHT,});
});

// Stop moving around when the window is unfocused (keeps my sanity!)
$(window).focus(function() {
	if (controls) controls.freeze = false;
});
$(window).blur(function() {
	if (controls) controls.freeze = true;
});

//Get a random integer between lo and hi, inclusive.
//Assumes lo and hi are integers and lo is lower than hi.
function getRandBetween(lo, hi) {
 return parseInt(Math.floor(Math.random()*(hi-lo+1))+lo, 10);
}


