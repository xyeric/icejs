import * as React from 'react';
import * as merge from 'lodash.merge';
import iceRequest from '$ice/request/request';

type Options = Record<string ,any>;
type DataHandler = (response: any, error?: Error) => any;

interface BaseConfing {
  type?: string;
  dataHandler?: DataHandler;
}

interface APIConfig extends BaseConfing {
  options: Options;
  isInit?: boolean;
}

export interface APIConfigs {
  [name: string]: APIConfig;
}

interface Result {
  status: 'init'|'loaded'|'loading'|'error';
  data: any;
  error: Error | null;
}

export default function<
  C extends APIConfigs = APIConfigs,
  D extends BaseConfing = BaseConfing
>(apiConfigs: C, defaultConfig?: D, dataHandler?: DataHandler) {
  type APIConfigKey = keyof C;
  type APIConfigKeys = APIConfigKey[];

  const service: any = {};
  (Object.keys(apiConfigs) as APIConfigKeys).forEach((name) => {
    const { options } = getConfig(name);
    service[name] = async function(params?, setOptions?) {
      let data;
      this.status = 'loading';

      let finallyOptions = options;
      if (params) {
        finallyOptions = merge({}, finallyOptions, { params });
      }
      if (setOptions) {
        finallyOptions = merge({}, finallyOptions, setOptions);
      }

      try {
        data = await iceRequest(finallyOptions);
        this.data = data;
        this.status = 'loaded';
      } catch (error) {
        this.error = error;
        this.status = 'error';
        throw error;
      }
      return data;
    };

    service[name].status = 'init';
    service[name].data = null;
    service[name].error = null;
  });

  function getConfig<K extends APIConfigKey>(name: K): APIConfig {
    const config = merge({}, defaultConfig, apiConfigs[name]);
    const { options = {}, dataHandler } = config;
    const { transformResponse = [] } = options;

    if (dataHandler) {
      transformResponse.push(function(response) {
        try {
          if (typeof response === 'string') {
            response = JSON.parse(response);
          }
          return dataHandler(response);
        } catch (e) { /* Ignore */ }
        return response;
      });
    }

    return {
      ...config,
      options: {
        ...options,
        transformResponse,
      }
    };
  }

  function getInitAPIs() {
    const initAPIs: any = {};
    Object.keys(apiConfigs).forEach((name) => {
      if (apiConfigs[name].isInit) {
        initAPIs[name] = service[name];
      }
    });
    return initAPIs;
  }

  async function requestInitData() {
    const initAPIs = getInitAPIs();
    const dataMap = {};
    let error;
    await Promise.all(Object.keys(initAPIs).map(async (name) => {
      const initAPI = initAPIs[name];
      try {
        dataMap[name] = await initAPI();
      } catch (e) {
        error = e;
      }
    }));
    return {
      dataMap,
      error,
    };
  }

  async function reloadInit() {
    const { dataMap, error } = await requestInitData();
    let nextState = dataMap;
    if (dataHandler) {
      nextState = dataHandler(dataMap, error);
    }

    if (dispatchers) {
      dispatchers.setState(nextState);
    }
  }

  let dispatchers;
  function useInit([, value]) {
    dispatchers = value;
    React.useEffect(() => {
      reloadInit();
    }, []);
  }

  service.useInit = useInit;
  service.reloadInit = reloadInit;
  return service;
}
