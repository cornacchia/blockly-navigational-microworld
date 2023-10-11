const _ = require('lodash')

// This is used to handle 'events' fired by the blockly interface
// we use this to collect interaction data
function collectWorkspaceEvents (Blockly, wType, workspace, handleFunc, reactThis, evt) {
  let block
  if (!_.isNil(evt.blockId) && evt.blockId !== '') {
    block = workspace.getBlockById(evt.blockId)
  }
  if (!_.isNil(handleFunc)) handleFunc(Blockly, wType, workspace, block, evt)

  // Handle interface changes
  if (evt.type === Blockly.Events.BLOCK_MOVE) {
    if ((!_.isNil(block) && block.type === 'start') || (wType === 'WS')) {
      const startBlock = workspace.getBlocksByType('start', true)[0]

      let usedBlocks = 0
      if (!_.isNil(startBlock)) usedBlocks = startBlock.getDescendants().length

      reactThis.setUsedBlocks(usedBlocks)
    }
  }
}

module.exports = {
  collectWorkspaceEvents
}
