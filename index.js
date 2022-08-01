import crypto from 'crypto'
import BigNumber from 'bignumber.js'
import base58 from 'bs58'
import inquirer from 'inquirer'
import clk from 'chalk-template'
import 'chalk'

const log = console.log;

async function main() {
  const questions = [
    {
      type: 'input',
      name: 'x',
      message: "plase input x value:"
    },
    {
      type: 'input',
      name: 'y',
      message: "plase input y value:"
    },
  ]

  const { x, y } = await inquirer.prompt(questions)

  const address = getBitcoinAddressFromXY(x, y)
  log('')
  log(clk`{green ADDRESS}`, address)
}

main()

/**
 * get hashhex from public key
 * @param {key: string} key publicKey
 * @returns string hexhash
 */
function getHashHexFromPublicKey(key) {
  if (!key) throw new Error('key is required')
  // SHA256
  let sha256Hex = crypto.createHash('sha256').update(key, 'hex').digest('hex')
  log(clk`{green sha256Hex}`, sha256Hex)
  // RIPEMD-160
  let hashHex = crypto.createHash('ripemd160').update(sha256Hex, 'hex').digest('hex')
  log(clk`{green ripemd160} {rgb(8, 160, 117) ${hashHex}}`)
  // 添加主网版本号
  hashHex = '00' + hashHex
  log(clk`{green prefix00} {magenta ${hashHex.slice(0, 2)}}{rgb(8, 160, 117) ${hashHex.slice(2)}}`)
  // 计算两次 SHA-256
  let hash1 = crypto.createHash('sha256').update(hashHex, 'hex').digest('hex')
  log(clk`{green hash1}`, hash1)
  let hash2 = crypto.createHash('sha256').update(hash1, 'hex').digest('hex')
  log(clk`{green hash2} {rgb(255, 99, 72) ${hash2.slice(0, 8)}}${hash2.slice(8)}`)
  // 
  let checksum = hash2.slice(0,8)
  log(clk`{green checksum} {rgb(255, 99, 72) ${checksum}}`)
  // 拼接校验码
  hashHex = hashHex.concat(checksum);
  log(clk`{blue concated checksum} {magenta ${hashHex.slice(0, 2)}}{rgb(8, 160, 117) ${hashHex.slice(2, 42)}}{rgb(255, 99, 72) ${hashHex.slice(42)}}`)
  return hashHex
}

/**
 * get bitoin address from x,y
 * @param {string} X 
 * @param {string} y
 * @returns string bitoin address
 */
function getBitcoinAddressFromXY(x, y) {
  if (!x || !y) throw new Error('x and y is required!')
  
  const pubKey = '04' + x.toLowerCase() + y.toLowerCase()
  const compressedPubKey = `0${new BigNumber(y.toLowerCase(), 16).mod(2).eq(0) ? 2 : 3}` + x.toLowerCase()

  log(clk`{cyan pubkey} {gray ${pubKey.slice(0, 2)}}{yellow ${pubKey.slice(2, 66)}}{blue ${pubKey.slice(66)}}`)
  const hashHex = getHashHexFromPublicKey(pubKey)

  log('')
  log(clk`{cyan compressedPubKey}`, compressedPubKey)
  const compressedHashHex = getHashHexFromPublicKey(compressedPubKey)

  log('')
  const address = base58.encode(Buffer.from(hashHex, 'hex'))
  log(clk`{green base58check address}`, address)
  
  const compressedAddress = base58.encode(Buffer.from(compressedHashHex, 'hex'))
  log(clk`{green compressed base58check address}`, compressedAddress)

  return compressedAddress
}

