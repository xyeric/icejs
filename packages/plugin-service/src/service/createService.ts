import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as merge from 'lodash.merge';
import { Assign } from 'utility-types';
import iceRequest from '$ice/request/request';
import useIceRequest from '$ice/request/useRequest';

type PropType<Obj, Prop extends keyof Obj> = Obj[Prop];

type Options = Record<string ,any>;
type Params = Record<string ,any>;
type Response = Record<string ,any>;
type DataHandler = (response: any) => any;

interface BaseConfing {
  type?: string;
  options: Options;
  params?: Params;
  response?: Response;
  dataHandler?: DataHandler;
}

interface Config extends BaseConfing{
  dataHandler?: DataHandler;
}

interface RequestConfig extends BaseConfing {
  isInit?: boolean;
}

export interface ServiceConfigs {
  config: Config;
  requests: {
    [name: string]: RequestConfig;
  };
  dataHandler?(dataMap, error): any;
}

interface Result {
  status: 'init'|'loaded'|'loading'|'error';
  data: any;
  error: Error | null;
}

export interface Service<
  C extends ServiceConfigs,
> {
  useRequest: <K extends keyof C["requests"]>(name: K) => ReturnType<typeof useIceRequest>;
  getRequest:
  <K extends keyof C["requests"]>
  (name: K) =>
  ( params?: PropTypes.InferProps<Assign<C["config"]["params"], C["requests"][K]["params"]>> ) =>
  Promise<
  C["requests"][K]["dataHandler"] extends DataHandler
    ? ReturnType<C["requests"][K]["dataHandler"]>
    : C["config"]["dataHandler"] extends DataHandler
      ? ReturnType<C["config"]["dataHandler"]>
      : PropTypes.InferProps<Assign<C["config"]["response"], C["requests"][K]["response"]>>
  >;
  getResult: <K extends keyof C["requests"]>(name: K) => Result;
  bindModel: (model: any) => void;
  useInit: () => void;
  reloadInit: () => Promise<void>;
}

export default function<C extends ServiceConfigs>(configs: C): Service<C> {
  type IRequestsConfig = PropType<C, 'requests'>;
  type IConfig = PropType<C, 'config'>;
  type IRequestsConfigKey = keyof IRequestsConfig;
  type IRequestsConfigKeys = IRequestsConfigKey[];

  const { config, requests, dataHandler } = configs;

  const results: any = {};
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
    const { error, data, status } = state;
    results[name] = {
      data,
      error,
      status,
    };
    return state;
  }

  function getRequest<K extends IRequestsConfigKey>(name: K) {
    const { type, options } = getValue(name);
    return async (params) => {
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
