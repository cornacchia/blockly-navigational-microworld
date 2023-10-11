import Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript'
const blocks = require('./blocks.json')
const _ = require('lodash')

// This function checks if a block is in the 'main' program branch
// It is used to avoid executing blocks that are not connected to the "start" block
function checkIfInMainBranch (block) {
  if (block.type === 'start') return true
  const parent = block.getParent()
  if (_.isNil(parent)) return false
  return checkIfInMainBranch(parent)
}

// This is always the first block to be executed
// It resets the variables used to apply the program to the navigational puzzle
function start (block) {
  const code = 'let operations = []; let res = null; let success = false;'
  return code
}

// 'gf' stands for 'game functions'
// it's an instantiation of the object returned by navigationGameFunctions.js
// the game functions are implemented in a functional way for clarity
// in other words we try not to rely on side effects
function forward (block) {
  const id = block.id
  let code = ''
  if (!checkIfInMainBranch(block)) return code

  code += 'res = gf.move("f", "' + id + '", mapData, operations);\n'
  code += 'mapData = res.data;\n'
  code += 'operations = res.operations;\n'
  code += 'success = res.success;\n'
  return code
}

function backward (block) {
  const id = block.id
  let code = ''
  if (!checkIfInMainBranch(block)) return code

  code += 'res = gf.move("b", "' + id + '", mapData, operations);\n'
  code += 'mapData = res.data;\n'
  code += 'operations = res.operations;\n'
  code += 'success = res.success;\n'
  return code
}

function turnLeft (block) {
  const id = block.id
  let code = ''
  if (!checkIfInMainBranch(block)) return code

  code += 'res = gf.move("tl", "' + id + '", mapData, operations);\n'
  code += 'mapData = res.data;\n'
  code += 'operations = res.operations;\n'
  code += 'success = res.success;\n'
  return code
}

function turnRight (block) {
  const id = block.id
  let code = ''
  if (!checkIfInMainBranch(block)) return code

  code += 'res = gf.move("tr", "' + id + '", mapData, operations);\n'
  code += 'mapData = res.data;\n'
  code += 'operations = res.operations;\n'
  code += 'success = res.success;\n'
  return code
}

function repeat (block) {
  // Read the number of repetitions selected in the block's dropdown menu
  const times = block.getFieldValue('TIMES') || '0'
  // Get the code nested in the "repeat" block's inner scope
  const branch0 = javascriptGenerator.statementToCode(block, 'DO')

  let code = ''
  if (!checkIfInMainBranch(block)) return code

  code += 'for (let i = 0; i < ' + times + '; i++) {\n' + branch0 + '\n};\n'
  return code
}

function pickFlower (block) {
  const id = block.id
  let code = ''
  if (!checkIfInMainBranch(block)) return code

  code += 'res = gf.pick("' + id + '", mapData, operations);\n'
  code += 'mapData = res.data;\n'
  code += 'operations = res.operations;\n'
  code += 'success = res.success;\n'
  return code
}

function putInVase (block) {
  const id = block.id
  let code = ''
  if (!checkIfInMainBranch(block)) return code

  code += 'res = gf.put("' + id + '", mapData, operations);\n'
  code += 'mapData = res.data;\n'
  code += 'operations = res.operations;\n'
  code += 'success = res.success;\n'
  return code
}

function jumpForward (block) {
  const id = block.id
  let code = ''
  if (!checkIfInMainBranch(block)) return code

  code += 'res = gf.move("jf", "' + id + '", mapData, operations);\n'
  code += 'mapData = res.data;\n'
  code += 'operations = res.operations;\n'
  code += 'success = res.success;\n'
  return code
}

function init () {
  // Avoid initializing blocks more than once
  // note: this function is called at each exercise initialization
  if (!_.isNil(Blockly.Blocks.flag_block)) return

  // Read block definitions from json file
  Blockly.defineBlocksWithJsonArray(blocks)

  // Assign functions to blocks
  javascriptGenerator.start = start
  javascriptGenerator.forward = forward
  javascriptGenerator.backward = backward
  javascriptGenerator.turn_right = turnRight
  javascriptGenerator.turn_left = turnLeft
  javascriptGenerator.repeat = repeat
  javascriptGenerator.pick_collectible = pickFlower
  javascriptGenerator.put_down_collectible = putInVase
  javascriptGenerator.jump_forward = jumpForward
}

const exportObj = {
  init
}

export default exportObj
