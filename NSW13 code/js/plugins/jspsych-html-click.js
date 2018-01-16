/**
 * jspsych-html-click (modified from button-press plugin by Jessica Lee 2018)
 * Original plugin by Josh de Leeuw
 *
 * plugin for displaying a stimulus, updating stimulus based on location of mouse click
 *
 * documentation: docs.jspsych.org
 *
 **/

jsPsych.plugins["html-click"] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'html-click',
    description: '',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Stimulus',
        default: undefined,
        description: 'The HTML string to be displayed'
      },
      choices: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        pretty_name: 'Choices',
        default: [],
        array: true,
        description: 'The labels for the buttons.'
      },
      button_html: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button html',
        default: '<button class="jspsych-btn">%choice%</button>',
        array: true,
        description: 'The html of the button. Can create own style.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed under the button.'
      },
      stimulus_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus duration',
        default: null,
        description: 'How long to hide the stimulus.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show the trial.'
      },
      margin_vertical: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Margin vertical',
        default: '50px', // originally 0
        description: 'The vertical margin of the button.'
      },
      margin_horizontal: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Margin horizontal',
        default: '8px',
        description: 'The horizontal margin of the button.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, then trial will end when user responds.'
      },
    }
  }

  plugin.trial = function(display_element, trial) {

    // display stimulus
    display_element.innerHTML = '<div class="clickable" id="jspsych-html-click-stimulus">'+trial.stimulus+'</div>'; // add clickable class to stimulus

    // add event listener
    display_element.addEventListener('click', getClickPos, false);

    function getClickPos(e) {
      if (getClickNow === true) {
                var x = e.clientX - display_element.offsetLeft;
        var y = e.clientY - display_element.offsetTop;
        ycoord = y;
        xcoord = x
        colIdx = -1;
        rowIdx = -1;
        if (xcoord < (grid.width/grid.across)*1+1) {
          colIdx = 0;
        } else if (xcoord < (grid.width/grid.across)*2+1 && xcoord >= (grid.width/grid.across)*1) {
          colIdx = 1;
        } else if (xcoord < (grid.width/grid.across)*3+1 && xcoord >= (grid.width/grid.across)*2) {
          colIdx = 2;
        } else if (xcoord < (grid.width/grid.across)*4+1 && xcoord >= (grid.width/grid.across)*3) {
          colIdx = 3;
        } else if (xcoord < (grid.width/grid.across)*5+1 && xcoord >= (grid.width/grid.across)*4) {
          colIdx = 4;
        } else if (xcoord < (grid.width/grid.across)*6+1 && xcoord >= (grid.width/grid.across)*5) {
          colIdx = 5;
        }
        if (ycoord < (grid.height/grid.down)*1+1) {
          rowIdx = 0;
        } else if (ycoord < (grid.height/grid.down)*2+1 && ycoord >= (grid.height/grid.down)*1) {
          rowIdx = 1;
        } else if (ycoord < (grid.height/grid.down)*3+1 && ycoord >= (grid.height/grid.down)*2) {
          rowIdx = 2;
        } else if (ycoord < (grid.height/grid.down)*4+1 && ycoord >= (grid.height/grid.down)*3) {
          rowIdx = 3;
        } else if (ycoord < (grid.height/grid.down)*5+1 && ycoord >= (grid.height/grid.down)*4) {
          rowIdx = 4;
        } else if (ycoord < (grid.height/grid.down)*6+1 && ycoord >= (grid.height/grid.down)*5) {
          rowIdx = 5;
        }
        clickedOn = true;

        if (rowIdx > -1 && colIdx > -1) { // don't register mouseclicks outside grid

          if (sampGroup === 'random') {

            // make new grid stimulus, fade out unselected cards
            var newPattern = [grid.faded, grid.faded, grid.faded, grid.faded, grid.faded, grid.faded];
            grid.fadedNew = fillArray('./img/faded_card_small.jpg', grid.across);
            grid.fadedNew[colIdx] = './img/marked_card_small.jpg';
            newPattern[rowIdx] = grid.fadedNew;
            var new_grid_stimulus = jsPsych.plugins['vsl-grid-scene'].generate_stimulus(newPattern, image_size);
            // update stimulus display
            trial.stimulus = [new_grid_stimulus + '<center><p>Please choose a card by clicking on it</p></center>'];
            display_element.innerHTML = '<div class="clickable" id="jspsych-html-click-stimulus">'+trial.stimulus+'</div>'; 

            //display buttons
            var buttons = [];
            if (Array.isArray(trial.button_html)) {
              if (trial.button_html.length == trial.choices.length) {
                buttons = trial.button_html;
              } else {
                console.error('Error in html-click plugin. The length of the button_html array does not equal the length of the choices array');
              }
            } else {
              for (var i = 0; i < trial.choices.length; i++) {
                buttons.push(trial.button_html);
              }
            }
            display_element.innerHTML += '<center><div id="jspsych-html-click-btngroup"></div></center>'; //centered JL
            for (var i = 0; i < trial.choices.length; i++) {
              var str = buttons[i].replace(/%choice%/g, trial.choices[i]);
              display_element.querySelector('#jspsych-html-click-btngroup').insertAdjacentHTML('beforeend',
                '<div class="jspsych-html-click-button" style="display: inline-block; margin:'+trial.margin_vertical+' '+trial.margin_horizontal+'" id="jspsych-html-click-button-' + i +'" data-choice="'+i+'">'+str+'</div>');
              display_element.querySelector('#jspsych-html-click-button-' + i).addEventListener('click', function(e){
                var choice = e.currentTarget.getAttribute('data-choice'); // don't use dataset for jsdom compatibility
                after_response(choice);
              });
            }

          } else if (sampGroup === 'helpful') {

            if (rowIdx == row[clickCounter] && colIdx == col[clickCounter]) {
              // make new grid stimulus, fade out unselected cards
              var newPattern = [grid.faded, grid.faded, grid.faded, grid.faded, grid.faded, grid.faded];
              grid.fadedNew = fillArray('./img/faded_card_small.jpg', grid.across);
              grid.fadedNew[colIdx] = './img/marked_card_small.jpg';
              newPattern[rowIdx] = grid.fadedNew;
              var new_grid_stimulus = jsPsych.plugins['vsl-grid-scene'].generate_stimulus(newPattern, image_size);
              // update stimulus display
              trial.stimulus = [new_grid_stimulus + '<center><p>Please choose a card by clicking on it</p></center>'];
              display_element.innerHTML = '<div class="clickable" id="jspsych-html-click-stimulus">'+trial.stimulus+'</div>'; 

              //display buttons
              var buttons = [];
              if (Array.isArray(trial.button_html)) {
                if (trial.button_html.length == trial.choices.length) {
                  buttons = trial.button_html;
                } else {
                  console.error('Error in html-click plugin. The length of the button_html array does not equal the length of the choices array');
                }
              } else {
                for (var i = 0; i < trial.choices.length; i++) {
                  buttons.push(trial.button_html);
                }
              }
              display_element.innerHTML += '<center><div id="jspsych-html-click-btngroup"></div></center>'; //centered JL
              for (var i = 0; i < trial.choices.length; i++) {
                var str = buttons[i].replace(/%choice%/g, trial.choices[i]);
                display_element.querySelector('#jspsych-html-click-btngroup').insertAdjacentHTML('beforeend',
                  '<div class="jspsych-html-click-button" style="display: inline-block; margin:'+trial.margin_vertical+' '+trial.margin_horizontal+'" id="jspsych-html-click-button-' + i +'" data-choice="'+i+'">'+str+'</div>');
                display_element.querySelector('#jspsych-html-click-button-' + i).addEventListener('click', function(e){
                  var choice = e.currentTarget.getAttribute('data-choice'); // don't use dataset for jsdom compatibility
                  after_response(choice);
                });
              }

            } // if clicked on marked card
          } // if random
        } //if row/col >-1


        //show prompt if there is one
        if (trial.prompt !== null) {
          display_element.insertAdjacentHTML('beforeend', trial.prompt);
        }

        // function to handle responses by the subject
        function after_response(choice) {

        // measure rt
        var end_time = Date.now();
        var rt = end_time - start_time;
        response.button = choice;
        response.rt = rt;

        // after a valid response, the stimulus will have the CSS class 'responded'
        // which can be used to provide visual feedback that a response was recorded
        display_element.querySelector('#jspsych-html-click-stimulus').className += ' responded';

        // disable all the buttons after a response
        var btns = document.querySelectorAll('.jspsych-html-click-button button');
        for(var i=0; i<btns.length; i++){
          //btns[i].removeEventListener('click');
          btns[i].setAttribute('disabled', 'disabled');
        }

        if (trial.response_ends_trial) {
          end_trial();
        }

        // save data
        var ycoords = [];
        var xcoords = [];
        var colIdxs = [];
        var rowIdxs = [];
        ycoords[clickCounter] = ycoord;
        xcoords[clickCounter] = xcoord;
        colIdxs[clickCounter] = colIdx;
        rowIdxs[clickCounter] = rowIdx;
        jsPsych.data.addProperties({
          xcoord: xcoord,
          ycoord: ycoord,
          rowIdx: rowIdx,
          colIdx: colIdx
        });

        clickCounter = clickCounter + 1;

        //if (sampGroup === 'helpful') {
          getClickNow = false; // this ends the trial
        //}

    };

        
      } else if (getClickNow === false) {
        getClickNow = true;
      }
    }
    /////////////////////////////////////////////////////////////////////////////////////////////

    //display buttons
    var buttons = [];
    if (Array.isArray(trial.button_html)) {
      if (trial.button_html.length == trial.choices.length) {
        buttons = trial.button_html;
      } else {
        console.error('Error in html-click plugin. The length of the button_html array does not equal the length of the choices array');
      }
    } else {
      for (var i = 0; i < trial.choices.length; i++) {
        buttons.push(trial.button_html);
      }
    }
    display_element.innerHTML += '<center><div id="jspsych-html-click-btngroup"></div></center>'; //centered JL
    for (var i = 0; i < trial.choices.length; i++) {
      var str = buttons[i].replace(/%choice%/g, trial.choices[i]);
      display_element.querySelector('#jspsych-html-click-btngroup').insertAdjacentHTML('beforeend',
        '<div class="jspsych-html-click-button" style="display: inline-block; margin:'+trial.margin_vertical+' '+trial.margin_horizontal+'" id="jspsych-html-click-button-' + i +'" data-choice="'+i+'">'+str+'</div>');
      display_element.querySelector('#jspsych-html-click-button-' + i).addEventListener('click', function(e){
        var choice = e.currentTarget.getAttribute('data-choice'); // don't use dataset for jsdom compatibility
        after_response(choice);
     });
    }

    //show prompt if there is one
    if (trial.prompt !== null) {
      display_element.insertAdjacentHTML('beforeend', trial.prompt);
    }

    // store response
    var response = {
      rt: null,
      button: null
    };

    // start time
    var start_time = 0;

    // function to end trial when it is time
    function end_trial() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // gather the data to store for the trial
      var trial_data = {
        "rt": response.rt,
        "stimulus": trial.stimulus,
        "button_pressed": response.button
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // start timing
    start_time = Date.now();

    // hide image if timing is set
    if (trial.stimulus_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        display_element.querySelector('#jspsych-html-click-stimulus').style.visibility = 'hidden';
      }, trial.stimulus_duration);
    }

    // end trial if time limit is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }

  };

  return plugin;
})();
