import React from 'react'
import PropTypes from 'prop-types'
import Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import { ExclamationTriangleFill } from 'react-bootstrap-icons'
import blocklySetup from './blocklySetup'

const _ = require('lodash')
const twoDCodingUtils = require('./2dCodingUtils')
const navigationUtils = require('./navigationUtils')
const navigationGameFunctions = require('./navigationGameFunctions')
const blocklyEventCollector = require('./blocklyEventCollector')
const stateUtils2d = require('./stateUtils2d')
const i18n = require('./i18n')

// Xml representation of the start block (present by default in all workspaces)
const startBlockXml = '<xml xmlns="https://developers.google.com/blockly/xml"><block type="start"></block></xml>'

const DEFAULT_STATE = {
  // Exercise data, passed as prop from App.js
  blocklyData: null,
  // Code blocks used by the user vs. ideal blocks required by the exercise
  blocks: {
    ideal: -1,
    used: -1
  },
  // Dimensions of the canvas (adapted to map dimensions)
  canvasDim: {
    map: {
      width: -1,
      height: -1
    }
  },
  mapStateObj: null,
  mapStateObjStr: '',
  // Array of feedback messages to show on screen
  feedbacks: []
}

class Blockly2d extends React.Component {
  constructor (props) {
    super(props)
    this.state = _.cloneDeep(DEFAULT_STATE)

    this.setupWorkspace = this.setupWorkspace.bind(this)
    this.initializeWorkspaceEvents = this.initializeWorkspaceEvents.bind(this)
    this.startExercise = this.startExercise.bind(this)
    this.executeUserCode = this.executeUserCode.bind(this)
    this.setUsedBlocks = this.setUsedBlocks.bind(this)
    this.handleSuccess = this.handleSuccess.bind(this)
    this.handleFailure = this.handleFailure.bind(this)
    this.printConsoleFeedback = this.printConsoleFeedback.bind(this)
  }

  // This check is to avoid attempting to render a page when no exercise is provided
  // or rerendering a page when the same exercise is provided
  componentDidUpdate (prevProps) {
    if (_.isNil(prevProps.blocklyData) || prevProps.blocklyData.url !== this.props.blocklyData.url) {
      this.resetState()
    }
    const feedbackDiv = document.getElementById('feedbackDiv')
    if (!_.isNil(feedbackDiv)) feedbackDiv.scrollTop = feedbackDiv.scrollHeight
  }

  // Reset page, load new exercise
  resetState () {
    const newState = _.cloneDeep(DEFAULT_STATE)
    newState.blocklyData = this.props.blocklyData
    this.setState(newState, this.loadExercise)
  }

  // Initialize exercise
  loadExercise () {
    stateUtils2d.resetState(this.props.blocklyData)
    const canvasDim = twoDCodingUtils.calcCanvasDim(this.props.blocklyData, twoDCodingUtils.canvasDimensions)
    const mapStateObj = navigationUtils.getStateObjFromMap(this.props.blocklyData.map)
    const mapStateObjStr = JSON.stringify(mapStateObj)

    const htmlInstructions = i18n('htmlInstr.' + this.props.blocklyData.htmlInstr, 'en-GB')
    const feedbacks = [{
      html: htmlInstructions,
      type: 'instructions'
    }]

    this.setState({
      canvasDim: canvasDim,
      mapStateObj,
      mapStateObjStr,
      blocks: {
        ideal: this.props.blocklyData.idealBlocks,
        used: -1
      },
      feedbacks: feedbacks
    }, this.startExercise)
  }

  startExercise () {
    // Load blocks if needed
    blocklySetup.init()
    twoDCodingUtils.start(this.props.blocklyData)

    // Setup blockly workspace
    this.setupWorkspace()
    stateUtils2d.start()
  }

  // Update number of blocks used by the user
  setUsedBlocks (num) {
    this.setState({
      blocks: {
        ideal: this.state.blocks.ideal,
        used: num
      }
    })
  }

  // This sets up blockly
  setupWorkspace () {
    const toolbox = { kind: 'flyoutToolbox', contents: [] }
    for (const blockType of this.state.blocklyData.instructions) {
      toolbox.contents.push({ kind: 'block', type: blockType })
    }

    const workspace = Blockly.inject('blocklyDiv', {
      toolbox,
      trashcan: true,
      move: {
        scrollbars: {
          horizontal: false,
          vertical: true
        },
        drag: true,
        wheel: true
      }
    })

    this.initializeWorkspaceEvents(workspace)

    // Initialize start block or default code (see exercises.json)
    let dom
    if (this.state.blocklyData.defaultCode) {
      dom = Blockly.Xml.textToDom(this.state.blocklyData.defaultCode)
    } else dom = Blockly.Xml.textToDom(startBlockXml)
    Blockly.Xml.domToWorkspace(dom, workspace)

    // Lock start block in place
    const startBlock = workspace.getBlocksByType('start')[0]
    startBlock.setMovable(false)

    this.setState({ workspace: workspace })
  }

  // This initializes the data collection about users' interactions
  // with blockly for the workspace (WS) and toolbox (TB)
  initializeWorkspaceEvents (workspace) {
    const flyoutWorkspace = workspace.getFlyout().getWorkspace()

    const eventCollectFunction = evt => {
      return blocklyEventCollector.collectWorkspaceEvents(Blockly, 'WS', workspace, stateUtils2d.handleBlocklyEvent, this, evt)
    }
    const flyoutEventCollectFunction = evt => {
      return blocklyEventCollector.collectWorkspaceEvents(Blockly, 'TB', flyoutWorkspace, stateUtils2d.handleBlocklyEvent, this, evt)
    }
    workspace.getFlyout().getWorkspace().addChangeListener(flyoutEventCollectFunction)
    workspace.addChangeListener(eventCollectFunction)
  }

