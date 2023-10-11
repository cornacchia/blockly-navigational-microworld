const _ = require('lodash')

const MAP_IMAGES = [
  { name: 'character_up', src: '/images/unplugged/character_up.svg', type: 'map' },
  { name: 'character_down', src: '/images/unplugged/character_down.svg', type: 'map' },
  { name: 'character_left', src: '/images/unplugged/character_left.svg', type: 'map' },
  { name: 'character_right', src: '/images/unplugged/character_right.svg', type: 'map' },
  { name: 'goal', src: '/images/unplugged/star.svg', type: 'map' },
  { name: 'intermediate_goal', src: '/images/unplugged/goal.svg', type: 'map' },
  { name: 'wall', src: '/images/unplugged/wall.svg', type: 'map' },
  { name: 'path', src: '/images/unplugged/path.svg', type: 'map' },
  { name: 'wood1', src: '/images/unplugged/wood1.svg', type: 'map' },
  { name: 'wood2', src: '/images/unplugged/wood2.svg', type: 'map' },
  { name: 'wood3', src: '/images/unplugged/wood3.svg', type: 'map' }
]

function translateTileType (type) {
  if (type === '0') return 'wall'
  else if (type === '1') return 'path'
  else if (type === '2') return 'goal'
  else if (type === '3') return 'character_down'
  else if (type === '4') return 'character_right'
  else if (type === '5') return 'character_up'
  else if (type === '6') return 'character_left'
  else if (type === '7') return 'intermediate_goal'
  else return ''
}

// Calculate map dimension based on the number of vertical and horizontal tiles
function calcMapCanvasDim (data, canvasDimensions) {
  const mapRows = data.map.length
  const mapCols = data.map[0].length
  const mapCanvasHeight = (mapRows * canvasDimensions.map.tile.height) + 20
  const mapCanvasWidth = (mapCols * canvasDimensions.map.tile.width) + 20

  return {
    height: mapCanvasHeight,
    width: mapCanvasWidth
  }
}

// Some scaling necessary to account for different browsers/devices
function scaleMapCanvas (canvasId, canvasDimensions) {
  const canvas = document.getElementById(canvasId)
  const context = canvas.getContext('2d')
  canvas.style.width = canvasDimensions.map.width + 'px'
  canvas.style.height = canvasDimensions.map.height + 'px'
  const scale = window.devicePixelRatio
  canvas.width = canvasDimensions.map.width * scale
  canvas.height = canvasDimensions.map.height * scale
  context.scale(scale, scale)
}

// Render one tile of the map
function drawMapTile (context, type, x, y, canvasDimensions, images) {
  let image = images.map.path
  if (type === 'wall') {
    // Get one random wood image to represent walls
    const imageName = _.sample(['wood1', 'wood2', 'wood3'])
    image = images.map[imageName]
  }

  // Render the background tile (path or wall)
  context.drawImage(image, x, y, canvasDimensions.map.tile.width, canvasDimensions.map.tile.height)

  // Render other stuff on top of the background tile
  if (type.indexOf('character') >= 0) {
    const characterImage = images.map[type]
    const cx = x + canvasDimensions.map.tile.characterOffsetX
    const cy = y + canvasDimensions.map.tile.characterOffsetY
    context.drawImage(characterImage, cx, cy, canvasDimensions.map.character.scaleX, canvasDimensions.map.character.scaleY)
  } else if (type === 'goal') {
    const goalImage = images.map.goal
    const gx = x + canvasDimensions.map.tile.goalOffsetX
    const gy = y + canvasDimensions.map.tile.goalOffsetY
    context.drawImage(goalImage, gx, gy, canvasDimensions.map.goal.scaleX, canvasDimensions.map.goal.scaleY)
  } else if (type === 'intermediate_goal') {
    const intermediateGoalImage = images.map.intermediate_goal
    const gx = x + canvasDimensions.map.tile.goalOffsetX
    const gy = y + canvasDimensions.map.tile.goalOffsetY
    context.drawImage(intermediateGoalImage, gx, gy, canvasDimensions.map.goal.scaleX, canvasDimensions.map.goal.scaleY)
  }
}

// Draw the exercise map on the screen
function renderMap (data, canvasId, canvasDimensions, images) {
  scaleMapCanvas(canvasId, canvasDimensions)
  const canvas = document.getElementById('mapCanvas')
  const context = canvas.getContext('2d')
  for (let i = 0; i < data.map.length; i++) {
    for (let j = 0; j < data.map[i].length; j++) {
      const tileType = translateTileType(data.map[i][j])
      const x = j * canvasDimensions.map.tile.width
      const y = i * canvasDimensions.map.tile.height
      drawMapTile(context, tileType, x, y, canvasDimensions, images)
    }
  }
}

module.exports = {
  mapImages: MAP_IMAGES,
  calcMapCanvasDim,
  renderMap
}
