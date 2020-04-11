import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as merge from 'lodash.merge';
import iceRequest from '$ice/request/request';
import useIceRequest from '$ice/request/useRequest';

type PropType<Obj, Prop extends keyof Obj> = Obj[Prop];

type DataHandler = <T = any>(response: T) => T;

interface BaseConfing {
  type?: string;
  options: any;
  params?: any;
  response?: any;
  dataHandler?: DataHandler;
}

interface Config extends BaseConfing{
  dataHandler?: DataHandler;
}

interface RequestConfig extends BaseConfing {
  isInit?: boolean;
}

interface Configs {
  config: Config;
  requests: {
    [name: string]: RequestConfig;
  };
  dataHandler?(dataMap, error): any;
}

type InferProps<Value, Key extends keyof Value> = PropTypes.InferProps<PropType<Value, Key>>;

export default function<C extends Configs>(configs: C) {
  type IRequestsConfig = PropType<C, 'requests'>;
  type IConfig = PropType<C, 'config'>;
  type IRequestsConfigKey = keyof IRequestsConfig;
  type IRequestsConfigKeys = IRequestsConfigKey[];
  type Results<R> = {
    [K in keyof R]: {
      status: string;
      data: any;
      error: Error | null;
    }
  }
  const { config, requests, dataHandler } = configs;

  const results: Results<IRequestsConfig> = {} as any;
  (Object.keys(requests) as IRequestsConfigKeys).forEach((name) => {
    results[name] = {
      status: 'init',
      data: null,
      error: null,
    };
  });

  function getValue<K extends IRequestsConfigKey>(name: K): IConfig & IRequestsConfig[K] {
    const values = merge({}, config, requests[name as string]);
    const { options, dataHandler } = values;
    const transformResponse = options.transformResponse || [];
    if (dataHandler) {
      transformResponse.push(function(response) {
        let result;
        try {
          result = JSON.parse(response);
          return dataHandler(result);
        } catch (e) {
          // ignore error
        }
        return response;
      });
    }
    return {
      ...values,
      options: {
        ...options,
        transformResponse,
      }
    };
  }

  function useRequest<K extends IRequestsConfigKey>(name: K) {
    const { type, options } = getValue(name);
    const state = useIceRequest(options);
    const { error, data, status } = state as any;
    results[name] = {
      data,
      error,
      status,
    };
    return state;
  }

  function getRequest<K extends IRequestsConfigKey>(name: K) {
    type FinalConfig = IConfig & IRequestsConfig[K];
    // @todo
    // type FinalConfigDataHandle = PropType<FinalConfig, 'dataHandler'>;
    // type ReturnData = ReturnType<FinalConfigDataHandle>;
    type ReturnData = any; // InferProps<FinalConfig, 'response'>;
    const { type, options } = getValue(name);
    return async (params?: InferProps<FinalConfig, 'params'>): Promise<ReturnData> => {
      let data;
      results[name].status = 'loading';
      try {
        data = await iceRequest({
          ...options,
          params: {
            ...options.params,
            ...params,
          },
        });
        results[name].data = data;
        results[name].status = 'loaded';
      } catch (error) {
        results[name].error = error;
        results[name].status = 'error';
        throw error;
      }
      return data;
    };
  }

  function getResult<K extends IRequestsConfigKey>(name: K) {
    return Object.assign({}, results[name]);
  }

  function getInitRequests() {
    const initRequests: any = {};
    Object.keys(requests).forEach((name) => {
      const { isInit } = requests[name];
      if (isInit) {
        initRequests[name] = getRequest(name);
      }
    });
    return initRequests;
  }

  async function requestInitData() {
    const initRequests = getInitRequests();
    const dataMap = {};
    let error;
    await Promise.all(Object.keys(initRequests).map(async (name) => {
      const initRequest = initRequests[name];
      try {
        dataMap[name] = await initRequest();
      } catch (e) {
        error = e;
      }
    }));
    return {
      dataMap,
      error,
    };
  }

  let dispatchers;
  function bindModel([, value]) {
    dispatchers = value;
  }

  async function reloadInit() {
    const { dataMap, error } = await requestInitData();
    let nextState = dataMap;
    if (dataHandler) {
      nextState = dataHandler(dataMap, error);
    }

    dispatchers.setState(nextState);
  }

  function useInit() {
    React.useEffect(() => {
      reloadInit();
    }, []);
  }

  return {
    useRequest,
    getRequest,
    getResult,

    // 互转完备性
    bindModel,
    useInit,
    reloadInit,
  };
}
