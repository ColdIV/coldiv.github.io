// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 450;
canvas.height = 250;
document.body.appendChild(canvas);

var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
};
bgImage.src = "bg.png";

var heroDefaultReady = false;
var heroDefault = new Image();
heroDefault.onload = function () {
	heroDefaultReady = true;
};
heroDefault.src = "default.png";

var heroLeft_1Ready = false;
var heroLeft_1 = new Image();
heroLeft_1.onload = function () {
	heroLeft_1Ready = true;
};
heroLeft_1.src = "left_1.png";

var heroLeft_2Ready = false;
var heroLeft_2 = new Image();
heroLeft_2.onload = function () {
	heroLeft_2Ready = true;
};
heroLeft_2.src = "left_2.png";

var heroLeft_3Ready = false;
var heroLeft_3 = new Image();
heroLeft_3.onload = function () {
	heroLeft_3Ready = true;
};
heroLeft_3.src = "left_3.png";

var heroRight_1Ready = false;
var heroRight_1 = new Image();
heroRight_1.onload = function () {
	heroRight_1Ready = true;
};
heroRight_1.src = "right_1.png";

var heroRight_2Ready = false;
var heroRight_2 = new Image();
heroRight_2.onload = function () {
	heroRight_2Ready = true;
};
heroRight_2.src = "right_2.png";

var heroRight_3Ready = false;
var heroRight_3 = new Image();
heroRight_3.onload = function () {
	heroRight_3Ready = true;
};
heroRight_3.src = "right_3.png";

var heroFireReady = false;
var heroFire = new Image();
heroFire.onload = function () {
	heroFireReady = true;
};
heroFire.src = "fire.png";

var enemyReady = false;
var enemyImage = new Image();
enemyImage.onload = function () {
	enemyReady = true;
};
enemyImage.src = "ghost.png";

var bulletReady = false;
var bulletImage = new Image();
bulletImage.onload = function () {
	bulletReady = true;
};
bulletImage.src = "bullet.png";

var rocketReady = false;
var rocketImage = new Image();
rocketImage.onload = function () {
	rocketReady = true;
};
rocketImage.src = "rocket.png";

// Game objects
gameover = false;
win = false;

var hero = {
	width: 20,
	height: 40,
	x: canvas.width/2-20/2, // - half the size
	y: canvas.height-40-10, // - size - padding bottom
	speed: 120,
	shootCdMax: 40,
	shootCd: 0,
	animation: 0,
};

var enemies = [];
var bullets = [];
var stage = 0;
var explosions = [];
var clrs = ["red", "yellow", "orange", "fuchsia", "salmon", "crimson", "orangered", "greenyellow", "aqua", "gold", "gold", "gold", "gold"];
var score = 0;

// particles
var createParticle = function (ex, ey, eclr, edirection) {
	particle = {
		x: ex,
		y: ey,
		clr: eclr,
		// directions from 0 (top) to 7 (top-left) (clockwise)
		direction: edirection,
		speed: 100,
	};
	return particle;
};

// explosions
var createExplosion = function (ex, ey, elifespan = 240) {
	explosion = {
		lifespan: elifespan,
		x: ex,
		y: ey,
		particles: [],
	};
	rand = Math.floor(Math.random () * ((5) - 0)) + 2;
	for (r = 1; r < rand; r++) {
		randX = Math.floor(Math.random () * ((10) - (-10)));
		randY = Math.floor(Math.random () * ((10) - (-10)));
		for (p = 0; p < 8; p++) {
			clr = clrs[Math.floor(Math.random() * ((clrs.length-1) - 0))];
			explosion.particles.push(createParticle(ex+randX, ey+randY, clr, p));
		}
	}
	explosion.lifespan += rand*100;
	
	return explosion;
};

// enemies
var createEnemies = function (ex, ey, epos, espeed = 30, ewidth = 20, eheight = 20) {
	enemy = {
		x: ex,
		y: ey,
		width: ewidth,
		height: eheight,
		pos: epos,
		moveRight: true,
		speed: espeed,
	};
	return enemy;
};

