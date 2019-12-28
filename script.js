var pivot = document.getElementById('pivot');
var pieces;

initalize();
document.addEventListener('mousedown', click);

function initalize() {
	var cube = document.getElementById('cube');
	//create divs of pieces
	for (var i = 0; i < 25; i++) {
		var div = document.getElementsByClassName('piece');
		clone = div[0].cloneNode(true);
		cube.appendChild(clone);
	}
	pieces = document.getElementsByClassName('piece');
	//align them and give ids
	for (var i = 0; id = 0, i < 26; i++) {
		var x = nextFace(i, i % 18);
		var piece = (i > 5 ? setPiece(x) + (i > 17 ? setPiece(nextFace(x, x + 2)) : '') : '');
		pieces[i].style.transform = 'rotateX(0deg)' + setPiece(i % 6) + piece;
		pieces[i].setAttribute('id', 'piece' + id);
	}
	///given a face, create an id via bit shifting plus the previous id, then add id and sticker
	function setPiece(face) {
		var colors = ['white', 'yellow', 'orange', 'red', 'blue', 'green'];
		id = id + (1 << face);
		pieces[i].children[face].appendChild(document.createElement('div')).setAttribute('class', 'sticker ' + colors[face]);
		return 'translate' + getAxis(face) + '(' + (face % 2 * 4 - 2) + 'em)';
	}
}

//perform a given ammount of swaps randomly on random faces
function scramble() {
	var ammount = document.getElementById("ammount")
	for(var i = 0; i < ammount.value; i++) {
		var x = Math.floor(Math.random() * Math.floor(6));
		swap(x, 1);
	}
}

function swap(face, isClockWise) {
	var times = isClockWise ? 6 : 18;
	for (var i = 0; i < times; i++) {

		var piece1 = getPiece(face, i / 2, i % 2);
		var piece2 = getPiece(face, i / 2 + 1, i % 2);
		for (var j = 0; j < 5; j++) {
			var sticker1 = piece1.children[j < 4 ? nextFace(face, j) : face].firstChild;
			var sticker2 = piece2.children[j < 4 ? nextFace(face, j + 1) : face].firstChild;

			if(sticker1) {
				//swap
				var className = sticker1.className;
				sticker1.className = sticker2.className,
				sticker2.className = className;
			}
		}
	}
}

function animateRotation(face, isClockWise, currentTime) {
	//which direction to turn, but at speed
	var dir = .5 * (face % 2 * 2 - 1) * (2 * isClockWise - 1)
	var tempPieces = Array(9).fill(pieces[face]).map(function (value, index) {
		return index ? getPiece(face, index / 2, index % 2) : value;
	});

	//the function that actually does the rotate
	function rotate() {
		var passed = Date.now() - currentTime;
		var style = 'rotate' + getAxis(face) + '(' + dir * passed * (passed < 200) + 'deg)';
		tempPieces.forEach(function (piece) {
			piece.style.transform = piece.style.transform.replace(/rotate.\(\S+\)/, style); //Regex that grabs the full rotate part of the transformation
		});
		if (passed >= 200) return swap(face, isClockWise);
		requestAnimationFrame(rotate);
	}
	rotate();
}

// Events
function click(click_event) {
	var regex = /-?\d+\.?\d*/g;
	var startXY = pivot.style.transform.match(regex).map(Number);
	var element = click_event.target.closest('.side');
	var face = [].indexOf.call((element || cube).parentNode.children, element);

	function mousemove(move_event) {
		//did I click on a piece, or in the white space?
		if (element) {
			var anchor = document.elementFromPoint(move_event.pageX, move_event.pageY).id.replace("anchor", "");
			if (anchor) {
				mouseup();
				//get the element of the side we're on, check if it has a sticker on it
				var isClockWise = element.parentNode.children[nextFace(face, Number(anchor) + 3)].hasChildNodes();
				animateRotation(nextFace(face, Number(anchor) + (2 * isClockWise) + 1), isClockWise, Date.now());
			}
		}
		//rotate the cube on pivot
		else {
			var positionY = move_event.pageY - click_event.pageY;
			var positionX = move_event.pageX - click_event.pageX;
			pivot.style.transform = 'rotateX(' + (startXY[0] - positionY / 2) + 'deg)' + ' rotateY(' + (startXY[1] + positionX / 2) + 'deg)';
		}
	}

	function mouseup(up_event) {
		//stop looking for mouse move or up, just for clicks
		document.body.appendChild(guides);
		document.removeEventListener('mousemove', mousemove);
		document.removeEventListener('mouseup', mouseup);
		document.addEventListener('mousedown', click);
	}

	//look for mousemove/up events
	(element || document.body).appendChild(guides);
	document.addEventListener('mousemove', mousemove);
	document.addEventListener('mouseup', mouseup);
}

//return whether the face is X, Y, or Z
function getAxis(face) {
	var code = 'X'.charCodeAt(0) + Math.floor(face / 2);
	return String.fromCharCode(code);
}

// Math formulas from Dmytro Omelyan

// The adjacent face j of current face i
function nextFace(i, j) {
	return ([2, 4, 3, 5][j % 4|0] + i % 2 * ((j|0) % 4 * 2 + 3) + 2 * (i / 2 |0)) % 6;
}

//Use bit shifting to get pieces on a face
function getPiece(face, index, corner) {
	return document.getElementById('piece' +((1 << face) + (1 << nextFace(face, index)) + (1 << nextFace(face, index + 1)) * corner));
}
