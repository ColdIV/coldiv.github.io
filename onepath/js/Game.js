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
		
		this.player.x = this.width / 2
		this.player.y = this.height / 2

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
		this.player.x = this.center.x
		this.player.y = this.center.y
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
			if (this.center.x - this.player.size + this.level.blocks[i].x * this.step === x - this.player.size 
			 && this.center.y - this.player.size + this.level.blocks[i].y * this.step === y - this.player.size) return true
		}
		return false
	}

	goalCollision (x, y, gx, gy) {
		if (this.DEBUG) console.log(x, y, this.center.x + gx * this.step, this.center.y + gy * this.step);
		if (this.center.x + gx * this.step === x
			&& this.center.y + gy * this.step === y) {
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
			if (!this.blockCollision(this.player.x, this.player.y - this.step)) {
				this.player.y -= this.step
			}
			this.input[0] = true
			this.path.push(0)
		} 

		if (key === 'ArrowLeft' && !this.input[1]) {
			this.player.movesUsed++
			if (!this.blockCollision(this.player.x - this.step, this.player.y)) {
				this.player.x -= this.step
			}
			this.input[1] = true
			this.path.push(1)
		}
		if (key === 'ArrowDown' && !this.input[2]) {
			this.player.movesUsed++
			if (!this.blockCollision(this.player.x, this.player.y + this.step)) {
				this.player.y += this.step
			}
			this.input[2] = true
			this.path.push(2)
		}
		if (key === 'ArrowRight' && !this.input[3]) {
			this.player.movesUsed++
			if (!this.blockCollision(this.player.x + this.step, this.player.y)) {
				this.player.x += this.step
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
					if (!this.blockCollision(this.clones[i].x, this.clones[i].y - this.step)) {
						this.clones[i].y -= this.step
					}
				} else if (this.path[this.clones[i].index] === 1) {
					if (!this.blockCollision(this.clones[i].x - this.step, this.clones[i].y)) {
						this.clones[i].x -= this.step
					}
				} else if (this.path[this.clones[i].index] === 2) {
					if (!this.blockCollision(this.clones[i].x, this.clones[i].y + this.step)) {
						this.clones[i].y += this.step
					}
				} else if (this.path[this.clones[i].index] === 3) {
					if (!this.blockCollision(this.clones[i].x + this.step, this.clones[i].y)) {
						this.clones[i].x += this.step
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
		drawCircle(this.ctx, this.player.x, this.player.y, this.player.size, {
			fillColor: '#fff',
			lineWidth: 0,
		})

		// draw clones
		for (let i = 0; i < this.clones.length; ++i) {
			drawCircle(this.ctx, this.clones[i].x, this.clones[i].y, this.player.size, {
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
		this.ctx.font = this.fontSize + 'px Verdana, sans-serif';
		let yPosText = this.fontSize + 16
		// "i don't want to use icons, unicode is much better" and other stuff I tell myself
		// there is probably a better solution - but do I look like a js dev?
		this.ctx.fillText("   " + this.player.movesUsed + ' / ' + this.level.maxSteps + "  ⬤ " + this.player.clonesUsed + ' / ' + this.player.maxClones, this.width / 2 - (16 * (this.fontSize / 2)) / 2, yPosText);
		this.ctx.fillText("↕              ", this.width / 2 - (17 * (this.fontSize / 2)) / 2 + this.fontSize / 4, yPosText - 2);
		this.ctx.fillText("↔              ", this.width / 2 - (18 * (this.fontSize / 2)) / 2 + this.fontSize / 4, yPosText - 2);
	}
}
