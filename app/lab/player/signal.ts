'use client'

import { useEffect, useRef } from 'react'
import { analyser } from '@/lib/audio'

/**
 * The one source of truth the four prototypes share: what the master bus is
 * actually doing, sampled once a frame.
 *
 * All four directions are built on this rather than on a decorative sine, and
 * that is the whole point of the exercise. The audio here is synthesised, so
 * there is no file, no duration and no position — a scrubber or a running time
 * would be invented. What does exist is the signal itself, and everything
 * these prototypes draw comes from it.
 */

export interface Signal {
  /** Time domain, -1..1, `fftSize` samples. The scope trace. */
  wave: Float32Array
  /** Spectrum, 0..1, `fftSize / 2` bins. */
  spectrum: Float32Array
  /**
   * Level with meter ballistics, 0..1 — fast to rise, slow to fall.
   *
   * Deliberately not the instantaneous peak. A meter that tracks every sample
   * is the thing that reads as a screensaver; the lag is what makes it read as
   * a needle with a mass on the end of it. The constants are a VU's: about
   * 300ms to settle, and a release slower than the attack.
   */
  level: number
  /** Three bands, 0..1, with the same ballistics. Low, mid, high. */
  bands: [number, number, number]
  /** True once the context exists — i.e. once a gesture has started it. */
  live: boolean
}

const EMPTY: Signal = {
  wave: new Float32Array(0),
  spectrum: new Float32Array(0),
  level: 0,
  bands: [0, 0, 0],
  live: false,
}

/**
 * Subscribes to the bus and calls `draw` once per frame with the current
 * signal. One rAF loop and one pair of buffers per caller.
 *
 * `draw` is held in a ref rather than in the dependency list: it closes over
 * component state and would otherwise tear the loop down and rebuild it on
 * every render, losing whatever the visual had accumulated.
 */
export function useSignal(draw: (s: Signal, dt: number) => void, enabled = true) {
  const fn = useRef(draw)
  fn.current = draw

  useEffect(() => {
    if (!enabled) return

    let frame = 0
    let last = performance.now()
    let node: AnalyserNode | null = null
    let time: Uint8Array | null = null
    let freq: Uint8Array | null = null
    let wave: Float32Array | null = null
    let spectrum: Float32Array | null = null

    /* Meter state, kept across frames — the ballistics are the memory. */
    let level = 0
    const bands: [number, number, number] = [0, 0, 0]

    /* Per second. Attack reaches most of the way in ~120ms, release takes
       ~700ms to fall away, which is roughly a VU's asymmetry. */
    const ATTACK = 14
    const RELEASE = 3.2

    /**
     * Amplitude to a 0..1 meter deflection, referenced to a -60dB floor.
     *
     * The guard matters: log10(0) is -Infinity, and a single silent frame
     * would otherwise put NaN into the follower, which is sticky — once a
     * meter's state is NaN every later frame stays NaN and the panel dies
     * silently rather than reading zero.
     */
    const FLOOR = 60
    const db = (amp: number) => {
      if (!(amp > 0)) return 0
      const d = 20 * Math.log10(amp)
      return Math.max(0, Math.min(1, (d + FLOOR) / FLOOR))
    }

    const follow = (cur: number, target: number, dt: number) => {
      const k = target > cur ? ATTACK : RELEASE
      return cur + (target - cur) * (1 - Math.exp(-k * dt))
    }

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick)
      /* Clamped: a backgrounded tab hands back a delta of seconds, and an
         un-clamped one would snap every meter to its target in a single step
         the moment the tab is looked at again. */
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      if (!node) {
        node = analyser()
        if (!node) {
          fn.current(EMPTY, dt)
          return
        }
        time = new Uint8Array(node.fftSize)
        freq = new Uint8Array(node.frequencyBinCount)
        wave = new Float32Array(node.fftSize)
        spectrum = new Float32Array(node.frequencyBinCount)
      }

      node.getByteTimeDomainData(time!)
      node.getByteFrequencyData(freq!)

      /* Byte data is 0..255 around a centre of 128. Both are converted once
         here so no visual has to know that. */
      let sum = 0
      for (let i = 0; i < time!.length; i++) {
        const v = (time![i] - 128) / 128
        wave![i] = v
        sum += v * v
      }
      for (let i = 0; i < freq!.length; i++) spectrum![i] = freq![i] / 255

      /* RMS, not peak: this material is a sustained bed, and peak on a bed
         sits pinned near the top and says nothing.

         Mapped in decibels, not in amplitude. A linear amplitude bar is the
         other reliable tell of a fake meter: this room tone runs around -43dB,
         which on a linear scale is two percent — a meter that never leaves its
         first cell. Ears hear loudness logarithmically and every real meter is
         scaled that way, so the floor is what the scale is referenced to, and
         -60 puts this material comfortably mid-scale without exaggerating it. */
      const rms = Math.sqrt(sum / time!.length)
      level = follow(level, db(rms), dt)

      const n = spectrum!.length
      const edges = [0, Math.floor(n * 0.04), Math.floor(n * 0.22), n]
      for (let b = 0; b < 3; b++) {
        let acc = 0
        for (let i = edges[b]; i < edges[b + 1]; i++) acc += spectrum![i]
        const target = db(acc / (edges[b + 1] - edges[b]))
        bands[b] = follow(bands[b], target, dt)
      }

      fn.current({ wave: wave!, spectrum: spectrum!, level, bands, live: true }, dt)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [enabled])
}

