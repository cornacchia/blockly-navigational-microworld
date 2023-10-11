// These functions are used to prefetch all images
// before actually starting the exercise

const preloadImage = imgInfo => new Promise((resolve, reject) => {
  const img = new Image()
  img.onload = () => {
    resolve(img)
  }
  img.onerror = reject
  img.imgId = imgInfo.name
  img.imgType = imgInfo.type
  img.src = imgInfo.src
})

const preloadAll = sources => Promise.all(sources.map(preloadImage))

module.exports = {
  preloadAll
}
