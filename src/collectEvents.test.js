// @flow
import { describe, it } from 'mocha'
import { eq } from '@briancavalier/assert'

import { type Events, Ended, event, ended, errored } from './events'
import type { Disposable, Time, Sink, Scheduler } from '@most/types'
import { delay } from '@most/scheduler'

import { collectEvents } from './collectEvents'
import { testScheduler } from './testScheduler'

describe('collectEvents', () => {
  it('given ended should collect events and end time', () => {
    const expected = ended([event(0, 0), event(1, 1)], 2)
    const s = new TestStream(expected)

    return collectEvents(s, testScheduler()).then(actual => eq(expected, actual))
  })

  it('given errored should collect events, error, and end time', () => {
    const expectedError = new Error()
    const expected = errored(expectedError, [event(0, 0), event(1, 1)], 2)
    const s = new TestStream(expected)

    return collectEvents(s, testScheduler()).then(actual => eq(expected, actual))
  })
})

class EventTask<A> {
  value: A
  sink: Sink<A>

  constructor (value: A, sink: Sink<A>) {
    this.value = value
    this.sink = sink
  }

  run (t: Time): void {
    this.sink.event(t, this.value)
  }

  error (t: Time, e: Error): void {
    this.sink.error(t, e)
  }

  dispose () {}
}

class ErrorTask<E: Error> {
  _error: E
  sink: Sink<any>

  constructor (error: E, sink: Sink<any>) {
    this._error = error
    this.sink = sink
  }

  run (t: Time): void {
    this.sink.error(t, this._error)
  }

  error (t: Time, e: Error): void {
    throw e
  }

  dispose () {}
}

class EndTask<A> {
  sink: Sink<A>

  constructor (sink: Sink<A>) {
    this.sink = sink
  }

  run (t: Time): void {
    this.sink.end(t)
  }

  error (t: Time, e: Error): void {
    this.sink.error(t, e)
  }

  dispose () {}
}

class TestStream<E: Error, A> {
  events: Events<E, A>

  constructor (events: Events<E, A>) {
    this.events = events
  }

  run (sink: Sink<A>, scheduler: Scheduler): Disposable {
    const { time, events } = this.events
    const tasks = events.map(({ time, value }) => delay(time, new EventTask(value, sink), scheduler))
    const last = this.events instanceof Ended
      ? delay(time, new EndTask(sink), scheduler)
      : delay(time, new ErrorTask(this.events.error, sink), scheduler)

    return {
      dispose (): void {
        tasks.forEach(t => t.dispose())
        last.dispose()
      }
    }
  }
}
