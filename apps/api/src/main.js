import { config, logger } from './platform/index.js';
import { buildApp } from './app.js';

buildApp().listen(config.PORT, () => logger.info(`API listening on :${config.PORT}`));