export function test () {
	console.log("test")
}


export function drawCircle (ctx, x, y, radius, options) {
	let circle = new Path2D()
	circle.arc(x, y, radius, 0, 2 * Math.PI, false)

	let tmpFill = ctx.fillStyle,
		tmpLine = ctx.lineWidth,
		tmpStroke = ctx.strokeStyle

	if (options.fillColor !== undefined) {
		ctx.fillStyle = options.fillColor
	}
	ctx.fill(circle)

	if (options.lineWidth !== undefined) {
		ctx.lineWidth = options.lineWidth
	}
	if (options.strokeColor !== undefined) {
		ctx.strokeStyle = options.strokeColor
	}
	
	if (options.lineWidth !== 0) {
		ctx.stroke(circle)
	}

	ctx.fillStyle = tmpFill
	ctx.strokeStyle = tmpStroke
	ctx.lineWidth = tmpLine
}

export function getLevel (currentLevel) {
	let levels = [
		{
			goals: [
				{
					x: 2,
					y: 0
				}
			],
			blocks: [],
			maxSteps: 2,
			won: false
		},
		{
			goals: [
				{
					x: -1,
					y: 0
				},
				{
					x: 1,
					y: 0
				}
			],
			blocks: [],
			maxSteps: 3,
			won: false
		},
		{
			goals: [
				{
					x: 0,
					y: 1
				},
				{
					x: 1,
					y: 2
				}
			],
			blocks: [
				{
					x: 0,
					y: 2
				}
			],
			maxSteps: 5,
			won: false
		},
		{
			goals: [
				{
					x: -2,
					y: -1
				},
				{
					x: -1,
					y: -4
				}
			],
			blocks: [
				{
					x: -2,
					y: -2
				}
			],
			maxSteps: 5,
			won: false
		},
		{
			goals: [
				{
					x: 1,
					y: 1
				},
				{
					x: 1,
					y: 3
				}
			],
			blocks: [
				{
					x: 0,
					y: 2
				}
			],
			maxSteps: 5,
			won: false
		},
		{
			goals: [
				{
					x: -1,
					y: 1
				},
				{
					x: 1,
					y: 1
				},
				{
					x: 0,
					y: 2
				}
			],
			blocks: [
				{
					x: 1,
					y: 0
				},
				{
					x: 2,
					y: 2
				}
			],
			maxSteps: 5,
			won: false
		}
	]
	if (levels.length > currentLevel) {
		return levels[currentLevel]
	} else {
		// console.log('Last level reached, should generate now')
		// this.running = false
		// return levels[currentLevel - 1]
		let genLevel = generateLevel()
		console.log('-- Generated Solution (flawed) --')
		for (let i = 0; i < genLevel.solution.length; ++i) {
			console.log(i, genLevel.solution[i])
		}
		return genLevel
	}
}

export function cmpPoints (p1, p2) {
	return (p1.x == p2.x && p1.y == p2.y)
}

