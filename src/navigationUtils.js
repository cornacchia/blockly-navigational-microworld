const _ = require('lodash')

// Rotate vector left (l) or right (r)
function rotate (vec, dir) {
  const res = { i: null, j: null }
  if (dir === 'l') {
    res.i = -vec.j
    res.j = vec.i
  } else {
    res.i = vec.j
    res.j = -vec.i
  }
  return res
}

// Save position of collectible or container on state object
function addPosToState (type, i, j, val, state) {
  const path = type + '.' + i + '.' + j
  if (!_.has(state.collect.pos, path)) _.set(state.collect.pos, path, { val })
}

// Create the 'data' parameter used in navigationGameFunctions.js
function getStateObjFromMap (map) {
  const stateObj = {
    // 2d array representing the exercise map
    map: _.cloneDeep(map),
    robot: {
      // position on the map (row, column)
      pos: { i: -1, j: -1 },
      // direction (vertical, horizontal)
      dir: { i: -1, j: -1 }
    },
    // Collectibles
    collect: {
      // Static information about the exercise
      static: {
        // How many collectibles are there in the map
        num: 0,
        // How many containers for collectibles are there in the map
        containers: 0
      },
      dynamic: {
        // Collectibles picked up by the robot
        collected: 0,
        // Collectibles put down by the robot
        putDown: 0,
        containers: 0
      },
      // Positions of collectibles and containers in the map (row, column)
      pos: {
        collect: {},
        container: {}
      }
    }
  }

  for (let i = 0; i < map.length; i++) {
    for (let j = 0; j < map[i].length; j++) {
      // Handle position and direction of robot
      // Handle collectibles
      switch (map[i][j]) {
        case '3':
          // Robot looking down
          stateObj.robot.pos.i = i
          stateObj.robot.pos.j = j
          stateObj.robot.dir.i = 1
          stateObj.robot.dir.j = 0
          break
        case '4':
          // Robot looking right
          stateObj.robot.pos.i = i
          stateObj.robot.pos.j = j
          stateObj.robot.dir.i = 0
          stateObj.robot.dir.j = 1
          break
        case '5':
          // Robot looking up
          stateObj.robot.pos.i = i
          stateObj.robot.pos.j = j
          stateObj.robot.dir.i = -1
          stateObj.robot.dir.j = 0
          break
        case '6':
          // Robot looking left
          stateObj.robot.pos.i = i
          stateObj.robot.pos.j = j
          stateObj.robot.dir.i = 0
          stateObj.robot.dir.j = -1
          break
        // Collectibles: 10 + number of collectibles on this tile
        case '11':
          stateObj.collect.static.num += 1
          addPosToState('collect', i, j, 1, stateObj)
          break
        case '12':
          stateObj.collect.static.num += 2
          addPosToState('collect', i, j, 2, stateObj)
          break
        case '13':
          stateObj.collect.static.num += 3
          addPosToState('collect', i, j, 3, stateObj)
          break
        case '14':
          stateObj.collect.static.num += 4
          addPosToState('collect', i, j, 4, stateObj)
          break
        case '15':
          stateObj.collect.static.num += 5
          addPosToState('collect', i, j, 5, stateObj)
          break
        case '16':
          stateObj.collect.static.num += 6
          addPosToState('collect', i, j, 6, stateObj)
          break
        // Collectible containers: 20 + number of containers on this tile
        case '21':
          stateObj.collect.static.containers += 1
          addPosToState('container', i, j, 1, stateObj)
          break
        case '22':
          stateObj.collect.static.containers += 2
          addPosToState('container', i, j, 2, stateObj)
          break
        case '23':
          stateObj.collect.static.containers += 3
          addPosToState('container', i, j, 3, stateObj)
          break
        case '24':
          stateObj.collect.static.containers += 4
          addPosToState('container', i, j, 4, stateObj)
          break
        case '25':
          stateObj.collect.static.containers += 5
          addPosToState('container', i, j, 5, stateObj)
          break
        case '26':
          stateObj.collect.static.containers += 6
          addPosToState('container', i, j, 6, stateObj)
          break
        default:
      }
    }
  }

  return stateObj
}

module.exports = {
  getStateObjFromMap,
  rotate
}
