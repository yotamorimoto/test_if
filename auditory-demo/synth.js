import { midicps, dbamp, linexp } from './sc.js'
const eps = Number.EPSILON

class Panner {
  constructor(pan=0) {
    // safari has no stereo panner
    if (audio.createStereoPanner) {
        this.node = audio.createStereoPanner()
        this.node.pan.value = pan
    } else {
        this.node = audio.createPanner()
        this.node.panningModel = 'equalpower'
        this.node.setPosition(pan, 0, 1 - Math.abs(pan))
    }
    return this.node
  }
}
class Env {
  constructor(level=1, offset=0) {
    const now = audio.currentTime
    this.vca = audio.createGain()
    this.level = level
    this.offset = offset
    this.vca.gain.setValueAtTime(this.offset, now)
  }
}
class Perc extends Env {
  trigger(attack, release) {
    const now = audio.currentTime
    this.vca.gain.linearRampToValueAtTime(this.level, now + attack)
    this.vca.gain.exponentialRampToValueAtTime(Math.max(eps, this.offset), now + attack + release)
  }
}
class AR extends Env {
  trigger(attack, release) {
    const now = audio.currentTime
    this.vca.gain.linearRampToValueAtTime(this.level, now + attack)
    this.vca.gain.linearRampToValueAtTime(this.offset, now + attack + release)
  }
}
class ASR extends Env {
  trigger(attack, sustain, release) {
    const now = audio.currentTime
    this.vca.gain.linearRampToValueAtTime(this.level, now + attack)
    this.vca.gain.setValueAtTime(this.level, now + attack + sustain)
    this.vca.gain.linearRampToValueAtTime(0, now + attack + sustain + release)
  }
}
function set_xfade(a, b, fade) {
  a.gain.value = Math.cos(fade * 0.5*Math.PI)
  b.gain.value = Math.cos((1.0-fade) * 0.5*Math.PI)
}
function connect(...nodes) {
  for (let i=0; i<nodes.length-1; i++) {
    nodes[i].connect(nodes[i+1])
  }
}
function schedTrash(time, ...nodes) {
  const when = audio.currentTime + time
  for (let i=0; i<nodes.length; i++) nodes[i].stop(when)
  setTimeout(() => {
    for (let i=0; i<nodes.length; i++) nodes[i].disconnect()
    nodes = null
  }, time*1100)
}
function schedDone(time, node) {
  setTimeout(() => node.isPlaying = false, time*1000)
}
export function Sine(freq, amp, atk, sus, rls) {
  const vco = audio.createOscillator()
  const env = new ASR(amp)
  vco.frequency.value = freq
  connect(vco, env.vca, master)
  vco.start()
  env.trigger(atk, sus, rls)
  schedTrash(atk+sus+rls, vco)
}
export function SinePan(freq, amp, atk, sus, rls, pan) {
  const vco = audio.createOscillator()
  const env = new ASR(amp)
  const panner = new Panner(pan)
  vco.frequency.value = freq
  connect(vco, env.vca, panner, master)
  vco.start()
  env.trigger(atk, sus, rls)
  schedTrash(atk+sus+rls, vco)
}
export function Osc(freq, amp, atk, sus, rls, pan) {
  const vco = audio.createOscillator()
  const env = new ASR(amp)
  const panner = new Panner(pan)
  vco.setPeriodicWave(wavetable)
  vco.frequency.value = freq
  connect(vco, env.vca, panner, master)
  vco.start()
  env.trigger(atk, sus, rls)
  schedTrash(atk+sus+rls, vco)
}
export class Player {
  constructor(buffer, loop=false) {
    this.isPlaying = false
    this.node = null
    this.vca = null
    this.buffer = buffer
    this.loop = loop
  }
  play(fade=0, amp=1) {
    if (!this.isPlaying) {
      const now = audio.currentTime
      this.node = audio.createBufferSource()
      this.vca = audio.createGain()
      this.node.buffer = this.buffer
      this.node.loop = this.loop
      this.vca.gain.value = 0
      connect(this.node, this.vca, master)
      this.vca.gain.linearRampToValueAtTime(amp, now+fade)
      this.node.start()
      this.isPlaying = true
    } else { console.log(`${this} is already playing. stop() first!`) }
  }
  stop(fade=0.1) {
    if (this.isPlaying) {
      const now = audio.currentTime
      this.vca.gain.linearRampToValueAtTime(0, now+fade)
      this.node.stop(now+fade)
      schedDone(fade, this)
    }
  }
  setAmp(amp=1, fade=0.1) {
    if (this.isPlaying) {
      const now = audio.currentTime
      this.vca.gain.linearRampToValueAtTime(amp, now+fade)
    } else { console.log(`${this} is not playing. play() first!`) }
  }
}
