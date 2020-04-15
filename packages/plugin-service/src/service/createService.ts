import * as React from 'react';
import * as merge from 'lodash.merge';
import * as transform from 'lodash.transform';
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

interface UseInit {
  (model: any): void;
}

interface ReloadInit {
  (): void;
}

interface Service {
  useInit: UseInit;
  reloadInit: ReloadInit;
}

export default function<S>(apiConfigs: APIConfigs, defaultConfig?: BaseConfing, dataHandler?: DataHandler) {
  type T<S> = {
    [K in keyof S]: S[K] & Result;
  }
  const service = transform(apiConfigs, (result, config, name) => {
    const { options } = getConfig(name);
    result[name] = async function(params?, setOptions?) {
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

    result[name].status = 'init';
    result[name].data = null;
    result[name].error = null;
  });

  function getConfig(name) {
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
    const initAPIs = {};
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
  return service as (T<S> & Service);
}
