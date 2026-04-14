import { courses } from "~/data/courses";

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
    suggestedRoutes: courses.map((course) => ({
      title: course.title,
      uri: `/course/${course.id}`,
    })),
    itemTitle: "Course",
  };
}