var initializeEnemies = function (amount, width, height, speed, rows = 4) {
	for (i = 0; i < rows; i++) {
		enemies[i] = [];
	}
	
	for (i = 0; i < rows; i++) {
		for (j = 0; j < (amount / rows); j++) {
			enemies[i].push(createEnemies((j*(width/2))+width+((j)*width),((i*(height/2))+height*2+i*height), j, speed, width, height));
		}
	}
}

// shoot
var createBullet = function (bx, by, bdirection, bspeed = 60, bwidth = 5, bheight = 5, bacc = 1) {
	bullet = {
		x: bx,
		y: by,
		width: bwidth,
		height: bheight,
		direction: bdirection,
		speed: bspeed,
		acc: bacc,
	};
	return bullet;
};

// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

// move particles
var moveParticles = function (modifier) {
	for (i = 0; i < explosions.length; i++) {
		for (j = 0; explosions[i] && j < explosions[i].particles.length; j++) {
			if (explosions[i].particles[j].direction == 7 || explosions[i].particles[j].direction == 0 ||explosions[i].particles[j].direction == 1) {
				explosions[i].particles[j].y -= explosions[i].particles[j].speed * modifier;
			}
			if (explosions[i].particles[j].direction == 1 || explosions[i].particles[j].direction == 2 ||explosions[i].particles[j].direction == 3) {
				explosions[i].particles[j].x += explosions[i].particles[j].speed * modifier;
			}
			if (explosions[i].particles[j].direction == 3 || explosions[i].particles[j].direction == 4 ||explosions[i].particles[j].direction == 5) {
				explosions[i].particles[j].y += explosions[i].particles[j].speed * modifier;
			}
			if (explosions[i].particles[j].direction == 7 || explosions[i].particles[j].direction == 6 ||explosions[i].particles[j].direction == 5) {
				explosions[i].particles[j].x -= explosions[i].particles[j].speed * modifier;
			}
			explosions[i].lifespan--;
			if (explosions[i].lifespan == 0) {
				explosions.splice(i,1);
				i--;
			}
		}
	}
};

// move enemies
var moveEnemies = function (modifier) {
	moveDown = false;
	if (
		(score >= 10 && stage == 0) ||
		(score >= 20 && stage == 1) ||
		(score >= 30 && stage == 2) ||
		(score >= 35 && stage == 3) ||
		(score >= 40 && stage == 4)
	   ) {
		stage++;
		moveDown = true;
	}
	
	for (i = 0; i < enemies.length; i++) {
		for (j = 0; j < enemies[i].length; j++) {
			// shoot randomly
			if (Math.floor((Math.random() * 4000) + 1) == 1) {
				bullets.push(createBullet(enemies[i][j].x+(enemies[i][j].width/2), enemies[i][j].y+enemies[i][j].height, 'down', 60));
			}
			
			
			if (moveDown) {
				enemies[i][j].y += enemies[i][j].height;
			}
			
			if (enemies[i][j].moveRight) {
				// move
				enemies[i][j].x += enemies[i][j].speed * modifier;
				
				// sync with neighbour
				if(enemies[i][j-1]) enemies[i][j-1].x = enemies[i][j].x - ((enemies[i][j].width*1.5) * (enemies[i][j].pos-enemies[i][j-1].pos));
				
				// change direction
				if (enemies[i][j].x > canvas.width - enemies[i][j].width + enemies[i][j].speed * modifier) {
					for (k = 0; k < enemies[i].length; k++) {
						enemies[i][k].moveRight = !enemies[i][k].moveRight;
					}
				}
			}
			else {
				// move
				enemies[i][j].x -= enemies[i][j].speed * modifier;
				
				// sync with neighbour
				if(enemies[i][j-1]) enemies[i][j-1].x = enemies[i][j].x - ((enemies[i][j].width*1.5) * (enemies[i][j].pos-enemies[i][j-1].pos));
				
				// change direction
				if (enemies[i][j].x < 0) {
					for (k = 0; k < enemies[i].length; k++) {
						enemies[i][k].moveRight = !enemies[i][k].moveRight;
					}
				}
			}
		}
	}
}

