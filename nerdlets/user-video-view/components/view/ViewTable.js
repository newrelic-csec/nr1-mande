import React from 'react'
import PropTypes from 'prop-types'
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
import videoConfig from '../../../shared/config/VideoConfig'
import { formatTimestampAsDate } from '../../../shared/utils/date-formatter'
import { openVideoSession } from '../../../shared/utils/navigation'
import { getThresholdClass } from '../../../shared/utils/threshold'
import { VIDEO_EVENTS } from '../../../shared/config/constants'

export default class ViewTable extends React.Component {
  state = {
    column: 1,
    sortingType: TableHeaderCell.SORTING_TYPE.ASCENDING,
  }

  onSortTable(column, evt, { nextSortingType }) {
    if (column === this.state.column) {
      this.setState({ sortingType: nextSortingType })
    } else {
      this.setState({ column: column, sortingType: nextSortingType })
    }
  }

  openView = (evt, { item, idx }) => {
    openVideoSession(this.props.accountId, item.id, videoConfig.title)
  }

  render() {
    const { accountId, duration, session, views, scope } = this.props
    const nrql = `FROM ${VIDEO_EVENTS} SELECT min(timestamp) as 'startTime', latest(contentTitle) as 'contentTitle' WHERE viewSession = '${session.id}' and actionName != 'PLAYER_READY' LIMIT MAX ${duration.since} facet viewId`

    return (
      <NrqlQuery accountIds={[accountId]} query={nrql}>
        {({ data, error, loading }) => {
          if (loading) return <Spinner fillContainer />
          if (error) return <BlockText>{error.message}</BlockText>

          if (!data) return <div></div>

          const decoratedViews = views.map(v => {
            const viewData = data.filter(
              d => d.metadata.groups[1].value === v.id
            )

            let contentTitle = ''
            let startTime = null

            viewData.forEach(vd => {
              if (vd.data[0]['startTime']) startTime = vd.data[0]['startTime']
              if (vd.data[0]['contentTitle'])
                contentTitle = vd.data[0]['contentTitle']
            })

            const decoratedView = {
              id: v.id,
              startTime,
              contentTitle,
              qualityScore: v.qualityScore,
            }

            videoConfig.qualityScore.include.forEach(qs => {
              const kpis = v.kpis.find(k => k.defId === qs)
              decoratedView[qs] = kpis ? kpis.value : 0
            })

            return decoratedView
          })

          return (
            <Table items={decoratedViews}>
              <TableHeader>
                <TableHeaderCell
                  className="session-table__table-header"
                  value={({ item }) => item.id}
                  sortable
                  sortingType={
                    this.state.column === 0
                      ? this.state.sortingType
                      : TableHeaderCell.SORTING_TYPE.NONE
                  }
                  onClick={this.onSortTable.bind(this, 0)}
                >
                  View Id
                </TableHeaderCell>
                <TableHeaderCell
                  className="session-table__table-header"
                  value={({ item }) => item.startTime}
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
                  value={({ item }) => item.contentTitle}
                  sortable
                  sortingType={
                    this.state.column === 2
                      ? this.state.sortingType
                      : TableHeaderCell.SORTING_TYPE.NONE
                  }
                  onClick={this.onSortTable.bind(this, 2)}
                >
                  Title
                </TableHeaderCell>
                <TableHeaderCell
                  className="session-table__table-header"
                  value={({ item }) => item.qualityScore}
                  sortable
                  sortingType={
                    this.state.column === 3
                      ? this.state.sortingType
                      : TableHeaderCell.SORTING_TYPE.NONE
                  }
                  onClick={this.onSortTable.bind(this, 3)}
                >
                  Quality Score
                </TableHeaderCell>
                {videoConfig.qualityScore.include.map((qs, idx) => {
                  const metric = videoConfig.metrics.find(m => m.id === qs)
                  return (
                    <TableHeaderCell
                      key={idx}
                      className="session-table__table-header"
                    >
                      {metric.title}
                    </TableHeaderCell>
                  )
                })}
              </TableHeader>

              {({ item }) => (
                <TableRow onClick={this.openView}>
                  <TableRowCell className="session-table__row">
                    {item.id}
                  </TableRowCell>
                  <TableRowCell className="session-table__row">
                    {`${
                      item.startTime
                        ? formatTimestampAsDate(item.startTime)
                        : ''
                    }`}
                  </TableRowCell>
                  <TableRowCell className="session-table__row">
                    {item.contentTitle}
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
                  {videoConfig.qualityScore.include.map((qs, idx) => {
                    return (
                      <TableRowCell key={idx} className="session-table__row">
                        {item[qs]}
                      </TableRowCell>
                    )
                  })}
                </TableRow>
              )}
            </Table>
          )
        }}
      </NrqlQuery>
    )
  }
}

ViewTable.propTypes = {
  duration: PropTypes.object.isRequired,
  accountId: PropTypes.number.isRequired,
  session: PropTypes.object.isRequired,
  views: PropTypes.array.isRequired,
  scope: PropTypes.string.isRequired,
}
