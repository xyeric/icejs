import { lazy } from 'ice';

const Home = lazy(() => import('ice/Home/Home'));
const About =lazy (() => import('ice/About/About'));

export default [
  {
    path: '/',
    exact: true,
    component: Home
  },
  {
    path: '/about',
    component: About
  }
];
