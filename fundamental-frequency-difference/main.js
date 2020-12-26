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

const blockSize = 512
const interval = 0.12
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
  v = v - 1
  sliderValue = v
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
let processor, dummy, f0, f1, f2, f3
let isPlaying = true
let sliderValue = 0
let tick = 0.5
let counter = 0
let seq = [45, 46, 45, -1]

const onaudioprocess = () => {
  if (tick - audio.currentTime < (blockSize / audio.sampleRate)) {
    const note = seq[counter%4]
    const amp = 1/25
    const atk = 0.01
    const sus = 0.1
    const rls = 0.01
    if (note == 45) {
      const f = midicps(note)
      for (let i=3; i<18; i++) Sine(f*i, amp, atk, sus, rls)
    } else if (note == 46) {
      let f = midicps(note+[0,1,2,3,5,7,11,14,17,23][sliderValue])
      let thisAmp = 1/(25-sliderValue)
      for (let i=3; i<[18-Math.round(sliderValue*1.3)]; i++) Sine(f*i, thisAmp, atk, sus, rls)
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
  hpf = audio.createBiquadFilter()
  hpf.type = 'highpass'
  hpf.frequency.value = 2000
  master.connect(hpf)
  hpf.connect(audio.destination)
  number.link(slider)
  // WebAudio highpass butterworth design
  // Order = 6
  // Sample rate = 48000 Hz
  // Passband = 1000 Hz
  // Stopband = 300 Hz
  // Passband attenuation = 60 dB
  // Stopband attenuation = 3 dB
  // f0 = audio.createIIRFilter(
  //      [0.8761722310013793,-0.8761722310013793],
  //      [1,-0.7523444620027585]);
  // f1 = audio.createIIRFilter(
  //        [0.9234714041810289,-1.8469428083620578,0.9234714041810289],
  //        [1,-1.8100526453208532,0.8838329714032606]);
  // f2 = audio.createIIRFilter(
  //        [0.8359757750910375,-1.671951550182075,0.8359757750910375],
  //        [1,-1.6385565988040682,0.7053465015600817]);
  // f3 = audio.createIIRFilter(
  //        [0.7845364121959348,-1.5690728243918697,0.7845364121959348],
  //        [1,-1.5377327352167907,0.600412913566949]);
  // f0.connect(f1)
  // f1.connect(f2)
  // f2.connect(f3)
  // master.connect(f0)
  // f0.connect(audio.destination)
}
function draw() {
  let x = canvas.getContext('2d')
  let w = x.canvas.clientWidth
  let h = x.canvas.clientHeight
  let scale = window.devicePixelRatio
  let lineLength = w / 10
  let lineMargin = w / 10
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
  // content
  x.lineWidth = 5
  x.lineCap = 'round'
  let o = -h / 20
  for (let i=0; i<3; i++) {
    for (let j=0; j<12; j++) {
      x.beginPath()
      if (i == 1 && j < 11 && j%[1,1,2,2,3,3,4,4,4,5][sliderValue] == 0) {
        let offset = [0,o][sliderValue%2]
        x.strokeStyle = '#2bb'
        x.moveTo(lineMargin+(i*stretch), offset+lineOffset+lineHeight+(j*lineHeight))
        x.lineTo(stretch+(i*stretch), offset+lineOffset+lineHeight+(j*lineHeight))
      } else if (i == 0 || i == 2) {
        x.strokeStyle = 'black'
        x.moveTo(lineMargin+(i*stretch), lineOffset+lineHeight+(j*lineHeight))
        x.lineTo(stretch+(i*stretch), lineOffset+lineHeight+(j*lineHeight))
      }
      x.stroke()
      x.closePath()
    }
  }
}
playButton.onclick = () => {
  resize()
  init()
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
