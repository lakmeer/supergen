
//
// Simple multi-touch pointer manager
//

import { browser } from '$app/environment'
import { get, writable, derived, type Writable } from 'svelte/store'
import { lerp, unlerp, clamp, hypot, atan2, snap, PI } from '$lib/utils'

const NULL_POINTER = -1


// Types

export type PointerStore = Writable<PointerState>
export type PointerXform = (state:PointerState) => any


// Event Handlers

function start (pointer:PointerStore, event:PointerEvent) {
  if (get(pointer).id !== NULL_POINTER) return // Don't double-up

  pointer.update(state => {
    state.event = 'down'
    state.id = event.pointerId
    state.active = true
    return state 
  })

  // TODO: Test immediate mode
  if (get(pointer).options.immediate) move(pointer, event)
}

function move (pointer:PointerStore, event:PointerEvent) {
  if (get(pointer).id !== event.pointerId) return

  pointer.update(state => {
    if (state.options.recalculate) {
      state.bounds = state.node?.getBoundingClientRect()
    }

    if (!state.bounds) return state

    state.event = 'move'

    state.x = (event.clientX - state.bounds.left) / state.bounds.width*2 - 1
    state.y = (event.clientY - state.bounds.top) / state.bounds.height*2 - 1

    switch (state.options.clamp) {
      case 'square':
        state.x = clamp(state.x, -1, 1)
        state.y = clamp(state.y, -1, 1)
        break

      case 'circle':
        const dist = hypot(state.x, state.y)
        if (dist > 1) { state.x /= dist; state.y /= dist }
        break
    }

    switch (state.options.angleOrigin) {
      case 'bottom': state.a = atan2(state.x, -state.y); break
      case 'top':    state.a = atan2(state.x, -state.y); break
      default:       state.a = atan2(state.y, state.x);  break
    }

    state.r = hypot(state.x, state.y)

    return state
  })
}

function stop (pointer:PointerStore, event:PointerEvent) {
  if (get(pointer).id !== event.pointerId) return
  pointer.update(state => {
    state.id = NULL_POINTER
    state.event = 'up'
    state.active = false
    return state
  })
}


//
// New PointerStore
//

export function newPointer (opts:Partial<PointerOptions> = {}):PointerStore {
  let options:PointerOptions = {
    clamp:       'square',
    recalculate: true,
    immediate:   false,
    angleOrigin: 'default',
    ...opts
  }

  let state:PointerState = {
    id: NULL_POINTER,
    x:  0,
    y:  0,
    a:  0,
    r:  0,
    node: null,
    bounds: undefined,
    active: false,
    options,
    event: 'create'
  }

  return writable(state)
}


//
// Svelte Action
//

export function touchable (node:HTMLElement, pointer:Writable<PointerState>) {
  pointer.update(state => {
    state.event  = 'init'
    state.node   = node
    state.bounds = node.getBoundingClientRect()
    return state
  })

  allPointers.push(pointer)

  const _start = (event:PointerEvent) => {
    start(pointer, event)
  }

  node.addEventListener('pointerdown', _start)

  return {
    //update () {} // TODO: necessary?
    destroy () {
      allPointers.splice(allPointers.indexOf(pointer), 1)
      node.removeEventListener('pointerdown', _start)
    }
  }
}


//
// Global Setup
//

const allPointers:PointerStore[] = []

if (browser) {
  window.addEventListener('pointermove', (e:PointerEvent) => {
    allPointers.forEach(pointer => move(pointer, e))
  })

  window.addEventListener('pointerup', (e:PointerEvent) => {
    allPointers.forEach(pointer => stop(pointer, e))
  })
}


//
// Transform utilities
//

export function toLinearX (min:number, max:number, step:number, output:(value:number) => number) {
  return (state:PointerState) => output(snap(lerp(min, max, state.x * 0.5 + 0.5), step))
}

export function toLinearY (min:number, max:number, step:number, output:(value:number) => number) {
  return (state:PointerState) => output(snap(lerp(min, max, -state.y * 0.5 + 0.5), step))
}

