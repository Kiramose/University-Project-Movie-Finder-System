import React from 'react';
import ReactFileReader from 'react-file-reader';
import { useState } from 'react';
import { Breadcrumb, Layout, Button, Avatar, Form, Input, message, Modal } from 'antd';
import { UserOutlined, UploadOutlined } from '@ant-design/icons';
import EditSvg from '../svg/editor.svg'

const { Content } = Layout;

const Profile = () => {
  const localEmail = localStorage.getItem("userEmail");
  const localName = localStorage.getItem('userName');
  const localId = localStorage.getItem('userid');
  const localImg = localStorage.getItem('userImg');
  const localPassword = localStorage.getItem('localUserPassword');
  const [username, setUsername] = useState(localName);
  const [userImg, setUserimg] = useState(localImg);
  const [visible, setVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [newPassword, setNewPassword] = useState();
  const [confirmPassword, setConfirmPassword] = useState();
  const [changedPassword, setChangePassword] = useState(localPassword);

  const [form] = Form.useForm();
  const formLayout = 'vertical';
  const formItemLayout =
    formLayout === 'vertical'
      ? {
          labelCol: {
            span: 4,
          },
          wrapperCol: {
            span: 14,
          },
        }
      : null;
  const buttonItemLayout =
  formLayout === 'horizontal'
    ? {
        wrapperCol: {
          span: 14,
          offset: 4,
        },
      }
    : null;

  const fetchData = (newName, newImg, newPsw) => {
    fetch(`http://localhost:5000/user/profile-update/${localId}`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_name: newName,
        user_img: newImg,
        password: newPsw
      })
    })
    .then(res => res.json())
    .then(json => {
      console.log(json);
    })
  }

  const Update = () => {
    if (username !== '') {
      localStorage.setItem("userName", username);     
      localStorage.setItem('userImg', userImg);
      fetchData(username, userImg, changedPassword);
      message.success('Profile has been modified successfully!  :)');     
    } else {
      message.error('Username cannot be empety!  :)'); 
    }
  }

  const showModal = () => {
    setVisible(true);
  };

  const handleOk = () => {
    if (newPassword) {
      if (newPassword === confirmPassword) {
        setConfirmLoading(true);
        setChangePassword(newPassword);
        setTimeout(() => {
          setVisible(false);
          setConfirmLoading(false);
        }, 2000);   
        message.success('Passwords match! Please click Save button to save your new password :)');   
      } else {
        message.error('Passwords does not match!');  
      }
    } else {
      message.error('Password cannot be empty!'); 
    }
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleFiles = (img) => {
    setUserimg(img.base64);
  }

  return (
    <Layout className="layout">
      <Content
        style={{
          padding: '0 50px',
        }}
      >
        <Breadcrumb
          style={{
            margin: '30px 0',
          }}
        >
          <Breadcrumb.Item>Home</Breadcrumb.Item>
          <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
          <Breadcrumb.Item>Profile Settings</Breadcrumb.Item>
        </Breadcrumb>
        <div className='site-layout-content'>
          <div className='title-1'>
              <img className='svg-icon' src={EditSvg} />
              <span style={{marginLeft: '10px'}}>Profile Settings</span>
            </div>
          <div className='profile-wrapper-edit'>
            <div className='avatar-edit'>
              <Avatar src={userImg} size={140} icon={<UserOutlined />} />  
              <div className='upload-button'> 
                <ReactFileReader fileTypes={[".jpg",".png",".jpeg"]} base64={true} multipleFiles={false} handleFiles={handleFiles}>
                  <Button icon={<UploadOutlined />} style={{marginLeft: '-25px'}}>Click to Upload</Button>
                </ReactFileReader>                  
              </div>
        
            </div>
            <div className='settings-edit'>
              <Form
                {...formItemLayout}
                layout='vertical'
                form={form}
                initialValues={{
                  layout: formLayout,
                }}
                size='middle'
              >
                <Form.Item label="Username">
                  <Input id='username' value={username} onChange={(value) => setUsername(value.target.value)} defaultValue={localName} />
                </Form.Item>
                <Form.Item label="Email">
                  <Input defaultValue={localEmail} disabled/>
                </Form.Item>
                <Form.Item label="Id">
                  <Input defaultValue={localId} disabled/>
                </Form.Item>
                <div className='buttons'>
                  <Form.Item {...buttonItemLayout}>
                    <Button type="primary" onClick={showModal}>Change Password</Button>
                    <Modal
                      title="Change password"
                      visible={visible}
                      onOk={handleOk}
                      confirmLoading={confirmLoading}
                      onCancel={handleCancel}
                    >
                      <Form
                        name="basic"
                        labelCol={{
                          span: 8,
                        }}
                        wrapperCol={{
                          span: 12,
                        }}
                        initialValues={{
                          remember: false,
                        }}
                        autoComplete="off"
                      >
                        <Form.Item
                          label="New Password"
                          name="newPassword"
                          rules={[
                            {
                              required: true,
                              type: "string",
                              message: 'Please re-enter your new password!',
                            },
                            {
                              type: "string",
                              min: 6,
                              message: "password must be at least 6 characters !"
                            },
                          ]}
                        >
                          <Input.Password value={newPassword} onChange={(value) => setNewPassword(value.target.value)}/>
                        </Form.Item>
                        <Form.Item
                          label="Confirm Password"
                          name="confirmPassword"
                          rules={[
                            {
                              required: true,
                              type: "string",
                              message: 'Please enter your new password!',
                            },
                            {
                              type: "string",
                              min: 6,
                              message: "password must be at least 6 characters !"
                            },
                          ]}
                        >
                          <Input.Password value={confirmPassword} onChange={(value) => setConfirmPassword(value.target.value)}/>
                        </Form.Item>
                      </Form>
                    </Modal>
                  </Form.Item>  
                  <Form.Item {...buttonItemLayout}>
                    <Button type="primary" style={{marginLeft: '58px'}} onClick={Update}>Save</Button>
                  </Form.Item>                
                </div>
              </Form>
            </div>

          </div>          
        </div>
      </Content>
    </Layout>
  )

}

export default Profile;