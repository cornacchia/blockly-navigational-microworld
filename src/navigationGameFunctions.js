const _ = require('lodash')
const navigationUtils = require('./navigationUtils')

class NavigationError extends Error {
  constructor (message, type, operations) {
    super(message)
    this.operations = operations
    this.type = type
  }
}

// Intermediate goals are tiles (code '7') that must be traversed
// in order to succesfully complete the exercise.
// This function checks this condition.
function checkIntermediateGoals (data) {
  for (let i = 0; i < data.map.length; i++) {
    for (let j = 0; j < data.map[i].length; j++) {
      if (data.map[i][j] === '7') return false
    }
  }
  return true
}

function checkCollectibles (data) {
  for (const i in data.collect.pos.collect) {
    for (const j in data.collect.pos.collect) {
      if (_.isNil(data.collect.pos.collect[i][j])) continue
      if (data.collect.pos.collect[i][j].val > 0) return false
    }
  }

  for (const i in data.collect.pos.container) {
    for (const j in data.collect.pos.container) {
      if (_.isNil(data.collect.pos.container[i][j])) continue
      if (data.collect.pos.container[i][j].val > 0) return false
    }
  }

  return true
}

// Definition of 'data' parameter in navigationUtils.js
// data.map: 2d array of characters representing paths, walls, etc.
// data.robot.pos: robot position in the 2d array {i: current row, j: current column}
// data.robot.dir: robot direction {i: vertical direction, j: horizontal direction}
// vertical directions: negative -> up, positive -> down
// horizontal directions: negative -> left, positive -> right
function move (action, blockId, data, operations) {
  let success = false
  let newPos
  let newDir

  switch (action) {
    // move forward
    case 'f':
      newPos = {
        i: data.robot.pos.i + data.robot.dir.i,
        j: data.robot.pos.j + data.robot.dir.j
      }
      newDir = data.robot.dir
      break
    // jump forward
    case 'jf':
      newPos = {
        i: data.robot.pos.i + (data.robot.dir.i * 2),
        j: data.robot.pos.j + (data.robot.dir.j * 2)
      }
      newDir = data.robot.dir
      break
    // move backward
    case 'b':
      newPos = {
        i: data.robot.pos.i - data.robot.dir.i,
        j: data.robot.pos.j - data.robot.dir.j
      }
      newDir = data.robot.dir
      break
    // turn left
    case 'tl':
      newPos = data.robot.pos
      newDir = navigationUtils.rotate(data.robot.dir, 'l')
      break
    // turn right
    case 'tr':
      newPos = data.robot.pos
      newDir = navigationUtils.rotate(data.robot.dir, 'r')
      break
    default:
  }

  // Check if robot fell out of map boundaries
  if ((newPos.i < 0 || newPos.i >= data.map.length) ||
      (newPos.j < 0 || newPos.j >= data.map[0].length)) {
    operations.push({ action: action, id: blockId })
    operations.push({ action: 'fallPit', id: blockId })
    throw (new NavigationError('Out of bounds!', 'outOfBounds', operations))
  }

  const newTile = data.map[newPos.i][newPos.j]

  data.robot.pos = newPos
  data.robot.dir = newDir

  if (newTile === '0') {
    // Robot hit a wall/obstacle
    operations.push({ action: action + 'X', id: blockId })
    throw (new NavigationError('Hit wall!', 'wall', operations))
  } else if (newTile === '30') {
    // Robot fell in a pit
    operations.push({ action: action, id: blockId })
    operations.push({ action: 'fallPit', id: blockId })
    throw (new NavigationError('Fell in pit!', 'pit', operations))
  } else if (newTile === '2') {
    // Robot reached main goal tile
    if (checkIntermediateGoals(data) && checkCollectibles(data)) success = true
  } else if (newTile === '7') {
    // Robot reached intermediate goal

    // Remove intermediate goal from map
    data.map[newPos.i][newPos.j] = '1'
  }

  operations.push({ action: action, id: blockId })
  return { data, operations, success }
}

function pick (blockId, data, operations) {
  const i = data.robot.pos.i
  const j = data.robot.pos.j

  const path = 'collect.pos.collect.' + i + '.' + j
  if (_.isNil(_.get(data, path))) throw (new NavigationError('No collectibles here!', 'nothingToCollect', operations))

  const posData = _.get(data, path)
  if (posData.val <= 0) throw (new NavigationError('Already collected everything here!', 'tooManyCollections', operations))

  const collected = _.get(data, 'collect.dynamic.collected')
  _.set(data, 'collect.dynamic.collected', collected + 1)
  _.set(data, path, { val: posData.val - 1 })

  operations.push({ action: 'p', id: blockId })
  return { data, operations, success: false }
}

function put (blockId, data, operations) {
  const i = data.robot.pos.i
  const j = data.robot.pos.j

  const path = 'collect.pos.container.' + i + '.' + j
  if (_.isNil(_.get(data, path))) throw (new NavigationError('No containers here!', 'noContainers', operations))

  const posData = _.get(data, path)
  if (posData.val <= 0) throw (new NavigationError('Already filled everything here!', 'allFull', operations))

  const collected = _.get(data, 'collect.dynamic.collected')
  if (collected <= 0) throw (new NavigationError('Nothing to put down!', 'nothingToPutDown', operations))

  const putDown = _.get(data, 'collect.dynamic.putDown')

  _.set(data, 'collect.dynamic.collected', collected - 1)
  _.set(data, 'collect.dynamic.putDown', putDown + 1)
  _.set(data, path, { val: posData.val - 1 })

  const success = _.get(data, 'collect.dynamic.putDown') === _.get(data, 'collect.static.num')

  operations.push({ action: 'v', id: blockId })
  return { data, operations, success }
}

function getGameFunctions () {
  return {
    move,
    pick,
    put
  }
}

module.exports = {
  getGameFunctions
}