var collision = function (ax,ay, awidth, aheight, bx,by, bwidth, bheight) {
	return (ax <= (bx + bwidth) && bx <= (ax + awidth) && ay <= (by + bheight) && by <= (ay + aheight));
};

// Update game objects
var update = function (modifier) {
	if (38 in keysDown || 32 in keysDown) { // Player holding up
		if (hero.shootCd <= 0) {
			bullets.push(createBullet(hero.x, hero.y+10, 'up', 100, 5, 10, 0)); // height+10 : 10 = bullet height
			hero.shootCd = hero.shootCdMax;
		}			
	}
	if (hero.shootCd > 0) hero.shootCd -= 70 * modifier;
	
	// if (40 in keysDown) { // Player holding down
		// hero.y += 1;
	// }
	if (hero.shootCd < hero.shootCdMax-10 && 37 in keysDown && hero.x-hero.speed * modifier > 0) { // Player holding left
		hero.x -= hero.speed * modifier;
		hero.animation = (hero.animation < 30) ? hero.animation + 80 * modifier : 0;
	}
	if (hero.shootCd < hero.shootCdMax-10 && 39 in keysDown && hero.x+hero.speed * modifier < canvas.width-hero.width) { // Player holding right
		hero.x += hero.speed * modifier;
		hero.animation = (hero.animation < 30) ? hero.animation + 80 * modifier : 0;
	}
	
	// move bullets
	for (i = 0; i < bullets.length; i++) {
		if (bullets[i].acc < 1) bullets[i].acc += 0.05;
		if (bullets[i].direction == 'up') bullets[i].y -= bullets[i].speed * bullets[i].acc * modifier;
		else bullets[i].y += bullets[i].speed * bullets[i].acc * modifier;
		
		// out of map
		if (bullets[i].y < 0) {
			bullets.splice(i,1);
		}
		
		// enemy hit
		for (j = 0; j < enemies.length && bullets[i] && enemies[j]; j++) {
			for (k = 0; k < enemies[j].length && bullets[i] && enemies[j][k]; k++) {
				if (
					bullets[i].direction == 'up'
					&& collision(bullets[i].x, bullets[i].y, bullets[i].width, bullets[i].height, enemies[j][k].x, enemies[j][k].y, enemies[j][k].width, enemies[j][k].height)
				   ) {
					explosions.push(createExplosion(bullets[i].x, bullets[i].y));
					bullets.splice(i,1);
					enemies[j].splice(k,1);
					score++;
				}
				else if (collision(hero.x, hero.y, hero.width, hero.height, enemies[j][k].x, enemies[j][k].y, enemies[j][k].width, enemies[j][k].height)) {
					gameover = true;
				}
			}
		}
		
		// hero hit
		if (
			bullets[i]
			&& bullets[i].direction == 'down'
			&& collision(bullets[i].x, bullets[i].y, bullets[i].width, bullets[i].height, hero.x, hero.y, hero.width, hero.height)
		  ) {
			gameover = true;
		  }
	}
	
	moveEnemies(modifier);
	moveParticles(modifier);
	
	count = 0;
	for (i = 0; i < enemies.length; i++) {
		if (enemies[i].length == 0)
			count++;
	}
	if (count == enemies.length) {
		gameover = true;
		win = true;
	}
};

