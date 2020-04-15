import * as React from 'react';
import * as merge from 'lodash.merge';
import * as transform from 'lodash.transform';
import iceRequest from '$ice/request/request';

type Options = Record<string ,any>;
type DataHandler = (response: any, error?: Error) => any;

interface BaseConfing {
  type?: string;
  options?: Options;
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

interface UseInitData {
  (model: any): void;
}

interface ReloadInitData {
  (): void;
}

interface Service {
  useInitData: UseInitData;
  reloadInitData: ReloadInitData;
}

export default function<S>(apiConfigs: APIConfigs, defaultConfig?: BaseConfing, dataHandler?: DataHandler) {
  type T<S> = {
    [K in keyof S]: S[K] & Result;
  }
  const service = transform(apiConfigs, (result, config, name) => {
    const { options, dataHandler } = getConfig(name);
    result[name] = async function(params?, setOptions?) {
      let data;
      let error;
      result[name].status = 'loading';

      let finallyOptions = options;
      if (params) {
        finallyOptions = merge({}, finallyOptions, { params });
      }
      if (setOptions) {
        finallyOptions = merge({}, finallyOptions, setOptions);
      }

      try {
        data = await iceRequest(finallyOptions);
        result[name].status = 'loaded';
      } catch (e) {
        result[name].status = 'error';
        error = e;
        // TODO 抛出错误才是更合理的，但是目前 iceluna 中 catch 了错误
        // throw error;
        console.error(e);
      }

      if (dataHandler) {
        // TODO 抛出错误才是更合理的，但是目前 iceluna 中 catch 了错误
        try {
          data = dataHandler(data, error);
        } catch (error) { /** Ignore */ }
      }

      result[name].data = data;
      result[name].error = error;
      return data;
    };

    result[name].status = 'init';
    result[name].data = null;
    result[name].error = null;
  });

  function getConfig(name) {
    const config = merge({}, defaultConfig, apiConfigs[name]);
    return config;
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

  async function reloadInitData() {
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
  function useInitData([, value]) {
    dispatchers = value;
    React.useEffect(() => {
      reloadInitData();
    }, []);
  }

  service.useInitData = useInitData;
  service.reloadInitData = reloadInitData;
  return service as (T<S> & Service);
}