  // Execute users' programs
  executeUserCode () {
    stateUtils2d.clickExecuteButton()

    let code = javascriptGenerator.workspaceToCode(this.state.workspace)

    try {
      // This 'gf' variable will be used by functions defined in navigationGameFunctions.js
      /* eslint-disable no-unused-vars */
      const gf = navigationGameFunctions.getGameFunctions()
      /* eslint-enable no-unused-vars */

      // Note: it is necessary to invoke 'result;' as a final statement
      // in order to get the return values from eval
      code = 'let mapData = JSON.parse(\'' +
        this.state.mapStateObjStr +
        '\');\n' +
        code +
        '\n; const result = {operations, success}; result;'

      console.log('###### User JavaScript code #######\n' + code)

      // Unfortunately, eval is inevitable
      /* eslint-disable no-eval */
      const res = eval(code)
      /* eslint-enable no-eval */

      const attempts = stateUtils2d.execute(res.success)

      if (res.success) {
        // Successful exercise
        this.handleSuccess()
      } else {
        // No wall hits but incomplete program
        this.handleFailure(attempts)
      }
    } catch (err) {
      // Wall hits or other error
      console.error(err)
      const attempts = stateUtils2d.execute(false)
      this.handleFailure(attempts)
    }
  }

  handleSuccess () {
    const finalState = stateUtils2d.end()

    const currentFeedbacks = this.state.feedbacks
    const feedbackHtml = i18n('feedbackSuccessHtml', 'en-GB')
    currentFeedbacks.push({
      html: feedbackHtml,
      type: 'instructions'
    })
    this.setState({
      feedback: currentFeedbacks
    })

    this.printConsoleFeedback(finalState)
  }

  handleFailure (attempts) {
    const currentAttempt = attempts - 1
    const currentFeedbacks = this.state.feedbacks
    const feedbackTitle = i18n('feedback0', 'en-GB') + currentAttempt
    const feedbackText = i18n('feedback1', 'en-GB')
    currentFeedbacks.push({
      title: feedbackTitle,
      text: feedbackText,
      type: 'error'
    })
    this.setState({
      feedback: currentFeedbacks
    })
  }

  printConsoleFeedback (state) {
    const planningTime = state.executionStart - state.planningStart
    const executionTime = state.executionEnd - state.executionStart
    const totalTime = planningTime + executionTime
    const attempts = state.numOfFailures + 1
    const blocks = state.usedBlocks + '/' + state.idealBlocks
    // Note: all programs start with 'b' to indicate the 'start' block
    // 'b' is also used to indicate 'backward' block instructions (but these will never be the first block of the program)
    const lastCodeStr = stateUtils2d.codeStructureToString(state.codes[state.codes.length - 1].cod.main)

    let consoleStr = '***** Console feedback ******\n'
    consoleStr += 'User total time was ' + totalTime + 'ms \n'
    consoleStr += 'User took ' + attempts + ' attempts\n'
    consoleStr += 'User used ' + blocks + ' blocks\n'
    consoleStr += 'Last program: ' + lastCodeStr

    // ... add other console feedback if you need it
    // 'state' object is defined in stateUtils2d.js
    console.log(consoleStr)
  }

  render () {
    return (
      <div>
        <Row style={{ height: '700px' }}>
          <Col xs={6}>
            <Row>
              <canvas id='mapCanvas' style={{ width: this.state.canvasDim.map.width, height: this.state.canvasDim.map.height, marginLeft: '50px' }}></canvas>
            </Row>
            <Row>
              <Button variant='primary' onClick={this.executeUserCode} style={{ width: '480px', marginLeft: '50px' }}>
                Execute
              </Button>
            </Row>
          </Col>
          <Col xs={6}>
            <Row style={{ height: '100px' }}>
              <Col xs={12} className='bordered'>
                <div id='feedbackDiv' style={{ height: '100px', overflowY: 'scroll', overflowX: 'hidden', fontSize: 'large' }}>
                {this.state.feedbacks.map((feedback, idx) => {
                  if (feedback.type === 'instructions') {
                    return (
                      <Row key={idx} className='align-middle' style={{ marginTop: '10px' }}>
                        <Col xs={12}>
                           <div dangerouslySetInnerHTML={{ __html: feedback.html }}></div>
                        </Col>
                      </Row>
                    )
                  }
                  return (
                    <Row key={idx} className='align-middle' style={{ marginBottom: '10px' }}>
                      {idx > 0 && <hr/>}
                      <Col xs={12}>
                        <ExclamationTriangleFill className='text-warning' size={40} />
                        {feedback.title}: <strong>{feedback.text}</strong>
                      </Col>
                    </Row>
                  )
                })}
                </div>
              </Col>
            </Row>
            <Row style={{ marginTop: '5px' }}>
              <Col xs={12} className='bordered'>
                {i18n('blocks', 'en-GB')} {this.state.blocks.used} / {this.state.blocks.ideal}
              </Col>
            </Row>
            <Row style={{ marginTop: '5px' }}>
              <Col xs={12} style={{ padding: '0px' }}>
                <div id='blocklyDiv' style={{ height: '500px' }}></div>
              </Col>
            </Row>

          </Col>
        </Row>

      </div>
    )
  }
}

Blockly2d.propTypes = {
  blocklyData: PropTypes.object
}

export default Blockly2d
