import type { Core } from '@strapi/types';

/**
 * Register function that runs when the plugin is registered
 */
export default ({ strapi }: { strapi: Core.Strapi }) => {
  // Register permissions
  strapi.admin.services.permission.registerActions([
    {
      uid: 'read',
      displayName: 'Read',
      pluginName: 'audit-logs',
      section: 'settings',
    },
  ]);
};
