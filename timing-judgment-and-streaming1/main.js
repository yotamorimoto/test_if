import { midicps, load2buf } from '../auditory-demo/sc.js'
import { Player } from '../auditory-demo/synth.js'

window.AudioContext = window.AudioContext || window.webkitAudioContext
window.audio = null
window.master = null
document.addEventListener('DOMContentLoaded', resize)
window.addEventListener('resize', resize)

const blockSize = 2048
const playButton = document.getElementById('play')
const wrapper = document.getElementById('wrapper')
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

const but_a = document.getElementById('but_a')
const but_b = document.getElementById('but_b')
const but_c = document.getElementById('but_c')
const but_d = document.getElementById('but_d')
let aPlayer, bPlayer, cPlayer, dPlayer

function init() {
  audio = new AudioContext({ latencyHint: blockSize/48000 })
  master = audio.createGain()
  master.gain.value = volume.value
  master.connect(audio.destination)
  Promise.all([
    load2buf('a.mp3', b => aPlayer = new Player(b, true), e => console.log(e)),
    load2buf('b.mp3', b => bPlayer = new Player(b, true), e => console.log(e)),
    load2buf('c.mp3', b => cPlayer = new Player(b, true), e => console.log(e)),
    load2buf('d.mp3', b => dPlayer = new Player(b, true), e => console.log(e)),
  ]).then(() => [but_a,but_b,but_c,but_d].forEach((b) => b.disabled = false))
}

playButton.onclick = () => {
  resize()
  init()
  playButton.remove()
}
but_a.onclick = () => {
  if (!aPlayer.isPlaying) {
    aPlayer.play()
    for (let p of [bPlayer, cPlayer, dPlayer]) p.stop()
    for (let b of [but_b, but_c, but_d]) b.innerHTML = 'play'
    but_a.parentElement.style.color = '#2bb'
    but_a.innerHTML = 'stop'
    but_b.parentElement.style.color = 'black'
    but_c.parentElement.style.color = 'black'
    but_d.parentElement.style.color = 'black'
  } else {
    aPlayer.stop()
    but_a.parentElement.style.color = 'black'
    but_a.innerHTML = 'play'
  }
}
but_b.onclick = () => {
  if (!bPlayer.isPlaying) {
    bPlayer.play()
    for (let p of [aPlayer, cPlayer, dPlayer]) p.stop()
    for (let b of [but_a, but_c, but_d]) b.innerHTML = 'play'
    but_a.parentElement.style.color = 'black'
    but_b.parentElement.style.color = '#2bb'
    but_b.innerHTML = 'stop'
    but_c.parentElement.style.color = 'black'
    but_d.parentElement.style.color = 'black'
  } else {
    bPlayer.stop()
    but_b.parentElement.style.color = 'black'
    but_b.innerHTML = 'play'
  }
}
but_c.onclick = () => {
  if (!cPlayer.isPlaying) {
    cPlayer.play()
    for (let p of [aPlayer, bPlayer, dPlayer]) p.stop()
    for (let b of [but_a, but_b, but_d]) b.innerHTML = 'play'
    but_c.innerHTML = 'stop'
    but_a.parentElement.style.color = 'black'
    but_b.parentElement.style.color = 'black'
    but_c.parentElement.style.color = '#2bb'
    but_d.parentElement.style.color = 'black'
  } else {
    cPlayer.stop()
    but_c.parentElement.style.color = 'black'
    but_c.innerHTML = 'play'
  }
}
but_d.onclick = () => {
  if (!dPlayer.isPlaying) {
    dPlayer.play()
    for (let p of [aPlayer, bPlayer, cPlayer]) p.stop()
    for (let b of [but_a, but_b, but_c]) b.innerHTML = 'play'
    but_d.innerHTML = 'stop'
    but_a.parentElement.style.color = 'black'
    but_b.parentElement.style.color = 'black'
    but_c.parentElement.style.color = 'black'
    but_d.parentElement.style.color = '#2bb'
  } else {
    dPlayer.stop()
    but_d.parentElement.style.color = 'black'
    but_d.innerHTML = 'play'
  }
}
function resize() {
  let w = window.innerWidth
  if (w >= 1190) {
    wrapper.style.width = '945px'
    // wrapper.style.height = '525px'
  } else if (w < 1190 && w >= 960) {
    wrapper.style.width = '795px'
    // wrapper.style.height = '422px'
  } else if (w < 960 && w >= 768) {
    wrapper.style.width = '720px'
    // wrapper.style.height = '400px'
  } else if (w < 768 && w >= 576) {
    wrapper.style.width = '540px'
    // wrapper.style.height = '300px'
  } else {
    wrapper.style.width = '350px'
    // wrapper.style.height = '300px'
  }
}
