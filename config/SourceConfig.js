export default {
  title: 'Source',
  eventTypes: [
    {
      event: 'Global',
      attributes: [
        ['appName', 'Platform'],
        ['playerVersion', 'Player'],
        ['playerName', 'Player'],
        ['contentSrc', 'Content'],
        ['countryCode', 'Geography'],
        ['contentIsLive', 'Content'],
        ['contentTitle', 'Content'],
      ],
    },
    {
      event: 'PageAction',
      eventSelector: { attribute: 'Delivery Type', value: 'Web' },
      attributes: [
        ['userAgentName', 'Platform'],
        ['userAgentOS', 'Platform'],
        ['userAgentVersion', 'Platform'],
        ['isAd', 'Content'],
        ['asnOrganization', 'Geography'],
        ['city', 'Geography'],
        ['regionCode', 'Geography'],
        ['message', 'Error'],
      ],
    },
    {
      event: 'MobileVideo',
      eventSelector: { attribute: 'Delivery Type', value: 'Mobile' },
      attributes: [
        ['isAd', 'Content'],
        ['asnOrganization', 'Geography'],
        ['city', 'Geography'],
        ['regionCode', 'Geography'],
        ['device', 'Platform'],
        ['deviceGroup', 'Platform'],
        ['deviceType', 'Platform'],
        ['osName', 'Platform'],
        ['osVersion', 'Platform'],
        ['message', 'Error'],
      ],
    },
    {
      event: 'RokuVideo',
      eventSelector: { attribute: 'Delivery Type', value: 'OTT' },
      attributes: [
        ['device', 'Platform'],
        ['deviceGroup', 'Platform'],
        ['deviceType', 'Platform'],
        ['osName', 'Platform'],
        ['osVersion', 'Platform'],
        ['errorMessage', 'Error'],
      ],
    },
  ],
  overviewConfig: [
    {
      nrql: `SELECT average(provider.bucketSizeBytes.Average/1000000) as 'MB' from DatastoreSample WHERE provider.bucketName like '%source%' and provider = 'S3Bucket'`,
      columnStart: 1,
      columnEnd: 6,
      chartSize: 'small',
      chartType: 'scatter',
      title: 'Bucket Size',
      useSince: true,
    },
    {
      nrql: `SELECT filter(count(*), WHERE actionName = 'CONTENT_REQUEST') as 'Total Requests', 
      filter(count(*), WHERE actionName = 'CONTENT_START') as 'Total Starts' 
      FROM PageAction TIMESERIES `,
      columnStart: 7,
      columnEnd: 12,
      chartSize: 'medium',
      chartType: 'line',
      title: 'Total Requests vs Total Starts',
      useSince: true,
    },
    {
      nrql: `SELECT filter(count(*), WHERE actionName = 'CONTENT_ERROR') / filter(count(*), WHERE actionName = 'CONTENT_REQUEST') as 'Video Errors', 
      filter(count(*), WHERE actionName = 'CONTEN_ERROR' and contentPlayhead = 0) AS 'Failures Before Start' FROM PageAction, MobileVideo, RokuVideo TIMESERIES `,
      columnStart: 1,
      columnEnd: 4,
      chartSize: 'medium',
      chartType: 'area',
      title: 'Video Errors and Failures Before Start',
      useSince: true,
    },
    {
      nrql: `SELECT filter(sum(timeSinceBufferBegin), WHERE actionName = 'CONTENT_BUFFER_END' and isInitialBuffering = 0) / filter(sum(playtimeSinceLastEvent), WHERE contentPlayhead is not null) as 'Rebuffer Ratio' FROM PageAction, MobileVideo, RokuVideo TIMESERIES `,
      columnStart: 5,
      columnEnd: 8,
      chartSize: 'medium',
      chartType: 'area',
      title: 'Video Errors and Failures Before Start',
      useSince: true,
    },
    {
      nrql: `SELECT filter(sum(timeSinceBufferBegin), WHERE actionName = 'CONTENT_BUFFER_END' and isInitialBuffering = 0) / filter(sum(playtimeSinceLastEvent), WHERE contentPlayhead is not null) as 'Rebuffer Ratio' FROM PageAction, MobileVideo, RokuVideo TIMESERIES `,
      columnStart: 9,
      columnEnd: 12,
      chartSize: 'medium',
      chartType: 'area',
      title: 'Interruption Ratio',
      useSince: true,
    },
  ],
  metrics: [
    {
      title: 'Source Bucket Size (Avg MB)',
      threshold: {
        critical: 500,
        warning: 300,
      },
      query: {
        nrql: `SELECT average(provider.bucketSizeBytes.Average/1000000) as 'result' from DatastoreSample WHERE provider.bucketName like '%source%' and provider = 'S3Bucket'`,
        lookup: 'result',
      },
      detailConfig: [
        {
          nrql: `SELECT average(provider.bucketSizeBytes.Average/1000000) as 'MB' from DatastoreSample WHERE provider.bucketName like '%source%' and provider = 'S3Bucket'`,
          columnStart: 1,
          columnEnd: 3,
          chartSize: 'medium',
          chartType: 'billboard',
          title: 'Source Bucket Size (MB)',
          useSince: true,
        },
        {
          nrql: `SELECT average(provider.bucketSizeBytes.Average/1000000) as 'MB' from DatastoreSample WHERE provider.bucketName like '%source%' and provider = 'S3Bucket'`,
          columnStart: 4,
          columnEnd: 12,
          chartSize: 'medium',
          chartType: 'line',
          title: 'Source Bucket Size (MB)',
          useSince: true,
        }
      ],
    },
    {
      title: 'Source 4xx Errors (Count)',
      threshold: {
        critical: 10,
        warning: 5,
      },
      query: {
        nrql: `SELECT sum(provider.error4xxErrors.Sum) as 'result' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%source%'`,
        lookup: 'result',
      },
      detailConfig: [
        {
          nrql: `SELECT sum(provider.error4xxErrors.Sum) as '4xx Errors' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%source%'`,
          columnStart: 1,
          columnEnd: 3,
          chartSize: 'medium',
          chartType: 'billboard',
          title: 'Source 4xx Errors',
          useSince: true,
        },
        {
          nrql: `SELECT sum(provider.error4xxErrors.Sum) as '4xx Errors' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%source%'`,
          columnStart: 4,
          columnEnd: 12,
          chartSize: 'medium',
          chartType: 'line',
          title: 'Source 4xx Errors',
          useSince: true,
        }
      ],
    },
    {
      title: 'Source 5xx Errors (Count)',
      threshold: {
        critical: 5,
        warning: 2,
      },
      query: {
        nrql: `SELECT sum(provider.error5xxErrors.Sum) as 'result' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%source%'`,
        lookup: 'result',
      },
      detailConfig: [
        {
          nrql: `SELECT sum(provider.error5xxErrors.Sum) as '5xx Errors' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%source%'`,
          columnStart: 1,
          columnEnd: 3,
          chartSize: 'medium',
          chartType: 'billboard',
          title: 'Source 5xx Errors',
          useSince: true,
        },
        {
          nrql: `SELECT sum(provider.error5xxErrors.Sum) as '5xx Errors' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%source%'`,
          columnStart: 4,
          columnEnd: 12,
          chartSize: 'medium',
          chartType: 'line',
          title: 'Source 5xx Errors',
          useSince: true,
        }
      ],
    },
    {
      title: 'Source All Requests',
      threshold: {
        critical: 400,
        warning: 300,
      },
      query: {
        nrql: `SELECT sum(provider.allRequests.Sum) as 'result' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%source%'`,
        lookup: 'result',
      },
      detailConfig: [
        {
          nrql: `SELECT sum(provider.allRequests.Sum) as 'Requests' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%source%'`,
          columnStart: 1,
          columnEnd: 3,
          chartSize: 'medium',
          chartType: 'billboard',
          title: 'Source All Requests',
          useSince: true,
        },
        {
          nrql: `SELECT sum(provider.allRequests.Sum) as 'Requests' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%source%'`,
          columnStart: 4,
          columnEnd: 12,
          chartSize: 'medium',
          chartType: 'line',
          title: 'Source All Requests',
          useSince: true,
        }
      ],
    },
    {
      title: 'Source # of Objects (Avg)',
      threshold: {
        critical: 10,
        warning: 8,
      },
      query: {
        nrql: `SELECT average(provider.numberOfObjects.Average) as 'result' from DatastoreSample WHERE provider.bucketName like '%source%'`,
        lookup: 'result',
      },
      detailConfig: [
        {
          nrql: `SELECT average(provider.numberOfObjects.Average) as 'Objects' from DatastoreSample WHERE provider.bucketName like '%source%'`,
          columnStart: 1,
          columnEnd: 3,
          chartSize: 'medium',
          chartType: 'billboard',
          title: 'Source # of Objects',
          useSince: true,
        },
        {
          nrql: `SELECT average(provider.numberOfObjects.Average) as 'Objects' from DatastoreSample WHERE provider.bucketName like '%source%'`,
          columnStart: 4,
          columnEnd: 12,
          chartSize: 'medium',
          chartType: 'line',
          title: 'Source # of Objects',
          useSince: true,
        }
      ],
    },
    {
      title: 'Source First Byte Latency - Avg (ms)',
      threshold: {
        critical: 150,
        warning: 100,
      },
      query: {
        nrql: `SELECT average(provider.firstByteLatency.Average) as 'result' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%source%'`,
        lookup: 'result',
      },
      detailConfig: [
        {
          nrql: `SELECT average(provider.firstByteLatency.Average) as 'ms' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%source%'`,
          columnStart: 1,
          columnEnd: 3,
          chartSize: 'medium',
          chartType: 'billboard',
          title: 'Source First Byte Latency (Avg - ms)',
          useSince: true,
        },
        {
          nrql: `SELECT average(provider.firstByteLatency.Average) as 'ms' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%source%'`,
          columnStart: 4,
          columnEnd: 12,
          chartSize: 'medium',
          chartType: 'line',
          title: 'Source First Byte Latency (Avg - ms)',
          useSince: true,
        }
      ],
    },
    {
      title: 'Total Request Latency - Avg (ms)',
      threshold: {
        critical: 200,
        warning: 180,
      },
      query: {
        nrql: `SELECT average(provider.totalRequestLatency.Average) as 'result' from DatastoreSample where provider='S3BucketRequests' where entityName like '%source%'`,
        lookup: 'result',
      },
      detailConfig: [
        {
          nrql: `FROM PageAction, MobileVideo, RokuVideo SELECT filter(uniqueCount(viewId), WHERE actionName = 'CONTENT_BUFFER_START' and contentPlayhead > 0) / filter(uniqueCount(viewId), WHERE actionName IN ('CONTENT_START', 'CONTENT_NEXT')) * 100 as '%' `,
          columnStart: 1,
          columnEnd: 3,
          chartSize: 'small',
          chartType: 'billboard',
          title: 'Views above Threshold (23%)',
          useSince: true,
        },
        {
          nrql: `FROM PageAction, MobileVideo, RokuVideo SELECT count(*) WHERE actionName = 'CONTENT_BUFFER_START' and contentPlayhead > 0 FACET viewId LIMIT 25 `,
          noFacet: true,
          columnStart: 4,
          columnEnd: 12,
          chartSize: 'small',
          chartType: 'bar',
          title: 'Views with Interruptions (Click for details)',
          useSince: true,
          click: 'openSession',
        },
        {
          nrql: `FROM PageAction, MobileVideo, RokuVideo SELECT filter(count(*), WHERE actionName = 'CONTENT_BUFFER_START' and contentPlayhead > 0) / filter(count(*), WHERE actionName IN ('CONTENT_START', 'CONTENT_NEXT')) * 100 as '%' `,
          columnStart: 1,
          columnEnd: 3,
          chartSize: 'small',
          chartType: 'billboard',
          title: 'Interruption Ratio',
          useSince: true,
        },
        {
          nrql: `FROM PageAction, MobileVideo, RokuVideo SELECT filter(count(*), WHERE actionName = 'CONTENT_BUFFER_START' and contentPlayhead > 0) / filter(count(*), WHERE actionName IN ('CONTENT_START', 'CONTENT_NEXT')) * 100 as '%' timeseries MAX `,
          facets: `deviceType`,
          columnStart: 4,
          columnEnd: 12,
          chartSize: 'small',
          chartType: 'line',
          title: 'Interruption Ratio',
          useSince: true,
        },
      ],
    },
  ],
}
