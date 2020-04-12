import Home from 'ice/Home/Home';
import About from 'ice/About/About';

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
