/* Create game objects ------------------------------------------------------*/
/* --------------------------------------------------------------------------*/
var myGamePiece;
var myObstacles = [];
var myGold = [];
var myHelp = [];
var myAmmo = [];
var myHome = [];
var myBlockers = [];
var myGoldCount = 0;
var myTimeCount = 0;
var myKillCount = 0;
var myScoreCount = 0;
var myResult;
var fired;


/* Prevent default key binding ----------------------------------------------*/
/* --------------------------------------------------------------------------*/
const keybinds = [
  'Space',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight'
];

window.addEventListener('keydown', (e) => {

  if (keybinds.includes(e.code)) {

    e.preventDefault();

  }

  if (e.key == 'g') {

    location.reload(); /* Press "g" to restart game */

  }

}, false);

window.addEventListener('keyup', (e) => {

  if (e.key == 'w') {

    fired = false; /* prevent continuous weapon fire on keydown */

  }

});

/* Create canvas game area --------------------------------------------------*/
/* --------------------------------------------------------------------------*/

/* Get canvas container */
const canvasContainer = document.getElementById('canvas-container');

var myGameArea = {

  canvas: document.createElement('canvas'),

  start: function () {

    this.canvas.width = 3000;
    this.canvas.height = 2400;

    this.context = this.canvas.getContext('2d');
    canvasContainer.insertBefore(this.canvas, canvasContainer.childNodes[0]);

    this.frameNo = 0;
    this.interval = setInterval(updateGameArea, 20);

    /* Bind game area keys */
    window.addEventListener('keydown', (e) => {

      myGameArea.keys = (myGameArea.keys || []);
      myGameArea.keys[e.key] = true;

    });

    window.addEventListener('keyup', (e) => {

      myGameArea.keys[e.key] = false;

    });

  },

  clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },

  stop() {
    clearInterval(this.interval);
  }
}

/* Check frame interval */
function everyinterval(n) {

  if ((myGameArea.frameNo / n) % 1 == 0) {

    return true;

  }

  return false;

}


/* Create game component ----------------------------------------------------*/
/* --------------------------------------------------------------------------*/
class component {

  constructor(width, height, color, x, y, type) {

    this.type = type;
    this.width = width;
    this.height = height;
    this.speed = 0;
    this.angle = 0;
    this.moveAngle = 0;
    this.x = x;
    this.y = y;

    this.update = () => {

      this.ctx = myGameArea.context;
      this.ctx.save();

      /* Update position with movement */
      this.ctx.translate(this.x, this.y);
      this.ctx.rotate(this.angle);

      if (this.type == 'text') {

        this.ctx.font = this.width + ' ' + this.height;
        this.ctx.fillStyle = color;
        this.ctx.fillText(this.text, this.x, this.y);

      }

      else {

        this.ctx.fillStyle = color;
        this.ctx.fillRect(

          this.width / -2,
          this.height / -2,
          this.width,
          this.height

        );

      }

      this.ctx.restore();

    }

    this.newPos = () => {

      /* Define position change with movement */
      this.angle += this.moveAngle * Math.PI / 180;
      this.x += this.speed * Math.sin(this.angle);
      this.y -= this.speed * Math.cos(this.angle);

      /* Define edge collision */
      this.hitBottom();
      this.hitTop();
      this.hitRight();
      this.hitLeft();

    }

    this.hitBottom = function () {

      var bottom = myGameArea.canvas.height - this.height;

      if (this.y > bottom) {

        this.y = bottom;

      }

    }

    this.hitTop = function () {

      if (this.y < 8) {

        this.y = 8;

      }

    }

    this.hitRight = function () {

      var rightSide = myGameArea.canvas.width - this.width;

      if (this.x > rightSide) {

        this.x = rightSide;

      }

    }

    this.hitLeft = function () {

      if (this.x < 6) {

        this.x = 6;

      }

    }

    /* Define object collision */
    this.crashWith = function (otherobj) {

      var myleft = this.x;
      var myright = this.x + (this.width);
      var mytop = this.y;
      var mybottom = this.y + (this.height);
      var otherleft = otherobj.x;
      var otherright = otherobj.x + (otherobj.width);
      var othertop = otherobj.y;
      var otherbottom = otherobj.y + (otherobj.height);
      var crash = true;

      if (

        !(mybottom > othertop) ||
        !(mytop < otherbottom) ||
        !(myright > otherleft) ||
        !(myleft < otherright)

      ) {

        crash = false;

      }

      return crash;

    }

  }

}

