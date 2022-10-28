import React from 'react'
import { Grid, GridItem, Stack, StackItem, NrqlQuery, Spinner } from 'nr1'
import Metric from '../../../shared/components/metric/Metric'
import { VIDEO_EVENTS } from '../../../shared/config/constants'

export default class SessionDetail extends React.PureComponent {
  composeNrqlQuery = (query, dataHandler, handlerParams) => {
    const { accountId, duration } = this.props
    const nrql = query + duration.since

    // console.debug('sessionDetail sessionDetails query', nrql)

    return (
      <NrqlQuery accountIds={[accountId]} query={nrql}>
        {({ data, error, loading }) => {
          if (loading) return <Spinner fillContainer />
          if (error) return <BlockText>{error.message}</BlockText>

          if (!data) return <div></div>
          return dataHandler(data, handlerParams)
        }}
      </NrqlQuery>
    )
  }

  buildSessionDetailGrid = data => {
    const gridItems = data.map((dataItem, idx) => {
      let key = dataItem.metadata.name.replace(/\s+/g, '')
      key = key.charAt(0).toLowerCase() + key.slice(1)

      return (
        <GridItem
          columnSpan={6}
          className="session-detail-grid-item"
          key={key + idx}
        >
          <div className="session-detail-item">
            <span className="session-detail-label">
              {dataItem.metadata.name}
            </span>
            <span className="session-detail-divider">:</span>
            <span className="session-detail-value">
              {dataItem.data[0][key]}
            </span>
          </div>
        </GridItem>
      )
    })

    return (
      <Grid
        className="session-detail-grid"
        spacingType={[Grid.SPACING_TYPE.NONE, Grid.SPACING_TYPE.NONE]}
      >
        {gridItems}
      </Grid>
    )
  }

  buildKpiStackItem = (results, metric) => {
    let value = results[0].data[0][metric.query.lookup]
    return (
      <Metric
        metric={{
          value: value,
          title: metric.title,
        }}
        threshold={metric.threshold}
        valueSize="large"
      />
    )
  }

  render() {
    const { session, stack } = this.props

    return (
      <Stack
        className="sessionStack"
        directionType={Stack.DIRECTION_TYPE.VERTICAL}
      >
        <Stack fullWidth={true} fullHeight={true}>
          <StackItem grow className="sessionStackItem sessionSectionBase">
            <div className="chart-title">Stream Details</div>
            {this.composeNrqlQuery(
              `SELECT latest(contentTitle), latest(appName), latest(deviceType), latest(appVersion), latest(osName), latest(asnOwner), latest(osVersion), latest(asnOrganization), latest(userAgentName), latest(city), latest(userAgentOS), latest(regionCode), latest(userAgentVersion), latest(countryCode) FROM ${VIDEO_EVENTS} WHERE viewId='${session}'`,
              this.buildSessionDetailGrid
            )}
          </StackItem>
        </Stack>

        {stack.metrics && (
          <div className="session-kpi-grid">
            {stack.metrics.map((metric, idx) => {
              return (
                <div key={metric.title + idx} className="session-kpi">
                  {this.composeNrqlQuery(
                    metric.query.nrql + ` WHERE viewId='${session}'`,
                    this.buildKpiStackItem,
                    metric
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Stack>
    )
  }
}
