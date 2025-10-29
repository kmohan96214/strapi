import type { Core } from '@strapi/types';

/**
 * Get a service from the plugin
 */
export const getService = <T = any>(name: string): T => {
  return strapi.plugin('audit-logs').service(name);
};

/**
 * Get the plugin's configuration
 */
export const getPluginConfig = () => {
  return strapi.config.get('plugin.audit-logs', {
    enabled: true,
    excludeContentTypes: [],
  });
};
