const Grow = require('Grow.js');
const raspio = require('raspi-io');
const five = require('johnny-five');

// Create a new board object
const board = new five.Board({
  io: new raspio()
});

// When board emits a 'ready' event run this start function.
board.on('ready', function start() {
  // Declare needed variables.
  var emit_data;

  try {
    var multi = new five.Multi({
      controller: 'BME280'
    });
  } catch(err) {
    console.log('BME280 sensor not connected. Emitting random data.');
    this.emit('message', 'BME280 sensor not connected.');
  }

  var growHub = new Grow({
    uuid: '732db76b-7d92-4c6c-995f-ec0d34acf6f2',
    token: '5qL8nsFpqDf7m4cY9u6uFoXDKMfGJHf2',

    component: 'ClimateSensor',

    properties: {
      interval: 6000,
      growfile: {
        targets: {
          temperature: {
            min: 10,
            max: 25
          },
          humidity: {
            min: 10,
            max: 80
          },
        }
      }
    },

    start: function () {
      console.log('Grow-Hub initialized.');

      var interval = this.get('interval');

      emit_data = setInterval(()=> {
        this.temp_data();
        this.hum_data();
      }, interval);

      if (multi) {
        let growfile = this.get('growfile');
        this.registerTargets(growfile.targets);
      }
    },

    stop: function () {
      clearInterval(emit_data);
      this.removeAllListeners();
      this.removeTargets();
    },

    restart: function () {
      this.stop();
      this.start();
    },

    temp_data: function () {
      if (multi) {
        var currentTemp = multi.thermometer.celsius;

        this.emit('temperature', currentTemp);

        console.log('Temperature: ' + currentTemp);
      } else {
        this.emit('temperature', Math.random());
      }
    },

    hum_data: function () {
      if (multi) {
        var currentHumidity = multi.hygrometer.relativeHumidity;

        this.emit('humidity', currentHumidity);

        console.log('Humidity: ' + currentHumidity);
      } else {
        this.emit('humidity', Math.random());
      }
    }
  });

  growHub.connect({
    host: 'grow.commongarden.org',
    port: 443,
    ssl: true
  });
});
