import * as React from 'react';
import { store } from 'ice';
import styles from './index.module.scss';
import todo from '../../services/todo';
import createService from '../../createService';

const service = createService(todo);

const Guide = () => {
  const { request, data, loading } = service.useRequest('getAll');
  const [ state ] = store.useModel('todos');

  React.useEffect(() => {
    // request();
  }, []);

  console.log(loading, data);
  console.log('state', state);

  async function handleRequest() {
    const request = service.getRequest('getAll');
    const data = await request();
    console.log(data);
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
