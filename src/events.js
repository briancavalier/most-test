// @flow
import type { Time } from '@most/types'

export type Event<A> = {
  time: Time,
  value: A
}

export type Events<E, A> = Ended<A> | Errored <E, A>

export const event = <A> (time: Time, value: A): Event<A> =>
  ({ time, value })

export const empty = <E, A> (): Events<E, A> =>
  new Ended([], 0)

export const ended = <E, A> (events: Event<A>[], time: Time): Events<E, A> =>
  new Ended(events, time)

export const errored = <E, A> (e: E, events: Event<A>[], time: Time): Events<E, A> =>
  new Errored(e, events, time)

export class Ended<A> {
  events: Event<A>[]
  time: Time

  constructor (events: Event<A>[], time: Time) {
    this.events = events
    this.time = time
  }
}

export class Errored<E, A> {
  events: Event<A>[]
  time: Time
  error: E

  constructor (error: E, events: Event<A>[], time: Time) {
    this.events = events
    this.time = time
    this.error = error
  }
}
