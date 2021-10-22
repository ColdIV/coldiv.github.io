import { drawCircle, getLevel } from './helperFunctions.js'

export default class Game {
	constructor(ctx, width, height, debug) {
		this.ctx = ctx
		this.running = false

		this.width = width
		this.height = height
		
		// handle user input
		this.input = [false, false, false, false, false] // UP, LEFT, DOWN, RIGHT, SPACE

		
		// clones / player path / level
		this.path = []
		this.clones = []
		this.level = []
		this.currentLevel = 0
		this.step = 60
		
		// player
		this.player = {
			maxClones: 2,
			clonesUsed: 0,
			movesUsed: 0,
			x: 0,
			y: 0,
			size: 25,
		}
		
		this.player.x = 0
		this.player.y = 0

		// center
		this.center = {
			x: this.width / 2,
			y: this.height / 2
		}

		this.fontSize = 16

		// initial resize
		// should change positions / sizes according to the document size
		this.resize(width, height)

		// DEBUG
		this.DEBUG = debug === undefined ? false : debug
	}

	start () {
		this.running = true
		this.level = getLevel(this.currentLevel)
		this.activeLevel = this.level
	}

	isRunning () {
		return this.running
	}

	reset () {
		this.player.x = 0
		this.player.y = 0
		this.player.movesUsed = 0
		this.player.clonesUsed = 0
		this.clones = []
		this.path = []
		this.level = this.activeLevel
	}

	resize (width, height, scale = 1) {
		let value = Math.min(width, height)
		scale = Math.min(value / 800, 1)

		// i have no clue what i am doing
		// but this seems to work for mobile and desktop
		if (value < 500) {
			this.player.size *= scale
			this.step *= scale
			this.fontSize *= scale
			this.fontSize = Math.max(this.fontSize, 14)
		}
	}

	blockCollision (x, y) {
		for (let i = 0; i < this.level.blocks.length; ++i) {
			if (this.level.blocks[i].x === x 
			 && this.level.blocks[i].y === y) return true
		}
		return false
	}

	goalCollision (x, y, gx, gy) {
		if (this.DEBUG) console.log(x, y, this.center.x + gx * this.step, this.center.y + gy * this.step);
		if (gx === x && gy === y) {
			return true
		}
		return false
	}

	keyPress (key) {
		if (this.level.won) {
			this.activeLevel = getLevel(this.currentLevel)
			this.reset()
			return
		}

		if (key === 'r') {
			this.reset()
		}

		if (key === 't') {
			this.currentLevel++
			this.activeLevel = getLevel(this.currentLevel)
			this.reset()
		}

		if (this.player.movesUsed >= this.level.maxSteps) {
			// this.running = false
			return
		}

		if (key === 'ArrowUp' && !this.input[0]) {
			this.player.movesUsed++
			if (!this.blockCollision(this.player.x, this.player.y - 1)) {
				this.player.y -= 1
			}
			this.input[0] = true
			this.path.push(0)
		} 

		if (key === 'ArrowLeft' && !this.input[1]) {
			this.player.movesUsed++
			if (!this.blockCollision(this.player.x - 1, this.player.y)) {
				this.player.x -= 1
			}
			this.input[1] = true
			this.path.push(1)
		}
		if (key === 'ArrowDown' && !this.input[2]) {
			this.player.movesUsed++
			if (!this.blockCollision(this.player.x, this.player.y + 1)) {
				this.player.y += 1
			}
			this.input[2] = true
			this.path.push(2)
		}
		if (key === 'ArrowRight' && !this.input[3]) {
			this.player.movesUsed++
			if (!this.blockCollision(this.player.x + 1, this.player.y)) {
				this.player.x += 1
			}
			this.input[3] = true
			this.path.push(3)
		}
		if (key === ' ' && !this.input[4] && this.player.clonesUsed < this.player.maxClones) {
			// create clone
			this.player.clonesUsed++
			this.input[4] = true
			this.clones.push({
				x: this.player.x,
				y: this.player.y,
				index: 0
			})
		}

		// Move Clones
		if (key === 'ArrowUp' ||
			key === 'ArrowLeft' ||
			key === 'ArrowDown' ||
			key === 'ArrowRight') {
			for (let i = 0; i < this.clones.length; ++i) {
				if (this.path[this.clones[i].index] === 0) {
					if (!this.blockCollision(this.clones[i].x, this.clones[i].y - 1)) {
						this.clones[i].y -= 1
					}
				} else if (this.path[this.clones[i].index] === 1) {
					if (!this.blockCollision(this.clones[i].x - 1, this.clones[i].y)) {
						this.clones[i].x -= 1
					}
				} else if (this.path[this.clones[i].index] === 2) {
					if (!this.blockCollision(this.clones[i].x, this.clones[i].y + 1)) {
						this.clones[i].y += 1
					}
				} else if (this.path[this.clones[i].index] === 3) {
					if (!this.blockCollision(this.clones[i].x + 1, this.clones[i].y)) {
						this.clones[i].x += 1
					}
				}
				this.clones[i].index++
			}
		}

		// Check goals
		let goalsActive = 0
		for (let i = 0; i < this.level.goals.length; ++i) {
			let tmpSkip = false
			if (this.goalCollision(this.player.x, this.player.y, this.level.goals[i].x, this.level.goals[i].y)) {
				this.level.goals[i].active = true
				++goalsActive
				continue
			}
			for (let j = 0; j < this.clones.length; ++j) {
				if (this.goalCollision(this.clones[j].x, this.clones[j].y, this.level.goals[i].x, this.level.goals[i].y)) {
					this.level.goals[i].active = true
					++goalsActive
					tmpSkip = true
					break
				}
			}
			if (!tmpSkip) this.level.goals[i].active = false
		}

		if (goalsActive == this.level.goals.length) {
			this.level.won = true
			this.currentLevel++
		}
	}