/**
 * Compiles a fragment shader over a full-screen triangle and hands back a
 * draw function. Every direction here is one fragment shader on one triangle,
 * so the boilerplate is worth writing once.
 *
 * A triangle rather than a quad: two triangles meet along the diagonal, and
 * the shared edge is a seam where the two halves are shaded in separate
 * batches. One oversized triangle clipped to the viewport has no seam.
 */
export function makeGl(
  canvas: HTMLCanvasElement,
  frag: string,
  uniforms: string[],
): { draw: (set: (u: Record<string, WebGLUniformLocation | null>, gl: WebGLRenderingContext) => void) => void; dispose: () => void } | null {
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false })
  if (!gl) return null

  const vert = `
    attribute vec2 aPos;
    varying vec2 vUv;
    void main() {
      vUv = aPos * 0.5 + 0.5;
      gl_Position = vec4(aPos, 0.0, 1.0);
    }
  `

  const compile = (type: number, src: string) => {
    const sh = gl.createShader(type)!
    gl.shaderSource(sh, src)
    gl.compileShader(sh)
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(sh), src)
      return null
    }
    return sh
  }

  const vs = compile(gl.VERTEX_SHADER, vert)
  const fs = compile(gl.FRAGMENT_SHADER, frag)
  if (!vs || !fs) return null

  const prog = gl.createProgram()!
  gl.attachShader(prog, vs)
  gl.attachShader(prog, fs)
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(prog))
    return null
  }
  gl.useProgram(prog)

  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(prog, 'aPos')
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

  const u: Record<string, WebGLUniformLocation | null> = {}
  for (const name of uniforms) u[name] = gl.getUniformLocation(prog, name)

  const size = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr))
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr))
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
    }
    gl.viewport(0, 0, canvas.width, canvas.height)
  }

  return {
    draw(set) {
      size()
      gl.useProgram(prog)
      if (u.uRes) gl.uniform2f(u.uRes, canvas.width, canvas.height)
      set(u, gl)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    },
    dispose() {
      gl.deleteProgram(prog)
      gl.deleteBuffer(buf)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
    },
  }
}

/**
 * Uploads a Float32Array as a 1D luminance texture the shader can sample.
 *
 * Used for the waveform and the spectrum: passing 1024 floats as uniforms is
 * not possible, and a texture lookup is what a shader is for. LUMINANCE and
 * UNSIGNED_BYTE because float textures need an extension that is not worth a
 * fallback path here — a byte of precision is more than a phosphor trace
 * resolves anyway.
 */
export function uploadData(
  gl: WebGLRenderingContext,
  tex: WebGLTexture,
  data: Float32Array,
  bipolar: boolean,
) {
  const bytes = new Uint8Array(data.length)
  for (let i = 0; i < data.length; i++) {
    const v = bipolar ? data[i] * 0.5 + 0.5 : data[i]
    bytes[i] = Math.max(0, Math.min(255, Math.round(v * 255)))
  }
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, data.length, 1, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, bytes)
}
