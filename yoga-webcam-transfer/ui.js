/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
import * as tf from '@tensorflow/tfjs';
import moment from 'moment'

const CONTROLS = ['up', 'down', 'left', 'right'];
const CONTROL_CODES = [38, 40, 37, 39];

export function init() {
  document.getElementById('controller').style.display = '';
  statusElement.style.display = 'none';
}

const trainStatusElement = document.getElementById('train-status');

// Set hyper params from UI values.

export const getLearningRate = () => 0.0001;

export const getBatchSizeFraction = () => 0.4;

export const getEpochs = () => 20;

export const setTimer = (time) => {document.getElementById("timer").innerHTML = time};

export const getDummyFirstPose = () => 0

var myInterval
export function startTimer() {
  var startTimestamp = moment().startOf("day");
  myInterval = setInterval(function () {
      setTimer(startTimestamp.format('mm:ss'));
      startTimestamp.add(1, 'second');
  }, 1000);
}

let completed_poses = []
function resetTimer() {
  clearInterval(myInterval);
  startTimer()
}

export const getDenseUnits = () => 100;
const statusElement = document.getElementById('status');

export function startPacman() {
  console.log("Starting demo");
  // google.pacman.startGameplay();
}
let pose = undefined
export function predictClass(classId) {
  // classId's are 0,1,2,3

  // google.pacman.keyPressed(CONTROL_CODES[classId]);

  // current pose is computed by smoothing past predictions.
  let pose_update = processPredictions(classId)
  if (pose == undefined && pose != pose_update) {
    resetTimer()
  }
  else if (pose != pose_update) {
    resetTimer()
  }
  pose = pose_update
  document.body.setAttribute('data-active', CONTROLS[pose]);
}

let poses_enum = {
  "UP":0,
  "DOWN":1,
  "LEFT":2,
  "RIGHT":3
}

function argMax(array) {
  return array.map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1];
}

const _NUMBER_PREDICTIONS_SAVED = 20
const _NUMBER_OF_POSES = 4
let last_N_predictions = []

function processPredictions(classId) {
  if (last_N_predictions.length < _NUMBER_PREDICTIONS_SAVED) {
    last_N_predictions.push(classId)
  }
  else {
    last_N_predictions = last_N_predictions.slice(1, last_N_predictions.length)
    last_N_predictions.push(classId)
  }
  let counts = new Array(_NUMBER_OF_POSES).fill(0); // array of counts, indexes correspond to classes
  last_N_predictions.forEach((class_ID)=>{
    counts[class_ID] += 1
  })
  let total_count = counts.reduce(function (accumulator, currentValue) {
    return accumulator + currentValue}, 0);
  for (let i = 0; i < counts.length; i++) {
    counts[i] = counts[i] / total_count
  }

  
  let current_pose = argMax(counts) // Just selects the pose which has been predicted most in last
  // _NUMBER_PREDICTIONS_SAVED frames.

  if (last_N_predictions.length > _NUMBER_PREDICTIONS_SAVED / 4) {
    // To only start a pose when a certain amount of time has passed:
    return current_pose
  }
  else {
    return undefined
  }
}


export function isPredicting() {
  statusElement.style.visibility = 'visible';
}
export function donePredicting() {
  statusElement.style.visibility = 'hidden';
}
export function trainStatus(status) {
  trainStatusElement.innerText = status;
}

export let addExampleHandler;
export function setExampleHandler(handler) {
  addExampleHandler = handler;
}
let mouseDown = false;
const totals = [0, 0, 0, 0];

const upButton = document.getElementById('up');
const downButton = document.getElementById('down');
const leftButton = document.getElementById('left');
const rightButton = document.getElementById('right');

const thumbDisplayed = {};

async function handler(label) {
  mouseDown = true;
  const className = CONTROLS[label];
  const button = document.getElementById(className);
  const total = document.getElementById(className + '-total');
  while (mouseDown) {
    addExampleHandler(label);
    document.body.setAttribute('data-active', CONTROLS[label]);
    total.innerText = totals[label]++;
    await tf.nextFrame();
  }
  document.body.removeAttribute('data-active');
}

upButton.addEventListener('mousedown', () => handler(0));
upButton.addEventListener('mouseup', () => mouseDown = false);

downButton.addEventListener('mousedown', () => handler(1));
downButton.addEventListener('mouseup', () => mouseDown = false);

leftButton.addEventListener('mousedown', () => handler(2));
leftButton.addEventListener('mouseup', () => mouseDown = false);

rightButton.addEventListener('mousedown', () => handler(3));
rightButton.addEventListener('mouseup', () => mouseDown = false);

export function drawThumb(img, label) {
  if (thumbDisplayed[label] == null) {
    const thumbCanvas = document.getElementById(CONTROLS[label] + '-thumb');
    draw(img, thumbCanvas);
  }
}

export function draw(image, canvas) {
  const [width, height] = [224, 224];
  const ctx = canvas.getContext('2d');
  const imageData = new ImageData(width, height);
  const data = image.dataSync();
  for (let i = 0; i < height * width; ++i) {
    const j = i * 4;
    imageData.data[j + 0] = (data[i * 3 + 0] + 1) * 127;
    imageData.data[j + 1] = (data[i * 3 + 1] + 1) * 127;
    imageData.data[j + 2] = (data[i * 3 + 2] + 1) * 127;
    imageData.data[j + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
}
