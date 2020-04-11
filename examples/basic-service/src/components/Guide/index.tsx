import * as React from 'react';
import { services } from 'ice';
import styles from './index.module.scss';

const service = services.todo;

const Guide = () => {
  const { request, data, loading } = service.useRequest('getAll');

  React.useEffect(() => {
    request();
  }, []);

  async function handleRequest() {
    const request = service.getRequest('addTodo');
    const data = await request({ title: 'a' });
    console.log('handleRequest', data);
  }

  function handleGetResult() {
    const result = service.getResult('addTodo');
    console.log('handleGetResult', result);
  }

  console.log(loading, data);

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
