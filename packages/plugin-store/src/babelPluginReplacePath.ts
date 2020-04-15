module.exports = ({ types: t }, { routesPath }) => {
  return {
    visitor: {
      ImportDeclaration(path, state) {
        const isRoutesFile = (routesPath === state.filename);
        if (isRoutesFile) {
          let value = path.node.source.value;
          if (typeof value === 'string') {
            // e.g: import Home from '@/pages/Home';
            // e.g: import Home from '../pages/Home'
            if (value.startsWith("@/pages") || value.startsWith("../pages")) {
              const pageName = value.split("/")[2];
              // replace to: import Home from 'ice/Home/Home'
              value = `ice/${pageName}/${pageName}`;
              path.replaceWith(
                t.ImportDeclaration(
                  path.node.specifiers,
                  t.stringLiteral(value)
                )
              );
            }

            // e.g: import Home from '../src/pages/Home/index.tsx';
            if (value.startsWith("../src/pages")) {
              const pageName = value.split("/")[3];
              // replace to: import Home from './pages/Home/Home'
              value = `./pages/${pageName}/${pageName}`;
              path.replaceWith(
                t.ImportDeclaration(
                  path.node.specifiers,
                  t.stringLiteral(value)
                )
              );
            }
          }
        }
      },

      CallExpression(path, state) {
        const isRoutesFile = (routesPath === state.filename);
        if (isRoutesFile) {
          const args = path.node.arguments;
          for (let i = 0; i < args.length; i++) {
            let value = args[i].value;
            if (typeof value === 'string') {
              // e.g: const Home = lazy(() => import('@/pages/Home'));
              // e.g: Home =lazy (() => import('../pages/Home'));
              if (value.startsWith("@/pages") || value.startsWith("../pages")) {
                const pageName = value.split("/")[2];
                // replace to: const Home =lazy (() => import('ice/Home/Home'));
                value = `ice/${pageName}/${pageName}`;
                args[i].value = value;
              }

              // e.g: const Home = lazy(() => import(/* webpackChunkName: 'Home' */ '../src/pages/Home/index.tsx'));
              if (value.startsWith("../src/pages")) {
                const pageName = value.split("/")[3];
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
