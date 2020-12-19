import { midicps } from '../auditory-demo/sc.js'
import { Sine } from '../auditory-demo/synth.js'

window.AudioContext = window.AudioContext || window.webkitAudioContext
window.audio = null
window.master = null
window.bpf = null
window.lpf = null
window.hpf = null
document.addEventListener('DOMContentLoaded', resize)
window.addEventListener('resize', resize)

const blockSize = 1024
const interval = 0.12
const playButton = document.getElementById('play')
const stopButton = document.getElementById('stop')
const wrapper = document.getElementById('wrapper')
const canvas = document.getElementById('canvas')
const semitone = document.getElementById('hsemitone')
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
  addnote = [0,1,2,3,5,7,11,14,17,23][v]
  semitone.innerHTML = `${addnote+1}半音`
  draw()
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
let isPlaying = true
let tick = 0.5
let counter = 0, addnote
let seq = [81, 82, 81, -1]

const onaudioprocess = () => {
  if (tick - audio.currentTime < (blockSize / audio.sampleRate)) {
    const note = seq[counter%4]
    const amp = 1/2
    const atk = 0.01
    const sus = 0.08
    const rls = 0.01
    if (note == seq[0]) {
      const f = midicps(note)
      Sine(f, amp, atk, sus, rls)
    } else if (note == seq[1]) {
      const f = midicps(note+addnote)
      Sine(f, amp, atk, sus, rls)
    }
    tick += interval
    counter++
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
}
function draw() {
  let x = canvas.getContext('2d')
  let w = x.canvas.clientWidth
  let h = x.canvas.clientHeight
  let scale = window.devicePixelRatio
  let lineLength = w / 15
  let lineMargin = w / 20
  let lineHeight = h / 15
  let lineOffset = h / 15
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
  // unit frame
  x.translate(10,0)
  x.beginPath()
  x.strokeStyle = '#2bb'
  x.lineWidth = 2
  x.setLineDash([3,3])
  x.moveTo(lineMargin, h-30)
  x.lineTo(4*(lineMargin+stretch), h-30)
  x.moveTo(4*(lineMargin+stretch), h-30)
  x.lineTo(4*(lineMargin+stretch), h-40)
  x.stroke()
  x.closePath()
  // unit
  x.strokeStyle = 'black'
  x.lineCap = 'round'
  x.lineWidth = 5
  x.setLineDash([])
  x.beginPath()
  x.moveTo(lineMargin, h-40)
  x.lineTo(lineMargin+stretch, h-40)
  x.stroke()
  x.closePath()
  x.beginPath()
  x.strokeStyle = '#2bb'
  x.translate(lineMargin+stretch, -10)
  x.moveTo(lineMargin, h-40-(addnote*lineHeight*0.4))
  x.lineTo(lineMargin+stretch, h-40-(addnote*lineHeight*0.4))
  x.stroke()
  x.beginPath()
  x.strokeStyle = 'black'
  x.translate(lineMargin+stretch, 10)
  x.moveTo(lineMargin, h-40)
  x.lineTo(lineMargin+stretch, h-40)
  x.translate(2*(lineMargin+stretch), 0)
  x.stroke()
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
    master.disconnect()
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
  // let ratio = window.devicePixelRatio || 1
  // let w = screen.width * ratio
  let w = window.innerWidth
  // alert(`ratio is ${window.devicePixelRatio}, width is ${screen.width}, innerWidth is ${w}`)
  if (w >= 1190) {
    wrapper.style.width = '945px'
    // wrapper.style.height = '525px'
    canvas.style.width = '600px'
    canvas.style.height = '350px'
    slider.resize(30,310)
  } else if (w < 1190 && w >= 960) {
    wrapper.style.width = '795px'
    // wrapper.style.height = '422px'
    canvas.style.width = '500px'
    canvas.style.height = '250px'
    slider.resize(30,230)
  } else if (w < 960 && w >= 768) {
    wrapper.style.width = '720px'
    // wrapper.style.height = '400px'
    canvas.style.width = '500px'
    canvas.style.height = '235px'
    slider.resize(30,210)
  } else if (w < 768 && w >= 576) {
    wrapper.style.width = '540px'
    // wrapper.style.height = '300px'
    canvas.style.width = '350px'
    canvas.style.height = '155px'
    vlabel.style.padding = '50px 0'
    slider.resize(30,150)
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
