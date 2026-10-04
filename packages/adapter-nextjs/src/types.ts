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

export interface RepoFileNode {
  name: string;
  path: string;
  kind: 'directory' | 'file';
  fileType?: 'page' | 'route' | 'component' | 'server_action' | 'utility';
  urlPath?: string;
  isClientComponent?: boolean;
  isServerAction?: boolean;
  symbolsCount?: number;
  outgoingCount?: number;
  incomingCount?: number;
  children?: RepoFileNode[];
}

