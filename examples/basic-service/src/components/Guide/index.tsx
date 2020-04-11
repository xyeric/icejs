import * as React from 'react';
import { services } from 'ice';
import styles from './index.module.scss';

const service = services.todo;

const Guide = () => {
  const { status, request, data, loading } = service.useRequest('getAll');

  React.useEffect(() => {
    request();

  // eslint-disable-next-lint
  }, []);

  async function handleRequest() {
    const requestAddTodo = service.getRequest('addTodo');
    const addTodoResult = await requestAddTodo({ title: 'a' });
    console.log('handleRequest', addTodoResult);
  }

  function handleGetResult() {
    const resultForAddTodo = service.getResult('addTodo');
    console.log('handleGetResult', resultForAddTodo);
  }

  console.log(status, loading, data);

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
