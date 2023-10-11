import React from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Blockly2d from './Blockly2d'

const _ = require('lodash')
const exercises = require('./exercises')

class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      currentExercise: '',
      currentExerciseObj: null
    }
  }

  componentDidMount () {
    // Change the name of the exercise to see other examples
    // see exercises.js
    this.selectExercise('blockly2d:5')
  }

  selectExercise (url) {
    const exerciseObj = _.find(exercises, ex => { return ex.url === url })
    this.setState({
      currentExercise: url,
      currentExerciseObj: exerciseObj
    })
  }

  render () {
    return (
      <div style={{ width: '100%' }}>
        <Row>
          <Col>
            <Blockly2d blocklyData={this.state.currentExerciseObj} />
          </Col>
        </Row>
      </div>
    )
  }
}

export default App;
