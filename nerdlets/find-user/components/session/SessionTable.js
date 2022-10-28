import React from 'react'
import PropTypes from 'prop-types'
import isEqual from 'lodash.isequal'
import {
  BlockText,
  Spinner,
  NrqlQuery,
  Table,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableRowCell,
} from 'nr1'
import {
  formatTimestampAsDate,
  formatTimeAsString,
  milliseconds,
} from '../../../shared/utils/date-formatter'
import { getThresholdClass } from '../../../shared/utils/threshold'
import videoConfig from '../../../shared/config/VideoConfig'
import {
  FIND_USER_ATTRIBUTE,
  VIDEO_EVENTS,
} from '../../../shared/config/constants'

export default class SessionTable extends React.Component {
  state = {
    column: 1,
    sortingType: TableHeaderCell.SORTING_TYPE.ASCENDING,
  }

  getViewQualityCount = (views, threshold, above) => {
    const count = views.reduce(
      (acc, v) => {
        if (
          (above && v.qualityScore >= threshold) ||
          (!above && v.qualityScore < threshold)
        ) {
          acc.count += 1
          acc.views.push(v.id)
        }
        return acc
      },
      { count: 0, views: [] }
    )

    return count
  }

  onViewSession = (evt, { item, index }, scope) => {
    const session = this.props.sessionViews.find(
      s => s.session === item.session
    )

    this.props.chooseSession(session, scope)
  }

  onSortTable(column, evt, { nextSortingType }) {
    if (column === this.state.column) {
      this.setState({ sortingType: nextSortingType })
    } else {
      this.setState({ column: column, sortingType: nextSortingType })
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      !isEqual(nextProps.sessionViews, this.props.sessionViews) ||
      this.state != nextState
    )
      return true
    else return false
  }

  render() {
    const { accountId, duration, user, sessionViews } = this.props

    let userClause = ''
    FIND_USER_ATTRIBUTE.forEach(u => {
      if (userClause) userClause += ' OR '
      userClause += `${u} = '${user}'`
    })
    const nrql = `FROM ${VIDEO_EVENTS} SELECT min(timestamp), max(timestamp) WHERE ${userClause} LIMIT MAX ${duration.since} facet viewSession`

    return (
      <NrqlQuery accountIds={[accountId]} query={nrql}>
        {({ data, error, loading }) => {
          if (loading) return <Spinner fillContainer />
          if (error) return <BlockText>{error.message}</BlockText>

          if (!data) return <div></div>

          const timedSessions = sessionViews.map(s => {
            const timedResults = data.filter(
              d => d.metadata.groups[1].value === s.session
            )

            let minTime = 0
            let maxTime = 0

            timedResults.forEach(t => {
              if (t.data[0]['Min timestamp'])
                minTime = t.data[0]['Min timestamp']
              if (t.data[0]['Max timestamp'])
                maxTime = t.data[0]['Max timestamp']
            })

            const timedSession = {
              session: s.session,
              qualityScore: s.qualityScore,
              totalViews: s.views.reduce((acc, v) => {
                acc.push(v.id)
                return acc
              }, []),
              good: this.getViewQualityCount(s.views, 90, true),
              bad: this.getViewQualityCount(s.views, 90, false),
              minTime,
              maxTime,
              duration: maxTime - minTime,
            }

            return timedSession
          })

          return (
            <Table items={timedSessions}>
              <TableHeader>
                <TableHeaderCell className="session-table__table-header">
                  Session Id
                </TableHeaderCell>
                <TableHeaderCell
                  className="session-table__table-header"
                  value={({ item }) => item.minTime}
                  sortable
                  sortingType={
                    this.state.column === 1
                      ? this.state.sortingType
                      : TableHeaderCell.SORTING_TYPE.NONE
                  }
                  onClick={this.onSortTable.bind(this, 1)}
                >
                  Start Time
                </TableHeaderCell>
                <TableHeaderCell
                  className="session-table__table-header"
                  value={({ item }) => item.maxTime}
                  sortable
                  sortingType={
                    this.state.column === 2
                      ? this.state.sortingType
                      : TableHeaderCell.SORTING_TYPE.NONE
                  }
                  onClick={this.onSortTable.bind(this, 2)}
                >
                  End Time
                </TableHeaderCell>
                <TableHeaderCell
                  className="session-table__table-header"
                  value={({ item }) => item.duration}
                  sortable
                  sortingType={
                    this.state.column === 3
                      ? this.state.sortingType
                      : TableHeaderCell.SORTING_TYPE.NONE
                  }
                  onClick={this.onSortTable.bind(this, 3)}
                >
                  Duration
                </TableHeaderCell>
                <TableHeaderCell
                  className="session-table__table-header"
                  value={({ item }) => item.qualityScore}
                  sortable
                  sortingType={
                    this.state.column === 4
                      ? this.state.sortingType
                      : TableHeaderCell.SORTING_TYPE.NONE
                  }
                  onClick={this.onSortTable.bind(this, 4)}
                >
                  Quality Score
                </TableHeaderCell>
                <TableHeaderCell className="session-table__table-header">
                  Total Streams
                </TableHeaderCell>
                <TableHeaderCell className="session-table__table-header">
                  High Quality Streams
                </TableHeaderCell>
                <TableHeaderCell className="session-table__table-header">
                  Low Quality Streams
                </TableHeaderCell>
              </TableHeader>

              {({ item }) => (
                <TableRow onClick={this.onViewSession}>
                  <TableRowCell className="session-table__row">
                    {item.session}
                  </TableRowCell>
                  <TableRowCell className="session-table__row">
                    {formatTimestampAsDate(item.minTime)}
                  </TableRowCell>
                  <TableRowCell className="session-table__row">
                    {formatTimestampAsDate(item.maxTime)}
                  </TableRowCell>
                  <TableRowCell className="session-table__row">
                    {formatTimeAsString(item.duration, milliseconds)}
                  </TableRowCell>
                  <TableRowCell
                    className={`session-table__row bold ${getThresholdClass(
                      videoConfig.qualityScore.threshold,
                      item.qualityScore,
                      'greenLight'
                    )}`}
                  >
                    {item.qualityScore + ' %'}
                  </TableRowCell>
                  <TableRowCell className="session-table__row">
                    {item.totalViews.length}
                  </TableRowCell>
                  <TableRowCell className="session-table__row">
                    {item.good.count}
                  </TableRowCell>
                  <TableRowCell className="session-table__row">
                    {item.bad.count}
                  </TableRowCell>
                </TableRow>
              )}
            </Table>
          )
        }}
      </NrqlQuery>
    )
  }
}

SessionTable.propTypes = {
  duration: PropTypes.object.isRequired,
  accountId: PropTypes.number.isRequired,
  user: PropTypes.string.isRequired,
  sessionViews: PropTypes.array.isRequired,
  chooseSession: PropTypes.func.isRequired,
}
