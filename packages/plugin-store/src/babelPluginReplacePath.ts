module.exports = ({ types: t }, { routesPath }) => {
  return {
    visitor: {
      ImportDeclaration(nodePath, state) {
        const isRoutesFile = (routesPath === state.filename);
        if (isRoutesFile) {
          let value = nodePath.node.source.value;
          if (typeof value === 'string') {
            // 配置式路由
            // e.g: import Home from '@/pages/Home';
            // e.g: import Home from '../pages/Home'
            if (value.startsWith('@/pages') || value.includes('../pages')) {
              const arr = value.split('/');
              const pageName = arr[arr.length -1];
              // replace to: import Home from 'ice/Home/Home'
              value = `ice/${pageName}/${pageName}`;
              nodePath.replaceWith(
                t.ImportDeclaration(
                  nodePath.node.specifiers,
                  t.stringLiteral(value)
                )
              );
            }

            // 约定式路由
            // e.g: import Home from '../src/pages/Home/index.tsx';
            if (value.startsWith('../src/pages')) {
              const pageName = value.split('/')[3];
              // replace to: import Home from './pages/Home/Home'
              value = `./pages/${pageName}/${pageName}`;
              nodePath.replaceWith(
                t.ImportDeclaration(
                  nodePath.node.specifiers,
                  t.stringLiteral(value)
                )
              );
            }
          }
        }
      },

      CallExpression(nodePath, state) {
        const isRoutesFile = (routesPath === state.filename);
        if (isRoutesFile) {
          const args = nodePath.node.arguments;
          for (let i = 0; i < args.length; i++) {
            let value = args[i].value;
            if (typeof value === 'string') {
              // 配置式路由
              // e.g: const Home = lazy(() => import('@/pages/Home'));
              // e.g: Home =lazy (() => import('../pages/Home'));
              if (value.startsWith('@/pages') || value.includes('../pages')) {
                const arr = value.split('/');
                const pageName = arr[arr.length -1];
                // replace to: const Home =lazy (() => import('ice/Home/Home'));
                value = `ice/${pageName}/${pageName}`;
                args[i].value = value;
              }

              // 约定式路由
              // e.g: const Home = lazy(() => import(/* webpackChunkName: 'Home' */ '../src/pages/Home/index.tsx'));
              if (value.startsWith('../src/pages')) {
                const pageName = value.split('/')[3];
                // replace to: import Home from './pages/Home/Home'
                value = `./pages/${pageName}/${pageName}`;
                args[i].value = value;
              }
            }
          }
        }
      },
    },
  };
};
