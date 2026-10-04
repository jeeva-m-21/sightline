import { FeatureCluster, NextRouteInfo } from './types.js';

export class FeatureClusterer {
  /**
   * Groups detected Next.js routes and related files into <= 12 Product Features.
   */
  public clusterRoutes(routes: NextRouteInfo[]): FeatureCluster[] {
    const clusterMap = new Map<string, {
      name: string;
      description: string;
      routes: NextRouteInfo[];
      filePaths: Set<string>;
    }>();

    const getOrCreateCluster = (id: string, name: string, description: string) => {
      if (!clusterMap.has(id)) {
        clusterMap.set(id, {
          name,
          description,
          routes: [],
          filePaths: new Set(),
        });
      }
      return clusterMap.get(id)!;
    };

    for (const route of routes) {
      const url = route.urlPath.toLowerCase();

      // Rule 1: Auth
      if (
        url.includes('/auth') ||
        url === '/login' ||
        url === '/signup' ||
        url === '/register' ||
        url === '/forgot-password' ||
        url === '/reset-password'
      ) {
        const c = getOrCreateCluster('auth', 'Authentication', 'User login, registration, and session management');
        c.routes.push(route);
        c.filePaths.add(route.filePath);
        continue;
      }

      // Rule 2: Billing & Checkout
      if (
        url.includes('/billing') ||
        url.includes('/checkout') ||
        url.includes('/subscription') ||
        url.includes('/pricing') ||
        url.includes('/stripe')
      ) {
        const c = getOrCreateCluster('billing', 'Billing & Payments', 'Subscription tiers, checkout flows, and payment processing');
        c.routes.push(route);
        c.filePaths.add(route.filePath);
        continue;
      }

      // Rule 3: Settings & Account
      if (url.includes('/settings') || url.includes('/profile') || url.includes('/account')) {
        const c = getOrCreateCluster('settings', 'Account & Settings', 'User preferences, organization settings, and profile details');
        c.routes.push(route);
        c.filePaths.add(route.filePath);
        continue;
      }

      // Rule 4: Dashboard & Analytics
      if (url.includes('/dashboard') || url.includes('/analytics') || url.includes('/metrics')) {
        const c = getOrCreateCluster('dashboard', 'Dashboard & Analytics', 'Main application dashboard and performance metrics');
        c.routes.push(route);
        c.filePaths.add(route.filePath);
        continue;
      }

      // Rule 5: Root landing / public pages
      if (url === '/' || url === '/about' || url === '/contact' || url === '/faq') {
        const c = getOrCreateCluster('marketing', 'Landing & Public Pages', 'Public marketing pages, home, and landing views');
        c.routes.push(route);
        c.filePaths.add(route.filePath);
        continue;
      }

      // Rule 6: Generic API routes
      if (url.startsWith('/api')) {
        const c = getOrCreateCluster('api', 'API & Integrations', 'Backend route handlers and external API integrations');
        c.routes.push(route);
        c.filePaths.add(route.filePath);
        continue;
      }

      // Rule 7: Dynamic top-level segment
      const topSegment = url.split('/')[1] || 'general';
      const formattedName = topSegment.charAt(0).toUpperCase() + topSegment.slice(1);
      const c = getOrCreateCluster(
        topSegment,
        formattedName,
        `Feature capability for /${topSegment}`
      );
      c.routes.push(route);
      c.filePaths.add(route.filePath);
    }

    // Convert map to array
    const clusters: FeatureCluster[] = [];
    for (const [id, data] of clusterMap.entries()) {
      clusters.push({
        id,
        name: data.name,
        description: data.description,
        routes: data.routes,
        filePaths: Array.from(data.filePaths),
        entityIds: [],
      });
    }

    // Enforce <= 12 rule: If clusters > 12, merge lowest counts into "Other Features"
    if (clusters.length > 12) {
      clusters.sort((a, b) => b.routes.length - a.routes.length);
      const top = clusters.slice(0, 11);
      const overflow = clusters.slice(11);

      const mergedRoutes = overflow.flatMap((c) => c.routes);
      const mergedFiles = Array.from(new Set(overflow.flatMap((c) => c.filePaths)));

      top.push({
        id: 'misc',
        name: 'Additional Services',
        description: 'Supplementary features and secondary endpoints',
        routes: mergedRoutes,
        filePaths: mergedFiles,
        entityIds: [],
      });

      return top;
    }

    return clusters;
  }
}
