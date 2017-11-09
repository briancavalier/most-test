// @flow
import type { Scheduler } from '@most/types'
import { newTimeline, newScheduler } from '@most/scheduler'
import { VirtualTimer } from './VirtualTimer'

export const testScheduler = (): Scheduler =>
  newScheduler(new VirtualTimer(), newTimeline())
