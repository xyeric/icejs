/* eslint @typescript-eslint/explicit-member-accessibility:0 */
import React, { PureComponent } from 'react';
import { withErrorBoundary } from 'ice';

class Todo extends PureComponent {
  componentDidMount() {
    throw new Error('test withErrorBoundary api');
  }

  render() {
    return (
      <div>
        TODO Component
      </div>
    );
  }
}

export default withErrorBoundary(Todo);
