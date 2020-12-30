import { midicps } from '../auditory-demo/sc.js'
import { Sine } from '../auditory-demo/synth.js'

window.AudioContext = window.AudioContext || window.webkitAudioContext
window.audio = null
window.master = null
window.hpf = null
document.addEventListener('DOMContentLoaded', resize)
window.addEventListener('resize', resize)

const blockSize = 256
const playButton = document.getElementById('play')
const stopButton = document.getElementById('stop')
const wrapper = document.getElementById('wrapper')
const canvas = document.getElementById('canvas')
const vlabel = document.getElementById('vlabel')
const hlabel = document.getElementById('hlabel')
const slider = new Nexus.Slider('#slider', {
  'size': [30,310],
  'mode':'absolute',
  'min': 1,
  'max': 10,
  'step': 1,
  'value': 0,
})
slider.on('change', (v) => {
  interval = [0.25,0.2,0.18,0.15,0.12,0.1,0.075,0.06,0.05,0.04][9-v+1]
  sustain = [0.2,0.15,0.09,0.08,0.07,0.07,0.05,0.04,0.03,0.015][9-v+1]
  release = [0.01,0.01,0.01,0.01,0.005,0.005,0.005,0.005,0.001,0.001][9-v+1]
  linediv = [5,7,10,15,20,25,30,40,50,60][9-v+1]
  hlabel.innerHTML = `繰り返し単位の経過時間（点線区間：${ interval*4 }秒）`
  draw()
})
const number = new Nexus.Number('#number', {
  'size': [35,30]
})
const volume = new Nexus.Slider('#volume', {
  'size': [150,20],
  'mode':'absolute',
  'min': 0,
  'max': 1,
  'step': 0,
  'value': 1,
})
volume.on('change', (v) => {
  master.gain.value = v
})
let interval = 0.25
let sustain, release, linediv
let processor, dummy
let isPlaying = true
let sliderValue = 0
let tick = 1
let counter = 0
let seq = [80, 81, 80, -1]

const onaudioprocess = () => {
  if (tick - audio.currentTime < (blockSize / audio.sampleRate)) {
    const note = seq[counter%4]
    if (note > 0) {
      const amp = 1/5
      Sine(midicps(note), amp, release, sustain, release)
    }
    tick += interval
    counter++
  }
}
function init() {
  audio = new AudioContext({
    sampleRate: 44100,
    latencyHint: blockSize/44100
  })
  processor = audio.createScriptProcessor(blockSize)
  processor.onaudioprocess = onaudioprocess
  master = audio.createGain()
  master.gain.value = volume.value
  dummy = audio.createOscillator()
  dummy.frequency.value = 0
  dummy.connect(processor)
  processor.connect(master)
  hpf = audio.createBiquadFilter()
  hpf.type = 'highpass'
  hpf.frequency.value = 300
  master.connect(hpf)
  hpf.connect(audio.destination)
  number.link(slider)
}
function draw() {
  let x = canvas.getContext('2d')
  let w = x.canvas.clientWidth
  let h = x.canvas.clientHeight
  let scale = window.devicePixelRatio
  let lineLength = w / 10
  let lineMargin = w / linediv * 0.1
  let lineHeight = h / 15
  let lineOffset = h / 15
  let stretch = w / linediv
  canvas.width = Math.floor(w * scale)
  canvas.height = Math.floor(h * scale)
  // Normalize coordinate system to use css pixels.
  x.scale(scale, scale);
  x.lineWidth = 1
  // frame
  x.moveTo(10, 10)
  x.lineTo(10, h-10)
  x.lineTo(w-10, h-10)
  x.stroke()
  // arrow
  x.moveTo(10, 10)
  x.lineTo(5, 15)
  x.stroke()
  x.moveTo(w-10, h-10)
  x.lineTo(w-15, h-15)
  x.stroke()
  // unit
  x.translate(10,0)
  x.beginPath()
  x.strokeStyle = '#2bb'
  x.lineWidth = 2
  x.setLineDash([3,3])
  x.moveTo(lineMargin, h-70)
  x.lineTo(4*(lineMargin+stretch), h-70)
  x.moveTo(4*(lineMargin+stretch), h-70)
  x.lineTo(4*(lineMargin+stretch), h-40)
  x.stroke()
  x.closePath()
  // unit
  x.strokeStyle = 'black'
  x.lineCap = 'round'
  x.lineWidth = 5
  x.setLineDash([])
  x.beginPath()
  for (let i=0; i<30; i++) {
    x.moveTo(lineMargin, h-40)
    x.lineTo(lineMargin+stretch, h-40)
    x.translate(lineMargin+stretch, -10)
    x.moveTo(lineMargin, h-40)
    x.lineTo(lineMargin+stretch, h-40)
    x.translate(lineMargin+stretch, 10)
    x.moveTo(lineMargin, h-40)
    x.lineTo(lineMargin+stretch, h-40)
    x.translate(2*(lineMargin+stretch), 0)
    x.stroke()
  }
  x.closePath()
}
playButton.onclick = () => {
  resize()
  init()
  slider.value = 0
  playButton.remove()
}
stopButton.onclick = () => {
  if (isPlaying) {
    hpf.disconnect()
    isPlaying = false
    stopButton.innerHTML = 'start'
  } else {
    tick = 0.5
    init()
    isPlaying = true
    stopButton.innerHTML = 'stop'
  }
}
function resize() {
  let w = window.innerWidth
  if (w >= 1190) {
    wrapper.style.width = '945px'
    // wrapper.style.height = '525px'
    canvas.style.width = '600px'
    canvas.style.height = '350px'
    slider.resize(30,270)
  } else if (w < 1190 && w >= 960) {
    wrapper.style.width = '795px'
    // wrapper.style.height = '422px'
    canvas.style.width = '500px'
    canvas.style.height = '250px'
    slider.resize(30,180)
  } else if (w < 960 && w >= 768) {
    wrapper.style.width = '720px'
    // wrapper.style.height = '400px'
    canvas.style.width = '500px'
    canvas.style.height = '235px'
    slider.resize(30,150)
  } else if (w < 768 && w >= 576) {
    wrapper.style.width = '540px'
    // wrapper.style.height = '300px'
    canvas.style.width = '350px'
    canvas.style.height = '155px'
    vlabel.style.padding = '50px 0'
    slider.resize(30,100)
  } else {
    wrapper.style.width = '350px'
    // wrapper.style.height = '300px'
    canvas.style.width = '200px'
    canvas.style.height = '155px'
    vlabel.style.padding = '50px 0'
    slider.resize(30,100)
  }
  draw()
}
