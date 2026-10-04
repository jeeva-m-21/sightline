export type NextRouteKind = 'page' | 'layout' | 'api_route' | 'server_action';

export interface NextRouteInfo {
  urlPath: string; // e.g. "/billing", "/api/checkout"
  kind: NextRouteKind;
  filePath: string;
  isDynamic: boolean;
  paramNames: string[];
}

export interface FeatureCluster {
  id: string;
  name: string;
  description: string;
  routes: NextRouteInfo[];
  filePaths: string[];
  entityIds: string[];
}
