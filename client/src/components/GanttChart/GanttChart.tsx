import * as classes from './GanttChart.module.css'
import { arrayUnique } from '../../utils/array'
import { ReactNode, useState } from 'react'
import { Button, Collapse, Popover, RangeSlider } from '@mantine/core'
import { formatDate } from '../../utils/format'
import { CaretDown, CaretUp } from 'phosphor-react'

interface IGanttChartProps {
  columns: string[]
  data: Array<IGanttChartDataElement> | undefined
  itemPopover: (item: IGanttChartDataElement) => ReactNode
  onItemClick?: (item: IGanttChartDataElement) => unknown
  defaultRange?: number
}

export interface IGanttChartDataElement {
  id: string
  groupId: string
  groupName: string
  columns: string[]
  timeline: Array<{
    startDate: Date
    endDate: Date
    color: string
  }>
}

type DateRange = [number, number]

const isInDateRange = (range: DateRange, visibleRange: DateRange) => {
  const [rangeStart, rangeEnd] = range
  const [visibleStart, visibleEnd] = visibleRange

  return rangeEnd >= visibleStart && rangeStart <= visibleEnd
}

const GanttChart = (props: IGanttChartProps) => {
  const {
    columns,
    data,
    itemPopover,
    onItemClick,
    defaultRange = 3600 * 24 * 30 * 3 * 1000,
  } = props

  const [range, setRange] = useState<DateRange>()
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([])
  const [popover, setPopover] = useState<string>()

  if (!data || data.length === 0) {
    return null
  }

  const totalRange: DateRange = [
    Math.min(
      ...data.map((item) =>
        Math.min(...item.timeline.map((timelineItem) => timelineItem.startDate.getTime())),
      ),
    ),
    Math.max(
      ...data.map((item) =>
        Math.max(...item.timeline.map((timelineItem) => timelineItem.endDate.getTime())),
      ),
    ),
  ]
  const filteredRange: DateRange = [
    Math.max(totalRange[0], range?.[0] ?? totalRange[1] - defaultRange),
    Math.min(totalRange[1], range?.[1] ?? totalRange[1]),
  ]
  const filteredRangeDuration = filteredRange[1] - filteredRange[0]

  const groups: Array<{ groupId: string; groupName: string }> = arrayUnique(
    data.map((row) => ({
      groupId: row.groupId,
      groupName: row.groupName,
    })),
    (a, b) => a.groupId === b.groupId,
  )

  const generateTicks = () => {
    const timeOffset = 0.05 * filteredRangeDuration
    const startDate = new Date(filteredRange[0] + timeOffset)
    const endDate = new Date(filteredRange[1] - timeOffset)

    const maxTicks = 7

    let calculatedTicks: Array<{ label: string; type: string; value: number }> = []
    let lastYear = startDate.getFullYear()
    let lastMonth = startDate.getMonth()

    for (let time = startDate.getTime(); time <= endDate.getTime(); time += 3600 * 24 * 1000) {
      const currentDate = new Date(time)

      if (currentDate.getFullYear() !== lastYear) {
        calculatedTicks.push({
          label: `${currentDate.toLocaleString('default', { year: 'numeric' })}`,
          type: 'year',
          value: time,
        })
      } else if (currentDate.getMonth() !== lastMonth) {
        calculatedTicks.push({
          label: `${currentDate.toLocaleString('default', { month: 'long' })}`,
          type: 'month',
          value: time,
        })
      } else {
        calculatedTicks.push({
          label: `${currentDate.toLocaleString('default', { day: '2-digit' })}.`,
          type: 'day',
          value: time,
        })
      }

      lastYear = currentDate.getFullYear()
      lastMonth = currentDate.getMonth()
    }

    const priorityTicks = ['year', 'month']

    if (
      calculatedTicks.length > maxTicks &&
      calculatedTicks.some((row) => priorityTicks.includes(row.type))
    ) {
      calculatedTicks = calculatedTicks.filter((row) => priorityTicks.includes(row.type))
    }

    let lastTickCount = calculatedTicks.length
    while (calculatedTicks.length > maxTicks) {
      calculatedTicks = calculatedTicks.filter(
        (row, index) => priorityTicks.includes(row.type) || index % 2 === 0,
      )

      if (calculatedTicks.length === lastTickCount) {
        calculatedTicks = calculatedTicks.filter((row) => priorityTicks.includes(row.type))

        priorityTicks.pop()
      }

      lastTickCount = calculatedTicks.length
    }

    return calculatedTicks
  }

  const ticks = generateTicks()

  return (
    <div className={classes.chartContainer}>
      <div className={classes.chartBox}>
        <RangeSlider
          min={totalRange[0]}
          max={totalRange[1]}
          step={3600 * 24 * 1000}
          value={filteredRange}
          onChange={setRange}
          label={(value) => formatDate(new Date(value), { withTime: false })}
          mb='md'
        />
        <div className={classes.headers}>
          {columns.map((column) => (
            <div key={column} className={classes.dataHeader}>
              {column}
            </div>
          ))}
          <div className={classes.timelineHeader}>
            {ticks.map((tick) => (
              <div
                key={tick.value}
                className={classes.timelineTick}
                style={{
                  left: `${(100 * (tick.value - filteredRange[0])) / filteredRangeDuration}%`,
                }}
              >
                {tick.label}
              </div>
            ))}
          </div>
        </div>
        <div className={classes.content}>
          {groups.map((group) => (
            <div key={group.groupId} className={classes.groupRow}>
              <div>
                <Button
                  variant='transparent'
                  px={0}
                  onClick={() =>
                    setCollapsedGroups((prev) =>
                      prev.includes(group.groupId)
                        ? [...prev.filter((x) => x !== group.groupId)]
                        : [...prev, group.groupId],
                    )
                  }
                  rightSection={
                    collapsedGroups.includes(group.groupId) ? <CaretDown /> : <CaretUp />
                  }
                >
                  {group.groupName}
                </Button>
              </div>
              <div className={classes.groupContent}>
                <Collapse in={!collapsedGroups.includes(group.groupId)}>
                  {data
                    .filter((row) => row.groupId === group.groupId)
                    .map((item) => (
                      <Popover
                        key={item.id}
                        opened={popover === `${item.groupId}-${item.id}`}
                        withArrow
                        shadow='md'
                      >
                        <Popover.Target>
                          <div
                            className={classes.groupContentRow}
                            style={{
                              cursor: onItemClick ? 'pointer' : undefined,
                            }}
                            onMouseEnter={() => setPopover(`${item.groupId}-${item.id}`)}
                            onMouseLeave={() => setPopover(undefined)}
                            onClick={() => onItemClick?.(item)}
                          >
                            {columns.map((column, index) => (
                              <div
                                key={column}
                                className={classes.dataColumn}
                                title={item.columns[index]}
                              >
                                {item.columns[index]}
                              </div>
                            ))}
                            <div className={classes.timelineColumn}>
                              {item.timeline
                                .filter((timelineItem) =>
                                  isInDateRange(
                                    [
                                      timelineItem.startDate.getTime(),
                                      timelineItem.endDate.getTime(),
                                    ],
                                    filteredRange,
                                  ),
                                )
                                .map((timelineItem) => (
                                  <div
                                    key={timelineItem.startDate.getTime()}
                                    className={classes.timelinePart}
                                    style={{
                                      left: `${Math.max(
                                        (100 *
                                          (timelineItem.startDate.getTime() - filteredRange[0])) /
                                          filteredRangeDuration,
                                        0,
                                      )}%`,
                                      width: `${
                                        (100 *
                                          (Math.min(
                                            timelineItem.endDate.getTime(),
                                            filteredRange[1],
                                          ) -
                                            Math.max(
                                              timelineItem.startDate.getTime(),
                                              filteredRange[0],
                                            ))) /
                                        filteredRangeDuration
                                      }%`,
                                      backgroundColor: timelineItem.color,
                                    }}
                                  />
                                ))}
                            </div>
                          </div>
                        </Popover.Target>
                        <Popover.Dropdown style={{ pointerEvents: 'none' }}>
                          {itemPopover(item)}
                        </Popover.Dropdown>
                      </Popover>
                    ))}
                </Collapse>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default GanttChart
