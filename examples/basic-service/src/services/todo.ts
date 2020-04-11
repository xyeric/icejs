import PropTypes from 'prop-types';

const config = {
  options: {
    baseURL: 'https://mocks.alibaba-inc.com/mock/D8iUX7zB',
    method: 'get',
    timeout: 3000,
  },
  response: {
    success: PropTypes.bool.isRequired,
    data: PropTypes.object.isRequired,
    errorCode: PropTypes.string,
    errorMsg: PropTypes.string,
  },
  dataHandler(response) {
    return response.data;
  },
};

const getAll = {
  isInit: true, // 互转字段：初始化数据
  options: {
    url: '/getAll',
  },
  response: {
    data: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        done: PropTypes.bool,
      })
    ),
  },
};

const addTodo = {
  options: {
    url: 'https://mocks.alibaba-inc.com/mock/D8iUX7zB/addTodo', // 直接设置 url
    method: 'post',
    timeout: 5000,
    headers: {

    },
  },
  params: {
    title: PropTypes.string.isRequired,
    done: PropTypes.bool
  },
  response: {
    data: PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      done: PropTypes.bool,
    }),
  },
};

export default {
  config,
  requests: {
    getAll,
    addTodo,
  },

  // 互转字段，用户处理初始化请求的数据
  dataHandler(dataMap) {
    return { dataSources: dataMap.getAll };
  },
};
