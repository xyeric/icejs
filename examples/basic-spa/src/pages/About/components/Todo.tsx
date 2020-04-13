/* eslint @typescript-eslint/explicit-member-accessibility:0 */
import React, { PureComponent } from 'react';
import { ErrorBoundary } from 'ice';

class Todo extends PureComponent {
  componentDidMount() {
    throw new Error('test withErrorBoundary api');
  }

  render() {
    return (
      <ErrorBoundary>
        <div>
          TODO Component
        </div>
      </ErrorBoundary>
    );
  }
}

export default Todo;
