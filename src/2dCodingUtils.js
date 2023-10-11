const imageUtils = require('./imageUtils')
const mapUtils2d = require('./mapUtils2d')

const CANVAS_DIMENSIONS = {
  map: {
    height: 480,
    width: 480,
    tile: {
      height: 60,
      width: 60,
      characterOffsetX: 5,
      characterOffsetY: 5,
      goalOffsetX: 5,
      goalOffsetY: 5
    },
    character: {
      scaleX: 50,
      scaleY: 50
    },
    goal: {
      scaleX: 50,
      scaleY: 50
    }
  }
}

function calcCanvasDim (unpluggedData) {
  const mapDim = mapUtils2d.calcMapCanvasDim(unpluggedData, CANVAS_DIMENSIONS)
  CANVAS_DIMENSIONS.map.height = mapDim.height
  CANVAS_DIMENSIONS.map.width = mapDim.width

  const dimToReturn = {
    map: {
      height: CANVAS_DIMENSIONS.map.height,
      width: CANVAS_DIMENSIONS.map.width
    }
  }

  return dimToReturn
}

function start (exerciseData) {
  const imageDict = {
    map: {}
  }
  imageUtils.preloadAll(mapUtils2d.mapImages)
    .then(images => {
      for (const image of images) {
        imageDict.map[image.imgId] = image
      }
      mapUtils2d.renderMap(exerciseData, 'mapCanvas', CANVAS_DIMENSIONS, imageDict)
    })
    .catch(err => {
      alert('Error in retrieving the exercise images')
      console.error(err)
    })
}

module.exports = {
  canvasDimensions: CANVAS_DIMENSIONS,
  calcCanvasDim,
  start
}
