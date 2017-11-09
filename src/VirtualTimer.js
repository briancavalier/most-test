// @flow
import type { Time, Delay, Handle } from '@most/types'

export type TimerTask = Time => void

export type TaskHandle = {
  active: boolean,
  f: TimerTask
}

export class VirtualTimer {
  _now: Time
  _target: Time

  constructor () {
    this._now = 0
    this._target = 0
  }

  now (): Time {
    return this._now
  }

  setTimer (f: TimerTask, dt: Delay): Handle {
    this._target = this._target + dt
    const task = { active: true, f }
    this._run(task, this._target)
    return task
  }

  clearTimer (t: Handle) {
    if (!t) {
      return
    }
    t.active = false
  }

  _run (task: TaskHandle, t: Time) {
    setTimeout((task, t, vt) => {
      if (!task.active) {
        return
      }
      vt._now = t
      task.f.call(undefined, t)
      vt._now = vt._target + 1
    }, 0, task, t, this)
  }
}
