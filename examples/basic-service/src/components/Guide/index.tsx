import * as React from 'react';
import todoService from '@/services/todo';
import styles from './index.module.scss';

const Guide = () => {
  async function handleRequest() {
    const data = await todoService.getAll();
    console.log('getAllResult', data);
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Welcome to icejs!</h2>
      <div>
        <button type="button" onClick={handleRequest}>
          请求数据
        </button>
      </div>
    </div>
  );
};

export default Guide;
