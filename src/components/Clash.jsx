var React = require('react');
var _ = require('lodash');

var Tiles = require('./Tiles.jsx');
var Ammos = require('./Ammos.jsx');
var Players = require('./Players.jsx');
var Stats = require('./Stats.jsx');
var Shoots = require('./Shoots.jsx');

var deepSetState = require('../mixins/deepSetState.js');

var ClashJS = require('../clashjs/ClashCore.js');

var playerObjects = require('../Players.js');
var playerArray = _.shuffle(_.map(playerObjects, el => el));

var Clash = React.createClass({
  mixins: [
    deepSetState
  ],

  getInitialState() {
    this.ClashJS = new ClashJS(playerArray, this.handleEvent);
    return {
      clashjs: this.ClashJS.getState(),
      shoots: [],
      speed: 150,
      winners: playerArray.map(() => 0)
    };
  },

  componentDidMount() {
    this.nextTurn();
  },

  newGame() {
    this.ClashJS.getState().playerStates.forEach((player, index) => {
      if (player.isAlive) {
        let newWinners = this.state.winners;
        newWinners[index]++;

        this.setState({
          winners: newWinners
        });
      }
    });

    window.setTimeout(() => {
      this.ClashJS = new ClashJS(playerArray, this.handleEvent);
      this.setState({
        clashjs: this.ClashJS.getState(),
        shoots: [],
        speed: 150
      }, this.nextTurn);
    }, 1000);
  },

  nextTurn() {
    var alivePlayerCount = this.ClashJS.getState().playerStates.reduce((result, el) => {
      return el.isAlive ? (result + 1) : result;
    }, 0);

    if (alivePlayerCount < 2) {
      this.newGame();
      return;
    }

    window.setTimeout(() => {
      this.setState({
        clashjs: this.ClashJS.nextPly(),
        speed: this.state.speed > 15 ? parseInt(this.state.speed * 0.98, 10) : 15
      }, this.nextTurn);
    }, this.state.speed);
  },

  handleEvent(evt, data) {
    console.warn(evt, data, this.state.shoots);

    if (evt === 'SHOOT') {
      let newShoots = this.state.shoots;

      newShoots.push({
        direction: data.direction,
        origin: data.origin.slice(),
        time: new Date().getTime()
      });

      this.setState({
        shoots: newShoots
      });
    }
  },

  handleClick() {
    this.setState({
      clashjs: this.ClashJS.nextStep(),
      speed: Math.max(parseInt(this.state.speed * 0.75, 10), 1)
    });
  },

  render() {
    var {clashjs, shoots, winners} = this.state;
    var {gameEnvironment, playerStates, playerInstances} = clashjs;

    return (
      <div className='clash' onClick={this.handleClick}>
        <Tiles
          gridSize={gameEnvironment.gridSize} />
        <Shoots
          shoots={shoots.slice()}
          gridSize={gameEnvironment.gridSize} />
        <Ammos
          gridSize={gameEnvironment.gridSize}
          ammoPosition={gameEnvironment.ammoPosition} />
        <Players
          gridSize={gameEnvironment.gridSize}
          playerInstances={playerInstances}
          playerStates={playerStates} />

        <Stats
          playerInstances={playerInstances}
          playerStates={playerStates}
          winners={winners} />

      </div>
    );
  }

});

module.exports = Clash;
