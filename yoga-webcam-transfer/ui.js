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

export const getDenseUnits = () => 100;
const statusElement = document.getElementById('status');

export function startPacman() {
  console.log("Starting demo");
  // google.pacman.startGameplay();
}

export function predictClass(classId) {
  console.log(CONTROL_CODES[classId]) // Sjoerd
  // google.pacman.keyPressed(CONTROL_CODES[classId]);

  document.body.setAttribute('data-active', CONTROLS[classId]);
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
const audioButton = document.getElementById('audioButton');

const thumbDisplayed = {};

async function audioInstructions() {
  await speak('Welcome to Namestay.');
  await speak('This is freestyle mode. We will now setup your poses');
  await speak('Please choose a pose');
  await sleep(2);
  await speak("We will record the pose in 3 seconds");
  await sleep(1);
  await speak("2");
  await sleep(1);
  await speak("1");
  await sleep(1);
  await speak("Recording...");
  //record
  console.log("recording")


}

async function speak(text) {
  const msg = new SpeechSynthesisUtterance(text);

  return new Promise(resolve => {
    msg.onend = () => {
      console.log("resolving");
        return resolve()
    }
    window.speechSynthesis.speak(msg);
    text = text.replace("Namestay","Namast.ai");
    document.getElementById("instructions").innerHTML=text;
  })
}

async function sleep(time) {
  return new Promise(resolve => {
    setTimeout(() => {
      return resolve()
    }, time)
  })
}

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

audioButton.addEventListener('mousedown', () => audioInstructions());
audioButton.addEventListener('mouseup', () => mouseDown = false);

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
