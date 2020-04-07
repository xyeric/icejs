import PropTypes from 'prop-types';

const config = {
  type: 'fetch',
  host: 'https://mocks.alibaba-inc.com',
  baseUrl: '/mock/D8iUX7zB',
  method: 'get',
  timeout: '3000',
  header: {
  },
  response: {
    success: PropTypes.bool.isRequired,
    data: PropTypes.object.isRequired,
    errorCode: PropTypes.string,
    errorMsg: PropTypes.string,
  },
  dataHandler(response, error) {
    return response.data;
  },
};

const getAll = {
  url: '/service_todos',
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
  uri: 'https://mocks.alibaba-inc.com/mock/D8iUX7zB/addTodo',
  method: 'post',
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
  }
};
