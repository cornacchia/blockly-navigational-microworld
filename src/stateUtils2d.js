const _ = require('lodash')

// Here are the functions that handle the blockly interface events
// We save interaction data and some metrics (e.g. time spent on exercise)
// We also save users' programs (both in string and tree-like representation)

const topBlocks = ['start']

const translateBlocks = {
  start: 'b',
  forward: 'f',
  jump_forward: 'j',
  backward: 'b',
  turn_left: 't(l)',
  turn_right: 't(r)',
  repeat: 'r',
  pick_collectible: 'c',
  put_down_collectible: 'h'
}

let STATE

function resetState (data) {
  STATE = {
    planningStart: null,
    executionStart: null,
    executionEnd: null,
    actions: [],
    attemptActions: {},
    currentDrag: {},
    attempt: 1,
    success: false,
    numOfFailures: 0,
    usedBlocks: 0,
    idealBlocks: data.idealBlocks,
    codes: [],
    exerciseBlocks: {}
  }
}

function codeStructureToString (block) {
  let result = block.name
  const doChild = _.find(block.children, { nested: 'DO' })
  const elseChild = _.find(block.children, { nested: 'ELSE' })
  const nextChild = _.find(block.children, { nested: 'NEXT' })
  const stackChild = _.find(block.children, { nested: 'STACK' })
  const inlineChild = _.find(block.children, { nested: 'INLINE' })
  if (doChild) {
    result += '{' + codeStructureToString(doChild.block) + '}'
  }
  if (elseChild) {
    result += 'else{' + codeStructureToString(elseChild.block) + '}'
  }
  if (inlineChild) {
    result += '(' + codeStructureToString(inlineChild.block) + ')'
  }
  if (nextChild) {
    result += codeStructureToString(nextChild.block)
  }
  if (stackChild) {
    result += '{' + codeStructureToString(stackChild.block) + '}'
  }

  return result
}

function startPlanningTime () {
  if (!STATE.planningStart) STATE.planningStart = new Date()
}

function startExecutionTime () {
  if (!STATE.executionStart) STATE.executionStart = new Date()
}

function stopExecutionTime () {
  STATE.executionEnd = new Date()
}

function handleCreateEvent (evt, block) {
  const newBlockCreation = {
    type: 'create',
    id: evt.blockId,
    bt: block.type,
    ts: Date.now()
  }
  if (block.childBlocks_.length > 0) {
    const codeStructure = getCodeStructure(STATE.exerciseBlocks[block.id])
    const codeStr = codeStructureToString(codeStructure)
    newBlockCreation.cs = {
      str: codeStr,
      bl: codeStructure
    }
  }
  STATE.actions.push(newBlockCreation)
}

function handleChangeEvent (evt, block, wType) {
  const newChangeEvent = {
    type: 'field',
    id: evt.blockId,
    bt: block.type,
    fly: wType === 'TB',
    name: evt.name,
    oldVal: evt.oldValue,
    val: evt.newValue,
    ts: Date.now()
  }
  STATE.actions.push(newChangeEvent)
}

function calcDistance (p1, p2) {
  return _.round(Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)), 3)
}

function handleBlockDragStart (evt, workspace, block) {
  const newDragEvent = {
    type: 'drag',
    id: evt.blockId,
    ts: {
      s: Date.now()
    },
    bt: block.type,
    grs: evt.blocks.length,
    pos: {
      s: block.getRelativeToSurfaceXY()
    }
  }

  if (!_.isNil(STATE.exerciseBlocks[evt.blockId].parent)) {
    const parentBlock = workspace.getBlockById(STATE.exerciseBlocks[evt.blockId].parent)
    if (!_.isNil(parentBlock)) newDragEvent.pId = parentBlock.id
  }
  STATE.currentDrag[evt.blockId] = newDragEvent
}

