import { useReducer, useCallback } from 'react';
import { AxiosRequestConfig } from 'axios';
import axiosInstance from './axiosInstance';

/**
 * Hooks to make ajax request
 *
 * @param {object} options - axios config (https://github.com/axios/axios#request-config)
 * @return {object}
 *   @param {object} data - response of axios (https://github.com/axios/axios#response-schema)
 *   @param {object} error - HTTP or use defined error
 *   @param {boolean} loading - loading status of the request
 *   @param {function} request - function to make the request manually
 */
function useRequest(options: AxiosRequestConfig) {
  const initialState = {
    data: null,
    loading: false,
    error: null,
    status: 'init',
  };
  const [state, dispatch] = useReducer(requestReducer, initialState);

  /**
   * Method to make request manually
   * @param {object} config - axios config to shallow merged with options before making request
   */
  const request = useCallback(async (config?: AxiosRequestConfig) => {
    try {
      dispatch({
        type: 'loading'
      });

      const response = await axiosInstance({
        ...options,
        ...config
      });

      dispatch({
        type: 'loaded',
        data: response.data
      });
      return response.data;
    } catch (error) {
      dispatch({
        type: 'error',
        error
      });
      throw error;
    }
    // eslint-disable-next-line
  }, []);

  return {
    ...state,
    request
  };
}

/**
 * Reducer to handle the status of the request
 * @param {object} state - original status
 * @param {object} action - action of dispatch
 * @return {object} new status
 */
function requestReducer(state, action) {
  switch (action.type) {
    case 'loading':
      return {
        data: null,
        error: null,
        loading: true,
        status: action.type,
      };
    case 'loaded':
      return {
        data: action.data,
        error: null,
        loading: false,
        status: action.type,
      };
    case 'error':
      return {
        data: null,
        error: action.error,
        loading: false,
        status: action.type,
      };
    default:
      throw new Error();
  }
}

export default useRequest;
