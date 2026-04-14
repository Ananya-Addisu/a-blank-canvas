import { getSupabaseClient } from '~/lib/supabase.server';

interface SuggestedRoute {
  title: string;
  uri: string;
}

interface RouteDescription {
  suggestedRoutes: SuggestedRoute[];
  itemTitle: string;
}

export async function getRouteDescription(request: Request): Promise<RouteDescription> {
  const supabase = getSupabaseClient(request);
  
  const { data: libraryItems } = await supabase
    .from('library_items')
    .select('id, name')
    .order('created_at', { ascending: false })
    .limit(10);

  const suggestedRoutes: SuggestedRoute[] = (libraryItems || []).map((item) => ({
    title: item.name,
    uri: `/admin/library-manage/${item.id}`,
  }));

  return {
    suggestedRoutes,
    itemTitle: 'Library Category',
  };
}