/* Game start ---------------------------------------------------------------*/
/* --------------------------------------------------------------------------*/
function startGame() {

  myGamePiece = new component(50, 50, 'red', 1500, 2400);

  myScoreCount = new component('50px', 'monospace', 'goldenrod', 50, 50, 'text');

  myGameArea.start();

}

/* Game loop ----------------------------------------------------------------*/
/* --------------------------------------------------------------------------*/
function updateGameArea() {

  var x, y;

  /* Handle time */
  myTimeCount = (myGameArea.frameNo / 50).toFixed(0);

  var myTimeCountSecRem = (myTimeCount % 60).toFixed(0);
  var myTimeCountMin;

  if (myTimeCountSecRem > 29) {

    myTimeCountMin = (myTimeCount / 60).toFixed(0) - 1;

  } else {

    myTimeCountMin = (myTimeCount / 60).toFixed(0);

  }

  /* Define game-over */
  function gameOver() {

    myResult = new component('50px', 'monospace', 'red', 50, 1150, 'text');

    /* Handle single kill response with correct grammar */
    if (myKillCount == 1) {

      myResult.text = `Game over. You scored ${myGoldCount}g of gold and 1 kill in ${myTimeCountMin}m ${myTimeCountSecRem}s. Press "g" to play again.`

    } else {

      myResult.text = `Game over. You scored ${myGoldCount}g of gold and ${myKillCount} kills in ${myTimeCountMin}m ${myTimeCountSecRem}s. Press "g" to play again.`

    }

    myResult.update();
    myGameArea.stop();

  }

  /* Define victory */
  function victory() {

    myResult = new component('50px', 'monospace', 'green', 50, 1150, 'text');

    if (myKillCount == 1) {

      myResult.text = `Victory! You scored ${myGoldCount}g of gold, 1 kill, and saved the princess in ${myTimeCountMin}m ${myTimeCountSecRem}s. Press "g" to play again.`

    } else {

      myResult.text = `Victory! You scored ${myGoldCount}g of gold, ${myKillCount} kills, and saved the princess in ${myTimeCountMin}m ${myTimeCountSecRem}s. Press "g" to play again.`

    }

    myResult.update();
    myGameArea.stop();

  }

  /* Define gold collision */
  for (i = 0; i < myGold.length; i++) {

    /* Remove at bottom of game area */
    if (myGold[i].y == 2350) {

      myGold.splice(i, 1);

    }

    /* Remove and add count on piece collision */
    if (myGamePiece.crashWith(myGold[i])) {

      myGold.splice(i, 1);
      myGoldCount += 1;
      return;

    }

  }

  /* Define help collision */
  for (i = 0; i < myHelp.length; i++) {

    /* Remove at bottom of game area */
    if (myHelp[i].y == 2350) {

      myHelp.splice(i, 1);

    }
    /* Remove all visible obstacles and help on piece collision */
    if (myGamePiece.crashWith(myHelp[i])) {

      myHelp = [];
      myObstacles = [];
      return;

    }

  }

  /* Define ammo collision */
  for (i = 0; i < myAmmo.length; i++) {

    if (

      /* Remove on edge collision (for projectile) */

      myAmmo[i].y < 20 ||
      myAmmo[i].y > 2350 ||
      myAmmo[i].x < 20 ||
      myAmmo[i].x > 2950

    ) {

      myAmmo.splice(i, 1);

    } else {

      /* Remove ammo and obstacle on collision and count kill */
      for (j = 0; j < myObstacles.length; j++) {

        if (myAmmo[i].crashWith(myObstacles[j])) {

          myAmmo.splice(i, 1);
          myObstacles.splice(j, 1);
          myKillCount++;
          return;

        }

      }

      /* Remove ammo and blockers on collision and count kill */
      for (k = 0; k < myBlockers.length; k++) {

        if (myAmmo[i].crashWith(myBlockers[k])) {

          myAmmo.splice(i, 1);
          myBlockers.splice(k, 1);
          myKillCount++;
          return;

        }

      }

    }

  }

  /* Define home collision */
  for (i = 0; i < myHome.length; i++) {

    /* Remove at bottom of game area */
    if (myHome[i].y == 2350) {

      myHome.splice(i, 1);

    }

    if (myGamePiece.crashWith(myHome[i])) {

      victory(); return;

    }

  }

  /* Define blockers collision */
  for (i = 0; i < myBlockers.length; i++) {

    if (myBlockers[i].y == 2350) {

      myBlockers.splice(i, 1);

    }

    if (myGamePiece.crashWith(myBlockers[i])) {

      gameOver(); return;

    }

  }

  /* Define obstacle collision */
  for (i = 0; i < myObstacles.length; i++) {

    if (myObstacles[i].y == 2350) {

      myObstacles.splice(i, 1);

    }

    if (myGamePiece.crashWith(myObstacles[i])) {

      gameOver(); return;

    }

  }

  myGameArea.clear();
  myGameArea.frameNo++;

  /* Add game automation here after frameNo addition and game clear -------- */
  if (myGameArea.frameNo == 1 || everyinterval(10)) {

    x = Math.floor(Math.random()*myGameArea.canvas.width);
    y = 0;

    myObstacles.push(new component(50, 50, 'gray', x, y));

  }

  if (myGameArea.frameNo == 1 || everyinterval(100)) {

    x = Math.floor(Math.random()*myGameArea.canvas.width);
    y = 0;

    myGold.push(new component(50, 50, 'goldenrod', x, y));

  }

  if (myGameArea.frameNo == 1 || everyinterval(1000)) {

    x = Math.floor(Math.random()*myGameArea.canvas.width);
    y = 0;

    myHelp.push(new component(50, 50, 'royalblue', x, y));

  }

  if (myGameArea.frameNo == 500 || everyinterval(5000)) {

    y = 100;
    x = Math.floor(Math.random()*myGameArea.canvas.width);

    myHome.push(new component(50, 50, 'hotpink', x, y));

    myBlockers.push(new component(50, 50, 'gray', (x + 100), y));
    myBlockers.push(new component(50, 50, 'gray', (x - 100), y));

    myBlockers.push(new component(50, 50, 'gray', x, (y + 100)));
    myBlockers.push(new component(50, 50, 'gray', x, (y - 100)));
  
    myBlockers.push(new component(50, 50, 'gray', (x + 100), (y + 100)));
    myBlockers.push(new component(50, 50, 'gray', (x + 100), (y - 100)));
    myBlockers.push(new component(50, 50, 'gray', (x - 100), (y + 100)));
    myBlockers.push(new component(50, 50, 'gray', (x - 100), (y - 100)));
  
  }

  for (i = 0; i < myObstacles.length; i++) {

    myObstacles[i].y++;
    myObstacles[i].newPos();
    myObstacles[i].update();

  }

  for (i = 0; i < myGold.length; i++) {

    myGold[i].y++;
    myGold[i].newPos();
    myGold[i].update();

  }

  for (i = 0; i < myHelp.length; i++) {

    myHelp[i].y++;
    myHelp[i].newPos();
    myHelp[i].update();

  }

  for (i = 0; i < myAmmo.length; i++) {


    myAmmo[i].newPos();
    myAmmo[i].update();

  }

  for (i = 0; i < myHome.length; i++) {

    myHome[i].y += 0.5;
    myHome[i].newPos();
    myHome[i].update();

  }

  for (i = 0; i < myBlockers.length; i++) {

    myBlockers[i].y += 0.5;
    myBlockers[i].newPos();
    myBlockers[i].update();

  }

  myScoreCount.text = `Gold ${myGoldCount}g Kills ${myKillCount} Time ${myTimeCountMin}m ${myTimeCountSecRem}s`;
  myScoreCount.update();

  myGamePiece.moveAngle *= 0.9;
  myGamePiece.newPos();
  myGamePiece.update();

  if (myGameArea.keys && myGameArea.keys['ArrowLeft']) {

    myGamePiece.moveAngle += -0.3;
    myGamePiece.speed *= 0.98;

  }

  if (myGameArea.keys && myGameArea.keys['ArrowRight']) {

    myGamePiece.moveAngle += 0.3;
    myGamePiece.speed *= 0.98;

  }

  if (myGameArea.keys && myGameArea.keys['ArrowUp']) {

    myGamePiece.speed += 0.2;

  } else {

    myGamePiece.speed *= 1;

  }

  if (myGameArea.keys && myGameArea.keys['ArrowDown']) {

    myGamePiece.speed += -0.2;

  }

  if (myGameArea.keys && myGameArea.keys['q']) {

    myGamePiece.speed = 0;

  }

  if (myGameArea.keys && myGameArea.keys[' ']) {

    myGamePiece.speed *= 0.95;

  }

  if (myGameArea.keys && myGameArea.keys['w']) {

    var x = myGamePiece.x;
    var y = myGamePiece.y;

    if (!fired && myGoldCount > 0) {

      myAmmo.push(new component(25, 25, 'maroon', x, y));
      myGoldCount -= 1;
      fired = true;

    }

  }

  myGamePiece.newPos();
  myGamePiece.update();

}