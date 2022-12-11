import React from 'react';
import ReactDOM from 'react-dom/client';
import './style/index.css';
import AppRouter from './router';
import 'antd/dist/antd.min.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <>
    <AppRouter />
  </>
);