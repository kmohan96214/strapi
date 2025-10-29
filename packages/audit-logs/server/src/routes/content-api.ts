import type { Core } from '@strapi/types';
import { createContentApiRoutesFactory } from '@strapi/utils';

const createContentApiRoutes = createContentApiRoutesFactory((): Core.RouterInput['routes'] => {
  return [];
});

export default createContentApiRoutes;
