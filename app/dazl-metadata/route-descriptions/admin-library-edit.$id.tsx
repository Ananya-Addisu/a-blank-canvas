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
        title: 'Mathematics Resources',
        uri: '/admin/library/edit/b4786fba-e720-42e5-8a91-1547678f3358',
      },
      {
        title: 'Biology Resources',
        uri: '/admin/library/edit/79e22f2c-9782-4de8-8b93-cba02ba93c35',
      },
      {
        title: 'History Resources',
        uri: '/admin/library/edit/0b3140b4-21fc-438b-ab22-5702c25f291c',
      },
      {
        title: 'Past Exams',
        uri: '/admin/library/edit/72a479e0-bea1-47ca-8a50-9c8aea780e14',
      },
    ],
    itemTitle: 'Library Tab',
  };
}
