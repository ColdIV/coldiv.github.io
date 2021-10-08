import Game from './js/Game.js'
// import { test } from './js/helperFunctions.js'
//test()

let width = 800
let height = 800

let canvas = document.getElementById('game')
let ctx = canvas.getContext('2d')

let value = 0
if (window.innerWidth > window.innerHeight) {
    value = window.innerHeight
} else {
    value = window.innerWidth
}

if (value >= 800) {
    width = 800
    height = 800
} else {
    width = value
    height = value
}

canvas.width = width
canvas.height = height

let game = new Game(ctx, width, height, false)

function gameLoop(t) {
    let dt = t - prevDt

    if (game.isRunning()) {
        game.update(dt)
        game.draw()
    }

    prevDt = dt
    window.requestAnimationFrame(gameLoop)
}

// pass controls to game
document.addEventListener('keydown', (event) => {
    const keyName = event.key

    if (game.isRunning()) {
        game.keyPress(keyName)
    }
}, false)
  
document.addEventListener('keyup', (event) => {
    const keyName = event.key

    if (game.isRunning()) {
        game.keyRelease(keyName)
    }
}, false)

// mobileControls
let buttons = document.querySelectorAll('#onepath-controls button')
for (let i = 0; i < buttons.length; ++i) {
    buttons[i].addEventListener('touchstart', (e) => {
        game.keyPress(e.currentTarget.dataset.btn)
    })
    buttons[i].addEventListener('touchend', (e) => {
        game.keyRelease(e.currentTarget.dataset.btn)
    })
}

// help-button
document.querySelector('#help-button').addEventListener('click', () => {
    document.body.classList.toggle('show-help')
})

document.addEventListener('click', (e) => {
    if (!document.querySelector('.help').contains(e.target) && !document.querySelector('#help-button').contains(e.target) && document.querySelector('body.show-help')) {
        document.body.classList.toggle('show-help')
    }
})

// resize game
// window.addEventListener('resize', () => {
    // i don't care right now
// });

// Start game loop
let prevDt = 0
document.querySelector('#start-button').addEventListener('click', () => {
    document.body.classList.add('loaded')
    window.requestAnimationFrame(gameLoop)
    game.start()
})