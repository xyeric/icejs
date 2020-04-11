import * as React from 'react';
import { store, services } from 'ice';
import styles from './index.module.scss';

const service = services.todo;

const Guide = () => {
  const { request, data, loading } = service.useRequest('getAll');
  const [ state ] = store.useModel('todos');

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
    const result = service.getResult('addTodo');
    console.log('handleGetResult', result);
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Welcome to icejs!</h2>
      <div>
        <button type="button" onClick={handleRequest}>
          添加任务
        </button>
        <button type="button" onClick={handleGetResult}>
          获取添加任务的结果
        </button>
      </div>
    </div>
  );
};

export default Guide;
