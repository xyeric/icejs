import React from 'react';
import { request as iceRequest, useRequest as useIceRequest } from 'ice';
import * as merge from 'lodash.merge';

export default function(configs) {
  const { config, requests, dataHandler } = configs;

  const results = {};
  Object.keys(requests).forEach((name) => {
    results[name] = {
      status: 'init',
      data: null,
      error: null,
    };
  });

  function getValue(name: string) {
    const { params: configParams, response: configResponse, ...configValues } = config;
    const { params: requestParams, response: requestResponse, ...requestValues  } = requests[name];
    const values = merge({}, configValues, requestValues);
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

  function useRequest(name: string) {
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

  function getRequest(name: string) {
    const { type, options } = getValue(name);
    return async (params?) => {
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

  function getResult(name: string) {
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

  let modelDispatchers;
  function bindModel(value) {
    modelDispatchers = value;
  }

  async function reload() {
    const result = await requestInitData();
    let nextState = result.dataMap;
    if (dataHandler) {
      nextState = dataHandler(result);
    }

    modelDispatchers.setState(nextState);
  }

  function useInit() {
    React.useEffect(() => {
      reload();
    }, []);
  }

  return {
    useRequest,
    getRequest,
    getResult,

    // 互转完备性
    useInit,
    bindModel,
    reload,
  };
}
