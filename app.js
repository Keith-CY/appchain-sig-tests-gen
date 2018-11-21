const Koa = require('koa')
const AppChain = require("@appchain/base").default
const {
  randomTx
} = require('./utils')

require('dotenv').config()

const app = new Koa()
const appchain = AppChain(process.env.CHAIN)
const account = appchain.base.accounts.privateKeyToAccount(process.env.PRIVATE_KEY)

appchain.base.accounts.wallet.add(account)

const PORT = process.env.PORT || 3000

setInterval(() => {
  const rTx = randomTx()
  let tx = { ...rTx
  }
  appchain.base.getBlockNumber().then(blockNumber => {
      tx = { ...tx,
        validUntilBlock: +blockNumber + 88,
        data: appchain.utils.fromUtf8(rTx.data),
        to: appchain.base.accounts.create().address
      }
      return appchain.base.sendTransaction(tx)
    }).then(txRes => {
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
          errorMessage: receipt.errorMessage,
          sender: appchain.base.accounts.wallet[0]
        }
        console.log(log)
      }
    })
    .catch(err => {
      console.log(err)
    })
}, process.env.INTERVAL || 1000)

app.listen(PORT, () => {
  console.log(`Sig Test Gen is running at ${PORT}`)
})
