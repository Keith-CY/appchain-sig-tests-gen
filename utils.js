const randomWords = require('random-words')
const {
  tx
} = require('./tpl')
const randomTx = () => {

  return {
    ...tx,
    quota: Math.round(Math.random() * 10000000),
    nocne: Math.random(),
    value: Math.round(Math.random() * 10000),
    data: randomWords({
      min: 10,
      max: 100,
      join: ' '
    })
  }
}
module.exports = {
  randomTx
}
