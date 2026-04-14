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
        title: 'National Mathematics Olympiad - Questions',
        uri: '/admin/competitions/comp1/questions',
      },
      {
        title: 'Physics Challenge 2024 - Questions',
        uri: '/admin/competitions/comp2/questions',
      },
      {
        title: 'Chemistry Quiz Competition - Questions',
        uri: '/admin/competitions/comp3/questions',
      },
      {
        title: 'Computer Science Hackathon - Questions',
        uri: '/admin/competitions/comp4/questions',
      },
      {
        title: 'Literature Essay Contest - Questions',
        uri: '/admin/competitions/comp5/questions',
      },
    ],
    itemTitle: 'Competition Questions',
  };
}
