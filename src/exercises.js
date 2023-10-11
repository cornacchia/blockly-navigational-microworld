/**
 * 'instructions' are the blocks available to solve an exercise (see blocks.json and navigationGameFunctions.js)
 * 'htmlInstr' point to i18n strings (see i18nEn.json)
 * 'idealBlocks' is the number of blocks for an optimal solution to the exercise
 * 'defaultCode': xml representation of a default program for this exercise (used for debugging exercises)
 * 'map' represents the exercise map as a 2d array
 * 0 -> wall / obstacle tile
 * 1 -> path tile (traversable by robot)
 * 2 -> goal tile
 * 3 -> robot facing down
 * 4 -> robot facing right
 * 5 -> robot facing up
 * 6 -> robot facting left
 * 7 -> intermediate goal
 */


const exercises2d = [
  {
    url: 'blockly2d:0',
    instructions: ['forward', 'backward', 'turn_left', 'turn_right'],
    map: [
      ['0', '0', '0', '0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0', '0', '0', '0'],
      ['0', '0', '0', '2', '0', '0', '0', '0'],
      ['0', '0', '0', '1', '0', '0', '0', '0'],
      ['0', '0', '0', '1', '0', '0', '0', '0'],
      ['0', '0', '0', '1', '0', '0', '0', '0'],
      ['0', '0', '0', '5', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0', '0', '0', '0']
    ],
    htmlInstr: 'simpleNavigation',
    idealBlocks: 5
  },
  {
    url: 'blockly2d:1',
    instructions: ['forward', 'backward', 'turn_left', 'turn_right'],
    map: [
      ['0', '0', '0', '0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0', '3', '0', '0'],
      ['0', '0', '0', '0', '0', '1', '0', '0'],
      ['0', '0', '0', '0', '0', '1', '0', '0'],
      ['0', '0', '0', '0', '0', '2', '0', '0'],
      ['0', '0', '0', '0', '0', '0', '0', '0']
    ],
    htmlInstr: 'simpleNavigation',
    idealBlocks: 4
  },
  {
    url: 'blockly2d:2',
    instructions: ['forward', 'backward', 'turn_left', 'turn_right'],
    map: [
      ['0', '0', '0', '0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '2', '0', '0', '0'],
      ['0', '0', '0', '0', '1', '0', '0', '0'],
      ['0', '0', '4', '1', '1', '0', '0', '0'],
      ['0', '0', '0', '0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0', '0', '0', '0']
    ],
    htmlInstr: 'simpleNavigation',
    idealBlocks: 6
  },
  {
    url: 'blockly2d:3',
    instructions: ['forward', 'backward', 'turn_left', 'turn_right'],
    map: [
      ['0', '0', '0', '0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0', '0', '0', '0'],
      ['0', '0', '2', '1', '0', '0', '0', '0'],
      ['0', '0', '0', '1', '0', '0', '0', '0'],
      ['0', '0', '0', '1', '1', '6', '0', '0'],
      ['0', '0', '0', '0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0', '0', '0', '0']
    ],
    htmlInstr: 'simpleDebug',
    idealBlocks: 8,
    defaultCode: '<xml xmlns="https://developers.google.com/blockly/xml"><block type="start"><next><block type="forward"><next><block type="forward"><next><block type="turn_left"><next><block type="forward"><next><block type="forward"><next><block type="turn_right"><next><block type="forward"></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></xml>'
  },
  {
    url: 'blockly2d:4',
    instructions: ['forward', 'backward', 'turn_left', 'turn_right', 'repeat'],
    map: [
      ['0', '0', '0', '0', '0', '0', '0', '0'],
      ['0', '4', '1', '1', '1', '1', '1', '0'],
      ['0', '0', '0', '0', '0', '0', '2', '0'],
      ['0', '0', '0', '0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0', '0', '0', '0']
    ],
    htmlInstr: 'simpleNavigation',
    idealBlocks: 5
  },
  {
    url: 'blockly2d:5',
    instructions: ['forward', 'backward', 'turn_left', 'turn_right', 'repeat'],
    map: [
      ['0', '0', '0', '0', '0', '0', '0', '0'],
      ['0', '4', '1', '1', '1', '1', '7', '0'],
      ['0', '1', '0', '0', '0', '0', '1', '0'],
      ['0', '1', '0', '0', '0', '0', '1', '0'],
      ['0', '1', '0', '0', '0', '0', '1', '0'],
      ['0', '1', '0', '0', '0', '0', '1', '0'],
      ['0', '2', '1', '1', '1', '1', '7', '0'],
      ['0', '0', '0', '0', '0', '0', '0', '0']
    ],
    htmlInstr: 'navigationMiddleGoal',
    idealBlocks: 5
  }
]

module.exports  = exercises2d
