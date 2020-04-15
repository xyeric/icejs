import * as React from 'react';
import localService from './service';

const User = () => {
  async function handleGetTodo() {
    const data = await localService.getTodo({ id: '1' });
    console.log('data', data);
    console.log(localService.getTodo.data);
    console.log(localService.getTodo.error);
    console.log(localService.getTodo.status);
  }

  async function handleGetUser() {
    const data = await localService.getUser({ id: '1' });
    console.log('data', data);
    console.log(localService.getUser.data);
    console.log(localService.getUser.error);
    console.log(localService.getUser.status);
  }

  return (
    <div>
      <button type="button" onClick={handleGetTodo}>
        获取任务
      </button>
      <button type="button" onClick={handleGetUser}>
        获取用户
      </button>
    </div>
  );
};

export default User;
