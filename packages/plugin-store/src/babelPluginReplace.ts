// eslint-disable-next-line no-unused-vars
module.exports = ({ types: t }, { routeFile }) => {
  return {
    visitor: {
      ImportDeclaration(path, state) {
        const isRouteFile = (routeFile === state.filename);
        if (isRouteFile) {
          let value = path.node.source.value;
          // source: import Home from '@/pages/Home';
          // source: import Home from '../pages/Home'
          if (typeof value === 'string') {
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
          }
        }
      },

      CallExpression(path, state) {
        const isRouteFile = (routeFile === state.filename);
        if (isRouteFile) {
          const args = path.node.arguments;
          for (let i = 0; i < args.length; i++) {
            let value = args[i].value;
            // const Home = lazy(() => import('@/pages/Home'));
            // const Home =lazy (() => import('../pages/Home'));
            if (typeof value === 'string') {
              if (value.startsWith("@/pages") || value.startsWith("../pages")) {
                const pageName = value.split("/")[2];
                // replace to: const Home =lazy (() => import('ice/Home/Home'));
                value = `ice/${pageName}/${pageName}`;
                args[i].value = value;
              }
            }
          }
        }
      },
    },
  };
};
