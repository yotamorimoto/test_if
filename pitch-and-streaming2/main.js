import { series } from '../auditory-demo/sc.js'
import { Sine } from '../auditory-demo/synth.js'

window.AudioContext = window.AudioContext || window.webkitAudioContext
window.audio = null
window.master = null
document.addEventListener('DOMContentLoaded', resize)
window.addEventListener('resize', resize)

const blockSize = 1024
const interval = 1.4
const playButton = document.getElementById('play')
const stopButton = document.getElementById('stop')
const wrapper = document.getElementById('wrapper')
const canvas = document.getElementById('canvas')
const vlabel = document.getElementById('vlabel')
const slider = new Nexus.Slider('#slider', {
  'size': [30,310],
  'mode':'absolute',
  'min': 1,
  'max': 10,
  'step': 1,
  'value': 0,
})
slider.on('change', (v) => {
  sliderValue = sliderarr[v-1]
  harm1 = harm1arr[v-1]
  harm2 = harm2arr[v-1]
  harm3 = harm3arr[v-1]
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
  'step': 0.1,
  'value': 1,
})
volume.on('change', (v) => {
  master.gain.value = v
})
let processor, dummy
let harm1 = 400, harm2 = 600, harm3 = 800
let isPlaying = true
let tick = 0.5
let sliderValue = 0
const harm1arr = series(400, 425, 25/9)
const harm2arr = series(600, 637.5, 37.5/9)
const harm3arr = series(800, 850, 50/9)
const sliderarr = series(0, 0.6, 0.6/10)
// console.log(harm1arr)

const onaudioprocess = () => {
  if (tick - audio.currentTime < (blockSize / audio.sampleRate)) {
    let f = 100
    let amp = 1/17
    let atk = 0.01
    let sus = 0.8
    let rls = 0.01
    Sine(f, amp, atk, sus, rls)
    Sine(f*2, amp, atk, sus, rls)
    Sine(f*3, amp, atk, sus, rls)
    Sine(harm1, amp, atk, sus, rls)
    Sine(f*5, amp, atk, sus, rls)
    Sine(harm2, amp, atk, sus, rls)
    Sine(f*7, amp, atk, sus, rls)
    Sine(harm3, amp, atk, sus, rls)
    Sine(f*9, amp, atk, sus, rls)
    Sine(f*10, amp, atk, sus, rls)
    Sine(f*11, amp, atk, sus, rls)
    Sine(f*12, amp, atk, sus, rls)
    Sine(f*13, amp, atk, sus, rls)
    Sine(f*14, amp, atk, sus, rls)
    Sine(f*15, amp, atk, sus, rls)
    tick += interval
  }
}
function init() {
  audio = new AudioContext({ latencyHint: blockSize/48000 })
  processor = audio.createScriptProcessor(blockSize)
  processor.onaudioprocess = onaudioprocess
  master = audio.createGain()
  master.gain.value = volume.value
  dummy = audio.createGain()
  dummy.connect(processor)
  processor.connect(master)
  master.connect(audio.destination)
  slider.value
  number.link(slider)
}
function draw() {
  let x = canvas.getContext('2d')
  let w = x.canvas.clientWidth
  let h = x.canvas.clientHeight
  let scale = window.devicePixelRatio
  let lineLength = w / 10
  let lineMargin = w / 10
  let lineHeight = h / 12
  let stretch = lineLength + lineMargin
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
  // content
  x.lineWidth = 5
  x.lineCap = 'round'
  for (let i=0; i<4; i++) {
    for (let j=0; j<10; j++) {
      x.beginPath()
      if (j == 4 || j == 6 || j == 8) {
        x.strokeStyle = '#2bb'
        x.moveTo(lineMargin+(i*stretch), lineHeight+(j*lineHeight)-(sliderValue*lineHeight))
        x.lineTo(stretch+(i*stretch), lineHeight+(j*lineHeight)-(sliderValue*lineHeight))
      } else {
        x.strokeStyle = 'black'
        x.moveTo(lineMargin+(i*stretch), lineHeight+(j*lineHeight))
        x.lineTo(stretch+(i*stretch), lineHeight+(j*lineHeight))
      }
      x.stroke()
      x.closePath()
    }
  }
}
playButton.onclick = () => {
  resize()
  init()
  draw()
  playButton.remove()
}
stopButton.onclick = () => {
  if (isPlaying) {
    master.disconnect()
    isPlaying = false
    stopButton.innerHTML = 'start'
  } else {
    tick = 0.5
    init()
    master.connect(audio.destination)
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
