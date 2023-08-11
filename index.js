const express = require('express');
const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');

const CHARS = '0123456789abcdefghijklmnopqrstuvwxyz';
COLORS = ['eee4da', 'ede0c8', 'f2b179', 'f59563', 'f67c5f', 'f65e3b', 'edcf72', 'edcc61', 'edc850', 'edc53f', 'edc22e', '9100cf', '590080', '36004d', '000000'];
TEXTCOLORS = new Array()

function getFontSize(tile) {
  return (
    tile < 128 ? 55
      : tile < 1024 ? 45
        : tile < 16384 ? 35
          : 30
  );
}

const roundRect = (...args) => (function(x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  this.beginPath();
  this.moveTo(x + r, y);
  this.arcTo(x + w, y, x + w, y + h, r);
  this.arcTo(x + w, y + h, x, y + h, r);
  this.arcTo(x, y + h, x, y, r);
  this.arcTo(x, y, x + w, y, r);
  this.closePath();
  return this.fill();
}).call(...args);

const app = express();
registerFont('clearsans-bold.ttf', { family: 'Clear Sans Bold' });

app.get('/', (req, res) => {
  res.send('2048 board state images.')
});

app.get('/unavailable', (req, res) => {
  res.sendFile(__dirname + '/notfound.png');
})

let variant;

app.get('/:state/:colors/:darkMode/:variant', (req, res) => {
  variant = req.params.variant
  theme = req.params.colors
  if (theme.includes('_custom')) {
    theme = "default"
  }
  if (theme == "undefined") {
    theme = "default"
  }
  dark = req.params.darkMode
  if (dark != "true" && dark != "false") {
    dark = "false"
  }
  let css
  function getColors() {



    var request = require('request');
    request.get(`http://2048verse.jennafilean.repl.co/themes/${theme}.css`, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        var data = body;



        css = data.split('}')

        COLORS = new Array()
        TEXTCOLORS = new Array()
        for (let i = 1; i < 15; i++) {
          tile = 2 ** i
          console.log(tile)

          css.forEach((element) => {
            darkModeGood = (dark == "true" && data.includes(`.dark-mode .tile.tile-${tile} `)) ? true : false
            if (element.includes(`.tile.tile-${tile} `) && element.includes('.dark-mode') == darkModeGood && (!element.includes('@media'))) {
              COLORS.push(element.split('background: #')[1].slice(0, 6))
              TEXTCOLORS.push(element.split('color: #')[1].slice(0, 6))
            }
          })
        }

        tile = "super"
        console.log(tile)

        css.forEach((element) => {
          darkModeGood = (dark == "true" && data.includes(`.dark-mode .tile.tile-${tile} `)) ? true : false
          if (element.includes(`.tile.tile-${tile} `) && element.includes('.dark-mode') == darkModeGood && (!element.includes('@media'))) {
            COLORS.push(element.split('background: #')[1].slice(0, 6))
            TEXTCOLORS.push(element.split('color: #')[1].slice(0, 6))
          }
        })

        console.log(TEXTCOLORS)
        doStuff()


        // console.log(css)

      }
    });






  }

  let invalid = false;
  
  if (!(Number.isInteger(parseInt(variant[0])) && variant[1] == "x" && Number.isInteger(parseInt(variant[2])))) invalid = true;
  
  tileAmt = parseInt(variant[0]) * parseInt(variant[2])
  height = 500 - (4-parseInt(variant[2])) * 121
  width = 500 - (4-parseInt(variant[0])) * 121
  if (req.params.state.length != tileAmt) invalid = true;

  if (invalid == true) {
    res.sendStatus(404);
  } else {
    getColors();
  }
  

  

  function doStuff() {

    if (dark == "false") {
      boardBack = '#c0aca4'
      boardTile = '#d0c4b4'
    } else {
      boardBack = '#303030'
      boardTile = '#726F6B'
    }

    const board = [...req.params.state].map((letter) => letter === '0' ? 0 : CHARS.indexOf(letter));

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.textAlign = 'center';
    ctx.textBaseline = "middle";

    ctx.fillStyle = boardBack;
    roundRect(ctx, 0, 0, width, height, 6);

    for (let i = 0; i < tileAmt; i++) {
      if (board[i] === 0) {
        ctx.fillStyle = boardTile;
        roundRect(ctx, 15 + 121.25 * (Math.floor(i / variant[2])), 15 + 121.25 * (i % variant[2]), 106.25, 106.25, 3);
      } else {
        ctx.fillStyle = `#${COLORS[Math.min(board[i] - 1, 14)]}`;
        roundRect(ctx, 15 + 121.25 * (Math.floor(i / variant[2])), 15 + 121.25 * (i % variant[2]), 106.25, 106.25, 3);

        const tile = 2 ** board[i];
        const fontSize = getFontSize(tile);
        const fontColor = ctx.fillStyle = `#${TEXTCOLORS[Math.min(board[i] - 1, 14)]}`;

        ctx.font = `${fontSize}px "Clear Sans Bold"`;
        ctx.fillStyle = fontColor;
        ctx.fillText(tile, 68.125 + 121.25 * (Math.floor(i / variant[2])), 68.125 + 121.25 * (i % variant[2]))
      }
    }

    const buffer = canvas.toBuffer('image/png');

    res.contentType('png');
    res.end(buffer);


  }
});

app.get('*', function(req, res) {
  res.status(404).send('Invalid board state.')
});

app.listen(8080);