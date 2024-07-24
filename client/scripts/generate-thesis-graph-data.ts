import topics from './data/topics.json'
import germanNames from './data/german-names.json'
import internationalNames from './data/international-names.json'
import {
  IThesisProgressChartDataElement,
  ThesisState,
} from '../src/pages/ThesisOverviewPage/types/chart'
import { randomArrayElement } from '../src/utils/array'

const states: ThesisState[] = [
  ThesisState.proposal,
  ThesisState.writing,
  ThesisState.submitted,
  ThesisState.graded,
  ThesisState.finished,
]
const duration: Record<ThesisState, number> = {
  [ThesisState.proposal]: 1000 * 3600 * 24 * 30,
  [ThesisState.writing]: 1000 * 3600 * 24 * 30 * 4,
  [ThesisState.submitted]: 1000 * 3600 * 24 * 30,
  [ThesisState.graded]: 1000 * 3600 * 24 * 15,
  [ThesisState.finished]: 1000 * 3600 * 24 * 15,
}

const currentTime = Date.now()
const data: IThesisProgressChartDataElement[] = []

for (let a = 0; a < Math.min(internationalNames.length, topics.length); a++) {
  const state = randomArrayElement(states)

  const startTime =
    state === ThesisState.finished
      ? currentTime - Math.floor(1000 * 3600 * 24 * 30 * (4 + Math.random() * 8))
      : currentTime - Math.floor(1000 * 3600 * 24 * 30 * Math.random() * 4)
  let timeCounter = startTime

  const element: IThesisProgressChartDataElement = {
    advisor: randomArrayElement(germanNames),
    student: internationalNames[a],
    topic: topics[a],
    started_at: timeCounter,
    ended_at: null,
    state: state,
    timeline: [],
  }

  for (let b = 0; b <= states.indexOf(state); b++) {
    element.timeline.push({
      state: states[b],
      started_at: timeCounter,
    })

    timeCounter += Math.floor(duration[states[b]] * (0.5 + Math.random()))

    if (timeCounter >= currentTime) {
      const timeRatio = (currentTime - startTime) / (timeCounter - startTime)

      let lastStartedAt = startTime

      for (const c of element.timeline) {
        c.started_at = c.started_at - Math.floor((c.started_at - lastStartedAt) * timeRatio)

        lastStartedAt = c.started_at
      }

      timeCounter = timeCounter - Math.floor((timeCounter - lastStartedAt) * timeRatio)
    }
  }

  if (state === ThesisState.finished) {
    element.ended_at = Math.min(currentTime, timeCounter)
  }

  data.push(element)
}

console.log(JSON.stringify({ advisors: germanNames, data }))
