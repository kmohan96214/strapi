export default {
  default: {
    enabled: true,
    excludeContentTypes: [],
  },
  validator(config: any) {
    if (typeof config.enabled !== 'undefined' && typeof config.enabled !== 'boolean') {
      throw new Error('config.enabled must be a boolean');
    }
    if (typeof config.excludeContentTypes !== 'undefined' && !Array.isArray(config.excludeContentTypes)) {
      throw new Error('config.excludeContentTypes must be an array');
    }
  },
};