export function generateLevel (mSteps = 5, maxClones = 2) {
	let path = []
	let createClones = []
	let clonesPos = []
	let blocksPos = []
	let cleanPos = [{x: 0, y: 0}]
	let playerPos = {
		x: 0,
		y: 0
	}

	for (let i = 0; i < mSteps; ++i) {
		// gen clones
		if (i > 0 && clonesPos.length < maxClones) {
			if (Math.floor(Math.random() * (maxClones)) == 1) {
				clonesPos.push({x: playerPos.x, y: playerPos.y, index: 0})
				createClones.push(i)
			}
		}

		// move player
		let newPos = {}
		let rndDirection = Math.floor(Math.random() * 4)
		if (rndDirection == 0) {
			newPos = {x: playerPos.x + 1, y: playerPos.y}
		} else if (rndDirection == 1) {
			newPos = {x: playerPos.x - 1, y: playerPos.y}
		} else if (rndDirection == 2) {
			newPos = {x: playerPos.x, y: playerPos.y + 1}
		} else if (rndDirection == 3) {
			newPos = {x: playerPos.x, y: playerPos.y - 1}
		}

		let isClean = false
		for (let ic = 0; ic < cleanPos.length; ++ic) {
			// console.log(cleanPos[ic], newPos, cmpPoints(cleanPos[ic], newPos));
			if (cmpPoints(cleanPos[ic], newPos)) {
				isClean = true
				break
			}
		}

		if (isClean) {
			// console.log('isClean', cleanPos);
			path.push(rndDirection)
			playerPos.x = newPos.x
			playerPos.y = newPos.y
		} else {
			let isBlock = false
			for (let ib = 0; ib < blocksPos.length; ++ib) {
				if (cmpPoints(newPos, blocksPos[ib])) {
					// console.log('isBlock', blocksPos);
					isBlock = true
					break
				}
			}
			
			// gen blocks
			if (!isBlock && Math.floor(Math.random() * 3) == 1) {
				// console.log('createBlock', newPos);
				blocksPos.push({x: newPos.x, y: newPos.y})
				isBlock = true
				path.push(rndDirection)
			} else if (!isBlock) {
				// console.log('movePlayer', newPos);
				playerPos.x = newPos.x
				playerPos.y = newPos.y
				cleanPos.push({x: newPos.x, y: newPos.y})
				path.push(rndDirection)
			}
		}

		// move clones (copy & paste, very ugly)
		for (let c = 0; c < clonesPos.length; ++c) {
			let newPos = {}
			let direction = path[clonesPos[c].index]
			clonesPos[c].index++
			if (direction == 0) {
				newPos = {x: clonesPos[c].x + 1, y: clonesPos[c].y}
			} else if (direction == 1) {
				newPos = {x: clonesPos[c].x - 1, y: clonesPos[c].y}
			} else if (direction == 2) {
				newPos = {x: clonesPos[c].x, y: clonesPos[c].y + 1}
			} else if (direction == 3) {
				newPos = {x: clonesPos[c].x, y: clonesPos[c].y - 1}
			}
			
			let isClean = false
			for (let ic = 0; ic < cleanPos.length; ++ic) {
				if (cmpPoints(cleanPos[ic], newPos)) {
					isClean = true
					break
				}
			}
			
			if (isClean) {
				clonesPos[c].x = newPos.x
				clonesPos[c].y = newPos.y
			} else {
				let isBlock = false
				for (let ib = 0; ib < blocksPos.length; ++ib) {
					if (cmpPoints(newPos, blocksPos[ib])) {
						isBlock = true
						break
					}
				}
				// gen blocks
				if (!isBlock && Math.floor(Math.random() * 3) == 1) {
					blocksPos.push({x: newPos.x, y: newPos.y})
					isBlock = true
				}
				
				if (!isBlock) {
					cleanPos.push({x: newPos.x, y: newPos.y})
					clonesPos[c].x = newPos.x
					clonesPos[c].y = newPos.y
				}
			}
		}
	}

	clonesPos.push(playerPos)
	let genGoals = [...new Set(clonesPos)]
	// console.log(clonesPos, genGoals);
	for (let i = 0; i < genGoals.length; ++i) {
		if (cmpPoints(genGoals[i], {x:0, y:0})
			|| !genGoals[i].x  // ugly solution for undefined x/y...
			|| !genGoals[i].y) {
			// genGoals.splice(i, 1)
			// break
			return generateLevel()
		}
	}
	// console.log('goals', genGoals.length, genGoals);
	let vPath = []
	let cIndex = 0
	for (let i = 0; i < path.length; ++i) {
		let move = ''
		if (path[i] == 0) {
			move += 'right'
		} else if (path[i] == 1) {
			move += 'left'
		} else if (path[i] == 2) {
			move += 'down'
		} else if (path[i] == 3) {
			move += 'up'
		}
		if (cIndex < maxClones && createClones[cIndex] == i) {
			move = 'clone ' + move
			++cIndex
		}
		vPath.push(move)
	}

	let finalGoals = []
	let fGindex = 0
	for (let i = 0; i < genGoals.length; ++i) {
		for (let j = 0; j < genGoals.length; ++j) {
			if (j == i) continue
			if (!cmpPoints(genGoals[i], genGoals[j])) {
				finalGoals[fGindex++] = genGoals[i]
			}
		}
	}

	if (finalGoals.length < 2 || finalGoals.length > createClones.length + 1) {
		return generateLevel()
	}

	// console.log(genGoals, createClones);

	return {
		goals: finalGoals,
		blocks: blocksPos,
		maxSteps: mSteps,
		won: false,
		solution: vPath
	}
}