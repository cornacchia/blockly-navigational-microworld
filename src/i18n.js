const _ = require('lodash')
const i18nEn = require('./i18nEn.json')

function i18n (path, lang) {
  if (lang === 'en-GB') {
    return _.get(i18nEn, path)
  }
}

module.exports = i18n
