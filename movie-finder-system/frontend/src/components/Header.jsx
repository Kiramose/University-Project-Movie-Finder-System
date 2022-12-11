import React from "react";
import { Layout, Menu, message, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ExclamationCircleOutlined, CommentOutlined} from '@ant-design/icons';

const { Header } = Layout;


const AppHeader = (param) => {
    const islog = param.param.islog;
    const setIslog = param.param.setIslog;

  const navigate = useNavigate();
  const jumpToPage = (path) => {
    navigate(path);
  };

  const logoutAPI = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('You have not login yet, cannt log out!');
      return;
    } else {
      console.log('Going to logout token:', token);
    }
    try {
      const response = await fetch('http://localhost:5000/user/auth/logout', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          // Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 400) {
        console.log("logout failed, text show below, 400");
        console.log(await response.text());
        return;
      }
      if (response.status === 200) {
        message
          .success(`Logout success!`, 1.5);
      }
      // dispatch(Actions.auth.saveLoginToken({ token: null }));
      localStorage.removeItem('token');
      localStorage.removeItem('userid');
      localStorage.removeItem('isadmin');
      localStorage.removeItem('userImg');
      setIslog(false);
      navigate('/home');
    } catch (err) {
      console.log("error catched", err);
    }
  };

  // log out Modal calling
  const confirmLogout = () => {
    Modal.confirm({
      title: 'Do you really want to log out?',
      icon: <ExclamationCircleOutlined />,
      content: 'After log out, you would not see the personal recommendations.',
      okText: 'Yes',
      cancelText: 'Cancel',
      onOk() {
        console.log('OK,logout');
        logoutAPI();
      },
    });
  };

  return (
    <Layout className="layout">
      <Header className="header" style={{ opacity: '0.8' }}>
      <div className="logo" onClick={() => jumpToPage('/')}>OrdinaryMovie</div>
        <Menu theme="dark" mode="horizontal" style={{ justifyContent: 'end' }} >
          <Menu.Item key="0" onClick={() => jumpToPage('/')}>Home</Menu.Item>
          {!islog && <Menu.Item key="1" onClick={() => jumpToPage('/login')}>Login</Menu.Item>}
          {!islog && <Menu.Item key="2" onClick={() => jumpToPage('/register')}>Register</Menu.Item>}
          {/* {islog && <Menu.Item key="3" onClick={() => jumpToPage('/message-board')}><CommentOutlined /> Contact us</Menu.Item>} */}
          {islog && <Menu.Item key="4" onClick={() => jumpToPage('/dashboard')}>Dashboard</Menu.Item>}
          {islog && <Menu.Item key="5" onClick={confirmLogout}>Logout</Menu.Item>}
        </Menu>
      </Header>
    </Layout>   
  )
};

export default AppHeader;