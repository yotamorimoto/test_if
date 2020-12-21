import { midicps, load2buf } from '../auditory-demo/sc.js'
import { Player } from '../auditory-demo/synth.js'

window.AudioContext = window.AudioContext || window.webkitAudioContext
window.audio = null
window.master = null
document.addEventListener('DOMContentLoaded', resize)
window.addEventListener('resize', resize)

const blockSize = 2048
const playButton = document.getElementById('play')
const stopButton = document.getElementById('stop')
const wrapper = document.getElementById('wrapper')
const canvas = document.getElementById('canvas')
const spectrogram = document.getElementById('spectrogram')
const slider = new Nexus.Slider('#slider', {
  'size': [30,310],
  'mode':'absolute',
  'min': 1,
  'max': 10,
  'step': 1,
  'value': 0,
})
slider.on('change', (v) => {
  v = v - 1
  players[v].setAmp(1)
  for (const [i, player] of players.entries()) {
    if (!(i == v)) player.setAmp(0)
  }
  spectrogram.src = v + '.png'
})
const number = new Nexus.Number('#number', {
  'size': [35,30]
})
const volume = new Nexus.Slider('#volume', {
  'size': [150,20],
  'mode':'absolute',
  'min': 0,
  'max': 1,
  'step': 0.1,
  'value': 1,
})
volume.on('change', (v) => {
  master.gain.value = v
})
let isPlaying = true
let sliderValue = 0
let players = new Array(10)

async function load() {
  Promise.all([
    load2buf('0.mp3', b => { players[0] = new Player(b, true)}),
    load2buf('1.mp3', b => { players[1] = new Player(b, true)}),
    load2buf('2.mp3', b => { players[2] = new Player(b, true)}),
    load2buf('3.mp3', b => { players[3] = new Player(b, true)}),
    load2buf('4.mp3', b => { players[4] = new Player(b, true)}),
    load2buf('5.mp3', b => { players[5] = new Player(b, true)}),
    load2buf('6.mp3', b => { players[6] = new Player(b, true)}),
    load2buf('7.mp3', b => { players[7] = new Player(b, true)}),
    load2buf('8.mp3', b => { players[8] = new Player(b, true)}),
    load2buf('9.mp3', b => { players[9] = new Player(b, true)}),
  ]).then(() => {
    number.link(slider)
    for (const player of players) player.play(0.1, 0)
    players[0].setAmp(1, 0.1)
  })
}

function init() {
  audio = new AudioContext({ latencyHint: blockSize/48000 })
  master = audio.createGain()
  master.gain.value = volume.value
  master.connect(audio.destination)
}
playButton.onclick = () => {
  resize()
  init()
  load()
  playButton.remove()
}
stopButton.onclick = () => {
  if (isPlaying) {
    master.disconnect()
    isPlaying = false
    stopButton.innerHTML = 'start'
  } else {
    master.connect(audio.destination)
    isPlaying = true
    stopButton.innerHTML = 'stop'
  }
}
function resize() {
  let w = window.innerWidth
  if (w >= 1190) {
    wrapper.style.width = '945px'
    spectrogram.width = '700'
    slider.resize(30,310)
  } else if (w < 1190 && w >= 960) {
    wrapper.style.width = '795px'
    spectrogram.width = '600'
    slider.resize(30,250)
  } else if (w < 960 && w >= 768) {
    wrapper.style.width = '720px'
    spectrogram.width = '550'
    slider.resize(30,230)
  } else if (w < 768 && w >= 576) {
    wrapper.style.width = '540px'
    spectrogram.width = '400'
    slider.resize(30,150)
  } else {
    wrapper.style.width = '350px'
    spectrogram.width = '300'
    slider.resize(30,100)
  }
}
