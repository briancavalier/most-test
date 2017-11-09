// @flow
import type { Disposable, Scheduler, Stream, Time } from '@most/types'
import { type Events, type Event, event, ended, errored } from './events'

export const collectEvents = <A> (stream: Stream<A>, scheduler: Scheduler): Promise<Events<Error, A>> =>
  new Promise(resolve => new Collect(stream, scheduler, resolve))

class Collect<A> {
  resolve: Events<Error, A> => void
  events: Event<A>[]
  disposable: Disposable

  constructor (stream: Stream<A>, scheduler: Scheduler, resolve: Events<Error, A> => void) {
    this.resolve = resolve
    this.events = []
    this.disposable = stream.run(this, scheduler)
  }

  event (t: Time, a: A): void {
    this.events.push(event(t, a))
  }

  end (t: Time): void {
    this._end(ended(this.events, t))
  }

  error (t: Time, e: Error) {
    this._end(errored(e, this.events, t))
  }

  _end (events: Events<Error, A>): void {
    this.disposable.dispose()
    this.resolve(events)
  }
}
