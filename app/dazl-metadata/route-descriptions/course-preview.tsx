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
        title: 'Physics I',
        uri: '/course-preview/1',
      },
      {
        title: 'Mathematics I',
        uri: '/course-preview/2',
      },
      {
        title: 'Chemistry I',
        uri: '/course-preview/3',
      },
      {
        title: 'Engineering Drawing',
        uri: '/course-preview/4',
      },
      {
        title: 'Programming Fundamentals',
        uri: '/course-preview/5',
      },
    ],
    itemTitle: 'Course',
  };
}