	keyRelease (key) {
		// release keys
		if (key === 'ArrowUp') { this.input[0] = false } 
		if (key === 'ArrowLeft') { this.input[1] = false }
		if (key === 'ArrowDown') { this.input[2] = false } 
		if (key === 'ArrowRight') { this.input[3] = false } 
		if (key === ' ') { this.input[4] = false }
	}

	update (dt) {
		if (this.DEBUG) console.log(`UP: ${this.input[0]} LEFT: ${this.input[1]} DOWN: ${this.input[2]} RIGHT: ${this.input[3]} CLONE: ${this.input[4]}`)
	}

	draw () {
		this.ctx.clearRect(0, 0, this.width, this.height)

		// draw bg color
		this.ctx.fillStyle = "#222"
		this.ctx.fillRect(0, 0, this.width, this.height)

		// draw blocks
		this.ctx.fillStyle = "#ccc"
		for (let i = 0; i < this.level.blocks.length; ++i) {
			this.ctx.fillRect(this.center.x - this.player.size + this.level.blocks[i].x * this.step, 
							  this.center.y - this.player.size + this.level.blocks[i].y * this.step, 
							  this.player.size * 2, 
							  this.player.size * 2)
		}

		// draw player
		drawCircle(this.ctx, 
			this.center.x + this.player.x * this.step,
			this.center.y + this.player.y * this.step,
			this.player.size, {
			fillColor: '#fff',
			lineWidth: 0,
		})

		// draw clones
		for (let i = 0; i < this.clones.length; ++i) {
			drawCircle(this.ctx, 
				this.center.x + this.clones[i].x * this.step, 
				this.center.y + this.clones[i].y * this.step, 
				this.player.size, {
				fillColor: 'rgba(200, 200, 200, .75)',
				lineWidth: 4,
				strokeColor: '#999',
			})
		}

		// draw goals
		this.ctx.strokeStyle = "#ccc"
		for (let i = 0; i < this.level.goals.length; ++i) {
			let tmpStrokeColor = this.level.goals[i].active ? '#666' : '#ccc'
			drawCircle(this.ctx, this.center.x + this.level.goals[i].x * this.step, this.center.y + this.level.goals[i].y * this.step, this.player.size, {
				fillColor: 'transparent',
				lineWidth: 4,
				strokeColor: tmpStrokeColor
			})
		}

		// draw text info
		this.ctx.fillStyle = "#ccc"
		let yPosText = this.fontSize + 16
		this.ctx.font = this.fontSize + 'px Verdana, sans-serif';
		this.ctx.fillText("✣", this.width / 2 - (16 * (this.fontSize / 2)) / 2, yPosText);
		this.ctx.fillText("    " + this.player.movesUsed + ' / ' + this.level.maxSteps + "  ⬤ " + this.player.clonesUsed + ' / ' + this.player.maxClones, this.width / 2 - (16 * (this.fontSize / 2)) / 2, yPosText);
	}
}
