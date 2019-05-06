"use strict"

const mockValidators = require(`scripts/mock_validators.json`)
const { sleep } = require(`../scripts/common.js`)

const state = { blockMetas: [], blocks: [], connected: true }
createBlockMetas(state)

const RpcClientMock = {
  on: () => {},
  subscribe: (args, cb) => {
    if (args.query === `tm.event = 'NewBlock'`) {
      produceBlocks(cb)
    }
    if (args.query === `tm.event = 'NewBlockHeader'`) {
      produceBlockHeaders(cb)
    }
  },
  validators: cb => cb(null, { validators: mockValidators }),
  block: ({ height }, cb) =>
    cb(null, { block: state.blocks.find(b => b.header.height === height) }),
  blockchain: ({ minHeight }, cb) =>
    cb(null, {
      block_metas: state.blockMetas.slice(minHeight)
    }),
  health: cb =>
    cb(null, {
      sync_info: {
        latest_block_height: 42
      },
      node_info: { network: `offline demo` }
    }),
  removeAllListeners: () => {},
  ws: {
    destroy: () => {}
  }
}

module.exports = function setRPCWrapperMock(container) {
  const rpcWrapper = {
    // RPC
    // made this a subobject so we can manipulate it in here while assigning it to the outer node object
    rpcInfo: {
      connecting: false,
      connected: true
    },
    rpcDisconnect() {
      state.connected = false
      rpcWrapper.rpcInfo.connected = false
    },
    rpcConnect() {
      state.connected = true
      rpcWrapper.rpcInfo.connected = true
      container.rpc = RpcClientMock
    }
  }

  return rpcWrapper
}

module.exports.getHeight = function() {
  return state.blocks.length - 1
}

function createBlockMeta(time, height) {
  return {
    header: { time, height },
    block_id: { hash: makeBlockHash() },
    height,
    chain_id: `offline demo`,
    last_block_id: { hash: makeBlockHash() }
  }
}

function createBlock(height) {
  return {
    hash: makeBlockHash(),
    header: {
      height,
      chain_id: `offline demo`,
      last_block_id: {
        hash: makeBlockHash(),
        parts: { total: 0, hash: makeBlockHash() }
      },
      num_txs: 0,
      last_commit_hash: makeBlockHash(),
      validators_hash: makeBlockHash(),
      app_hash: makeBlockHash()
    },
    last_commit: { precommits: [] },
    data: { txs: [] }
  }
}

function createBlockMetas(state) {
  const now = new Date()
  new Array(200).fill(null).forEach((_, i) => {
    const time = new Date(now)
    time.setMinutes(time.getMinutes() - i)

    state.blockMetas[i] = createBlockMeta(time, i)
    state.blocks.push(createBlock(i))
  })
}

async function produceBlockHeaders(cb) {
  let height = 200
  while (state.connected) {
    const newBlockHeader = createBlockMeta(Date.now(), ++height)
    state.blockMetas[newBlockHeader.height] = newBlockHeader
    cb(null, { data: { value: { header: newBlockHeader } } })
    await sleep(1000)
  }
}

async function produceBlocks(cb) {
  let height = 200
  while (state.connected) {
    const newBlock = createBlock(++height)
    state.blocks.push(newBlock)
    cb(null, { data: { value: { block: newBlock } } })
    await sleep(1000)
  }
}

function makeBlockHash() {
  let text = ``
  const possible = `ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`

  for (let i = 0; i < 40; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }

  return text
}