import * as React from 'react';
import { ErrorBoundary } from '$ice/components';

const wrapperComponent = (PageComponent) => {
  const { pageConfig = {} } = PageComponent;
  const StoreWrapperedComponent = (props) => {
    if (pageConfig.errorBoundary) {
      return (
        <ErrorBoundary>
          <PageComponent {...props} />
        </ErrorBoundary>
      );
    }
    return <PageComponent {...props} />;
  };
  return StoreWrapperedComponent;
};

const module = ({ addProvider, appConfig, wrapperRouteComponent }) => {
  wrapperRouteComponent(wrapperComponent);
  if (appConfig.app && appConfig.app.addProvider) {
    addProvider(appConfig.app.addProvider);
  }
};

export default module;
