import PropTypes from 'prop-types';

const configResponse = {
  success: PropTypes.bool.isRequired,
  data: PropTypes.object.isRequired,
  errorCode: PropTypes.string,
  errorMsg: PropTypes.string,
};
type ConfigResponse = PropTypes.InferProps<typeof configResponse>;
const config = {
  options: {
    baseURL: 'https://mocks.alibaba-inc.com/mock/D8iUX7zB',
    method: 'get',
    timeout: 3000,
  },
  response: configResponse,
  dataHandler(response: ConfigResponse) {
    return response.data;
  },
};

const getAll = {
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

const addTodoResponse = {
  data: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    done: PropTypes.bool,
  }),
};
type AddTodoResponse = PropTypes.InferProps<typeof addTodoResponse>;
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
  response: addTodoResponse,
  dataHandler(response: AddTodoResponse) {
    return response.data;
  },
};

export default {
  config,
  requests: {
    getAll,
    addTodo,
  },
};
