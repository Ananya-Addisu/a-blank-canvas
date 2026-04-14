interface SuggestedRoute {
  title: string;
  uri: string;
}

interface RouteDescription {
  suggestedRoutes: SuggestedRoute[];
  itemTitle: string;
}

export function getRouteDescription(): RouteDescription {
  return {
    suggestedRoutes: [
      {
        title: 'Freshman 1st Semester Bundle',
        uri: '/bundle-preview/f4bb7ab2-3411-4082-84c6-69692433bb4e',
      },
      {
        title: 'Freshman 2nd Semester Bundle',
        uri: '/bundle-preview/516cdf71-47be-4791-8a11-4e2228a57f62',
      },
      {
        title: '2nd Year Engineering 1st Semester Bundle',
        uri: '/bundle-preview/f365c99d-300d-4534-b9e6-d04db818374c',
      },
      {
        title: '2nd Year Engineering 2nd Semester Bundle',
        uri: '/bundle-preview/bc36941a-caff-4fb4-b591-34e89cf6bab8',
      },
    ],
    itemTitle: 'Bundle',
  };
}
