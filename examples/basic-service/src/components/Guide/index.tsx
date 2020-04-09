import * as React from 'react';
import { store, services } from 'ice';
import styles from './index.module.scss';
// import todo from '../../services/todo';
// import createService from '../../createService';

// const service = createService(todo);
const service = services.todo;
service.bindModel(store.getModel('todos'));

const Guide = () => {
  const { request, data, loading } = service.useRequest('getAll');
  const [ state ] = store.useModel('todos');
  service.useInit();

  React.useEffect(() => {
    request();
  }, []);

  console.log(loading, data);
  console.log('state', state);

  async function handleRequest() {
    const request = service.getRequest('addTodo');
    const data = await request({ title: 'a' });
    console.log('handleRequest', data);
  }

  function handleGetResult() {
    const result = service.getResult('getAll');
    console.log(result);
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Welcome to icejs!</h2>
      <div>
        <button type="button" onClick={handleRequest}>
          请求数据
        </button>
        <button type="button" onClick={handleGetResult}>
          获取请求结果
        </button>
      </div>
    </div>
  );
};

export default Guide;