function handleBlockDragEnd (evt, block) {
  const currentDrag = STATE.currentDrag[evt.blockId]
  if (_.isNil(currentDrag)) return

  const newPos = block.getRelativeToSurfaceXY()
  if (currentDrag.pos.s.x === newPos.x && currentDrag.pos.s.y === newPos.y) return

  const dragAction = _.cloneDeep(currentDrag)
  // End position
  dragAction.pos.e = newPos
  // End timestamp
  dragAction.ts.e = Date.now()
  dragAction.dur = dragAction.ts.e - dragAction.ts.s
  dragAction.dist = calcDistance(dragAction.pos.s, dragAction.pos.e)

  // Check for connections
  const parentBlock = block.getParent()
  if (!_.isNil(parentBlock)) {
    let nested = 'NEXT'
    for (const input of parentBlock.inputList) {
      if (!_.isNil(input.connection)) {
        const target = input.connection.targetBlock()
        if (!_.isNil(target) && target.id === block.id) nested = input.name
      }
    }
    dragAction.conn = true
    dragAction.connTo = parentBlock.id
    dragAction.nest = nested

    if (dragAction.pId) {
      if (dragAction.pId !== parentBlock.id) dragAction.pChg = true
      else dragAction.rec = true
    }
  } else if (dragAction.pId) {
    dragAction.disc = true
  }

  STATE.actions.push(dragAction)
  delete STATE.currentDrag[evt.blockId]
}

function handleBlockDelete (evt, block) {
  const currentDrag = STATE.currentDrag[evt.blockId]
  if (_.isNil(currentDrag)) {
    const blockDeletionNoDrag = {
      type: 'blockDeleteNoDrag',
      id: evt.blockId,
      bt: block.type,
      grs: evt.ids.length,
      ts: Date.now()
    }
    STATE.actions.push(blockDeletionNoDrag)

    handleBlockDeletion(evt.blockId)
    return
  }

  const newPos = {
    x: block.x,
    y: block.y
  }
  if (currentDrag.pos.s.x === newPos.x && currentDrag.pos.s.y === newPos.y) return

  const dragAction = _.cloneDeep(currentDrag)
  // End position
  dragAction.pos.e = newPos
  // End timestamp
  dragAction.ts.e = Date.now()
  dragAction.dur = dragAction.ts.e - dragAction.ts.s
  dragAction.dist = calcDistance(dragAction.pos.s, dragAction.pos.e)
  dragAction.del = true

  if (dragAction.pId) dragAction.disc = true

  STATE.actions.push(dragAction)
  // console.log(dragAction)
  delete STATE.currentDrag[evt.blockId]
  handleBlockDeletion(evt.blockId)
}

function handleBlockDeletion (id) {
  // console.log('delete', id)
  STATE.exerciseBlocks[id].deleted = true
  for (const key in STATE.exerciseBlocks[id].children) {
    handleBlockDeletion(STATE.exerciseBlocks[id].children[key])
  }
}

function handleBlockMoveInState (evt, block) {
  const blockId = block ? block.id : evt.blockId

  if (evt.oldParentId) {
    // Remove from old parent
    if (evt.oldInputName) delete STATE.exerciseBlocks[evt.oldParentId].children[evt.oldInputName]
    else delete STATE.exerciseBlocks[evt.oldParentId].children.NEXT
    // Remove parent reference from block
    STATE.exerciseBlocks[blockId].parent = null
    STATE.exerciseBlocks[blockId].top = true
  }
  if (evt.newParentId) {
    // Add to new parent
    if (evt.newInputName) STATE.exerciseBlocks[evt.newParentId].children[evt.newInputName] = block.id
    else STATE.exerciseBlocks[evt.newParentId].children.NEXT = block.id
    // Add new parent
    STATE.exerciseBlocks[blockId].parent = evt.newParentId
    STATE.exerciseBlocks[blockId].top = false
  }
}

function addBlockToState (block, top, parent) {
  const childStructure = {}
  if (!_.isNil(block.nextConnection) && !_.isNil(block.nextConnection.targetBlock())) childStructure.NEXT = block.nextConnection.targetBlock().id
  for (const input of block.inputList) {
    if (!_.isNil(input.connection)) {
      const target = input.connection.targetBlock()
      if (!_.isNil(target)) childStructure[input.name] = target.id
    }
  }

  const newBlock = {
    id: block.id,
    type: block.type,
    children: childStructure,
    inputList: block.inputList,
    parent: parent,
    top: top
  }

  STATE.exerciseBlocks[block.id] = newBlock

  for (const child of block.getChildren()) addBlockToState(child, false, block.id)
}

function getUsedBlocks (startBlock, musicStartBlocks) {
  let usedBlocks = 0
  if (!_.isNil(startBlock)) usedBlocks = startBlock.getDescendants().length
  else if (musicStartBlocks.length > 0) {
    for (const musicStartBlock of musicStartBlocks) {
      usedBlocks += musicStartBlock.getDescendants().length
    }
  }
  return usedBlocks
}

