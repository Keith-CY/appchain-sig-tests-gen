const http = require('http')
const AppChain = require("@appchain/base").default
const {
  randomTx,
  logTx,
} = require('./utils')

require('dotenv').config()

const app = http.createServer()

const appchain = AppChain(process.env.CHAIN)
const account = appchain.base.accounts.privateKeyToAccount(process.env.PRIVATE_KEY)

appchain.base.accounts.wallet.add(account)

const PORT = process.env.PORT || 3000

const startTest = (interval) => {
  setInterval(() => {
    const rTx = randomTx()
    let tx = { ...rTx,
    }
    const sender = appchain.base.accounts.wallet[0]
    appchain.base.getBlockNumber().then(blockNumber => {
      tx = { ...tx,
        validUntilBlock: +blockNumber + 88,
        data: appchain.utils.fromUtf8(rTx.data),
        to: appchain.base.accounts.create().address
      }
      const signedMsg = appchain.base.signer(tx, process.env.PRIVATE_KEY)
      try {
        appchain.base.unsigner(signedMsg)
      } catch (err) {
        const log = {
          tx,
          sender: {
            privateKey: sender.privateKey,
            address: sender.address,
          },
          errorMessage: err.toString()
        }
        return
      }
      return appchain.base.sendTransaction(tx)
        .then(txRes => {
          if (txRes.status === 'OK') {
            return appchain.listeners.listenToTransactionReceipt(txRes.hash)
          } else {
            throw new Error("Send tx failed")
          }
        })
        .then(receipt => {
          if (receipt.errorMessage) {
            const log = {
              tx,
              sender: {
                privateKey: sender.privateKey,
                address: sender.address,
              },
              errorMessage: receipt.errorMessage,
            }
            logTx(log)
          }
        })
        .catch(err => {
          console.log(err)
        })
    })
  }, interval)
}

startTest(process.env.INTERVAL || 10000)

app.listen(PORT, () => {
  console.log(`Sig Test Gen is running at ${PORT}`)
})
