module.exports = ({ types: t }, { routesPath, alias }) => {
  return {
    visitor: {
      ImportDeclaration(nodePath, state) {
        const isRoutesFile = (routesPath === state.filename);
        if (isRoutesFile) {
          let value = nodePath.node.source.value;
          if (typeof value === 'string') {
            // 配置式路由
            // default alias: import Home from '@/pages/Home';
            // custom alias: import Home from '$pages/Home';
            // relative path: import Home from '../pages/Home'
            const matchedAliasKey = matchAliasKey(alias, value);
            if (value.startsWith('@/pages') || value.includes('../pages') || matchedAliasKey) {
              const arr = value.split('/');
              const pageName = arr[arr.length -1];
              // replace to: import Home from 'ice/Home/Home'
              value = `ice/${pageName}/${pageName}`;
              replaceWith(t, nodePath, value);
            }

            // 约定式路由
            // e.g: import Home from '../src/pages/Home/index.tsx';
            if (value.startsWith('../src/pages')) {
              const pageName = value.split('/')[3];
              // replace to: import Home from './pages/Home/Home'
              value = `./pages/${pageName}/${pageName}`;
              replaceWith(t, nodePath, value);
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
              // default alias: const Home = lazy(() => import('@/pages/Home'));
              // custom alias: const Home = lazy(() => import('$pages/home));
              // relative path: const Home = lazy(() => import('../pages/Home'));
              const matchedAliasKey = matchAliasKey(alias, value);
              if (value.startsWith('@/pages') || value.includes('../pages') || matchedAliasKey) {
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

interface IAlias {
  [key: string]: string;
}

function matchAliasKey(alias: IAlias, value: string): string {
  let aliasKey = '';
  if (alias) {
    const aliasKeys = Object.keys(alias);
    aliasKeys.forEach(currKey => {
      if (value.startsWith(currKey)) {
        aliasKey = currKey;
      }
    });
  }
  return aliasKey;
}

function replaceWith(t, nodePath, value) {
  nodePath.replaceWith(
    t.ImportDeclaration(
      nodePath.node.specifiers,
      t.stringLiteral(value)
    )
  );
}