// Ignore wType TB (toolbox) CREATE, MOVE (probably just listen for CHANGE)
// Ignore Start block create
function handleBlocklyEvent (Blockly, wType, workspace, block, evt) {
  const startBlock = workspace.getBlocksByType('start', true)[0]
  const musicStartBlocks = workspace.getBlocksByType('music_start', true)
  switch (evt.type) {
    case Blockly.Events.FINISHED_LOADING:
      break
    case Blockly.Events.BLOCK_CREATE:
      // Save in state only blocks on the workspace
      // Ignore toolbox/flyout blocks (wType === TB)
      if (wType !== 'TB') {
        startExecutionTime()
        addBlockToState(block, true, null)
      }
      if (wType !== 'TB' && topBlocks.indexOf(block.type) < 0) {
        handleCreateEvent(evt, block)
      }
      break
    case Blockly.Events.BLOCK_CHANGE:
      startExecutionTime()
      // IMPORTANT NOTE: the first time a type of block is dragged on the workspace
      // that particular block will have the SAME ID of the relative toolbox block
      // thus, always check for wType before modifying blocks in state
      if (wType !== 'TB' && STATE.exerciseBlocks[block.id]) {
        STATE.exerciseBlocks[block.id].inputList = block.inputList
      }
      handleChangeEvent(evt, block, wType)
      break
    case Blockly.Events.BLOCK_DRAG:
      startExecutionTime()
      if (evt.isStart) handleBlockDragStart(evt, workspace, block)
      else if (!_.isNil(block)) handleBlockDragEnd(evt, block)
      break
    case Blockly.Events.BLOCK_DELETE:
      handleBlockDelete(evt, evt.oldJson)
      STATE.usedBlocks = getUsedBlocks(startBlock, musicStartBlocks)
      break
    case Blockly.Events.BLOCK_MOVE:
      handleBlockMoveInState(evt, block)
      if ((!_.isNil(block) && block.type === 'start') || (wType === 'WS')) {
        STATE.usedBlocks = getUsedBlocks(startBlock, musicStartBlocks)
      }
      break
    default:
  }
}

function handleExecution (success) {
  const newExecution = {
    type: 'execute',
    ts: Date.now(),
    suc: success
  }

  STATE.actions.push(newExecution)
}

function saveAttemptNumOfActions () {
  STATE.attemptActions[STATE.attempt] = STATE.actions.length
  STATE.attempt += 1
}

function start () {
  startPlanningTime()
}

function parseInputList (type, inputList) {
  let result = ''
  if (type === 'repeat') {
    const times = inputList[0].fieldRow[1].getValue()
    result = '(' + times + ')'
  }
  return result
}

function getCodeStructure (block) {
  const type = translateBlocks[block.type] || block.type
  const name = type + parseInputList(block.type, block.inputList)
  const childBlocks = block.children || []
  const children = []
  for (const conn in childBlocks) {
    const child = childBlocks[conn]
    children.push({
      nested: conn,
      block: getCodeStructure(STATE.exerciseBlocks[child])
    })
  }
  const result = { type, name, children }
  return result
}

function pushCurrentCodeStructure (success) {
  const mainBlock = _.find(STATE.exerciseBlocks, { type: 'start' })
  const topBlocks = _.filter(STATE.exerciseBlocks, block => {
    return !block.deleted && block.top && (block.type !== 'start')
  })
  const codeStructure = { main: null, others: [] }
  if (!_.isNil(mainBlock)) {
    codeStructure.main = getCodeStructure(mainBlock)
  }
  for (const topBlock of topBlocks) {
    codeStructure.others.push(getCodeStructure(topBlock))
  }
  STATE.codes.push({ cod: codeStructure, suc: success })
}

function clickExecuteButton () {
  startExecutionTime()
}

function execute (success) {
  handleExecution(success)
  saveAttemptNumOfActions()
  if (success) STATE.success = true
  else STATE.numOfFailures += 1

  pushCurrentCodeStructure(success)

  return STATE.attempt
}

function end () {
  stopExecutionTime()
  return STATE
}

module.exports = {
  codeStructureToString,
  clickExecuteButton,
  resetState,
  handleBlocklyEvent,
  start,
  execute,
  end
}