var render = function (gameover) {
	//ctx.clearRect(0, 0, canvas.width, canvas.height);
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
	}
	
	// draw bullets
	for (i = 0; bulletReady && rocketReady && i < bullets.length; i++) {
		if (bullets[i].direction == 'down') {
			ctx.drawImage(bulletImage, bullets[i].x, bullets[i].y);
		}
		else {
			ctx.drawImage(rocketImage, bullets[i].x, bullets[i].y);
		}
	}
	
	// draw hero
	if (
	    heroDefaultReady &&
	    heroLeft_1Ready &&
	    heroLeft_2Ready &&
	    heroLeft_3Ready &&
	    heroRight_1Ready &&
	    heroRight_2Ready &&
	    heroRight_3Ready &&
	    heroFireReady
	    ) {
		if (hero.shootCd >= hero.shootCdMax-10) {
			ctx.drawImage(heroFire, hero.x, hero.y);
		}
		else if(37 in keysDown) {
			if (hero.animation <= 10) ctx.drawImage(heroLeft_1, hero.x, hero.y);
			else if (hero.animation <= 20) ctx.drawImage(heroLeft_2, hero.x, hero.y);
			else if (hero.animation > 20) ctx.drawImage(heroLeft_3, hero.x, hero.y);
		}
		else if(39 in keysDown) {
			if (hero.animation <= 10) ctx.drawImage(heroRight_1, hero.x, hero.y);
			else if (hero.animation <= 20) ctx.drawImage(heroRight_2, hero.x, hero.y);
			else if (hero.animation > 20) ctx.drawImage(heroRight_3, hero.x, hero.y);
		}
		else {
			ctx.drawImage(heroDefault, hero.x, hero.y);
		}
	}
	// ctx.fillStyle = "blue";
	// ctx.fillRect(hero.x, hero.y, hero.width, hero.height);
	
	// draw enemies
	for (j = 0; j < enemies.length; j++) {
		for (k = 0; k < enemies[j].length; k++) {
			if (enemyReady) {
				ctx.drawImage(enemyImage, enemies[j][k].x, enemies[j][k].y);
			}
			// ctx.fillStyle = "green";
			// ctx.fillRect(enemies[j][k].x, enemies[j][k].y, enemies[j][k].size, enemies[j][k].size);
		}
	}
	
	// explosions
	for (i = 0; i < explosions.length; i++) {
		for (j = 0; j < explosions[i].particles.length; j++) {
			ctx.fillStyle = explosions[i].particles[j].clr;
			ctx.fillRect(explosions[i].particles[j].x+2, explosions[i].particles[j].y+5, 2, 2);
		}
	}
	
	// Score
	ctx.fillStyle = "rgb(255, 255, 255)";
	ctx.font = "18px Courier";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Score: " + score, 5, 5);
	
	// Gameover
	if (gameover) {
		ctx.fillStyle = "rgba(55, 55, 55, .85)";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		
		ctx.fillStyle = "rgb(200, 200, 200)";
		ctx.font = "18px Courier";
		ctx.textAlign = "left";
		ctx.textBaseline = "top";
		ctx.fillText("Score: " + score, 5, 5);
		
		ctx.fillStyle = "rgb(200, 200, 200)";
		ctx.font = "28px Courier";
		ctx.textAlign = "center";
		ctx.textBaseline = "top";
		if (!win) ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 20);
		else ctx.fillText("You Won!", canvas.width / 2, canvas.height / 2 - 20);
		
		ctx.fillStyle = "rgb(200, 200, 200)";
		ctx.font = "16px Courier";
		ctx.textAlign = "center";
		ctx.textBaseline = "top";
		ctx.fillText("click to play again", canvas.width / 2, canvas.height / 1.5 - 20);
	}
};

var reset = function () {
	score = 0;
	enemies = [];
	explosions = [];
	bullets = [];
	initializeEnemies(44,20, 20,30);
	win = false;
	gameover = false;
	then = Date.now();
	main();
};

// The main game loop
var main = function () {
	var now = Date.now();
	var delta = now - then;

	update(delta / 1000);
	render(gameover);

	then = now;

	// Request to do this again ASAP
	if (!gameover) requestAnimationFrame(main);
	else render(gameover);
};

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
var then = Date.now();
initializeEnemies(44,20, 20,30);
canvas.addEventListener('click', function() {
	if (gameover) {
		reset();
	}
}, false);
main();