import bootstrap from './bootstrap';
import register from './register';
import contentTypes from './content-types';
import controllers from './controllers';
import routes from './routes';
import services from './services';
import config from './config';

export default () => ({
  register,
  bootstrap,
  routes,
  controllers,
  contentTypes,
  services,
  config,
});
