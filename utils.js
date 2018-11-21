const fsPromise = require('fs').promises
const path = require('path')
const randomWords = require('random-words')
const {
  tx
} = require('./tpl')

const randomTx = () => ({
  ...tx,
  quota: Math.round(Math.random() * 10000000),
  nocne: Math.random(),
  value: Math.round(Math.random() * 10000),
  data: randomWords({
    min: 10,
    max: 100,
    join: ' '
  })
})



const txLogFile = path.join(__dirname, './logs/txs.log')
const logTx = (log) => {
  return fsPromise.appendFile(txLogFile, JSON.stringify(log) + '\n')
}
module.exports = {
  randomTx,
  logTx
}
