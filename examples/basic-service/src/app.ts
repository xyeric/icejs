import { createApp, IAppConfig } from 'ice';

const appConfig: IAppConfig = {
  app: {
    rootId: 'ice-container',
  },
  request: {
    baseURL: 'https://mocks.alibaba-inc.com/mock/D8iUX7zB'
  }
};

createApp(appConfig);
