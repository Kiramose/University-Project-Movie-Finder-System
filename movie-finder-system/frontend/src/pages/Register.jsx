import React from "react";
import { Button, Checkbox, Form, Input, Typography, message, Modal } from "antd";
import { Link, useNavigate } from "react-router-dom";
const { Title } = Typography;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
  },
};

function Register(param) {
  const setIslog = param.param.setIslog;
  const navigate = useNavigate();

  const registerError = (errorMsg) => {
    Modal.error({
      title: 'Register failed',
      content: `${errorMsg}`,
    });
  };
  // register API calls
  const registerAPI = async (email, password, name) => {
    const requestBody= JSON.stringify({
        name,
        email,
        password,
      });
    console.log(requestBody);
    try {
      const response = await fetch('http://localhost:5000/user/auth/register', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        body: requestBody,
      });
      if (response.status === 400) {
        const msg = await response.json();
        registerError(msg.error);
        return;
      }
      if (response.status === 200) {
        const data = await response.json();
        console.log(data);
        // dispatch(Actions.auth.saveLoginToken({ token: data.token }));
        localStorage.setItem('token', data.token);
        localStorage.setItem('userid', data.userid);
        localStorage.setItem('isadmin',data.isadmin);
        localStorage.setItem('localUserPassword', password);
        message
            .success(`Register success! ${email}`, 1.5)
            .then(() => setIslog(true))
            .then(() => message.loading('Going to home page...', 0.8))
            .then(() => navigate("/home"));
      }
    } catch (err) {
      console.log("catch err: ", err);
    }
  };

  const onFinish = (values) => {
    console.log("finish!", values);
    registerAPI(values.register_email, values.register_password, values.register_username);
  };
  
  const onFinishFailed = (errorInfo) => {
    console.log("failed finish: ", errorInfo);
  };

  return (
    <div className="page-background bgLight">
      <div className="form-container-sm">
        <div className="align-center-box pb3">
          <Title>Sign up</Title>
        </div>
        <Form
          {...formItemLayout}
          name="normal_register"
          className="register-form"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          size={"large"}
          initialValues={{
            email: "",
            password:"",
            username:"",
            agreement: true,
          }}
          scrollToFirstError
        >
          <Form.Item
            name="register_email"
            label="E-mail"
            rules={[
              {
                required: true,
                type: "email",
                message: "Email is not valid !",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="register_password"
            label="Password"
            rules={[
              {
                required: true,
                type: "string",
                message: "Password should not be blank !"
              },
              {
                type: "string",
                min: 6,
                message: "password must be at least 6 characters !"
              },
            ]}
            hasFeedback
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="register_confirm"
            label="Confirm Password"
            dependencies={["password"]}
            hasFeedback
            rules={[
              {
                required: true,
                message: "Please re-enter your password !",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("register_password") === value) {

                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(
                      "Two passwords doesn't match !"
                    )
                  );
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="register_username"
            label="UserName"
            tooltip="It's better to have a unique user name !"
            rules={[
              {
                required: true,
                message: "Username should not be blank !",
                whitespace: true,
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="agreement"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value
                    ? Promise.resolve()
                    : Promise.reject(new Error("Should accept agreement")),
              },
            ]}
            {...tailFormItemLayout}
          >
            <Checkbox>
              I have read the <a href="/register">agreement</a>
            </Checkbox>
          </Form.Item>
          <Form.Item {...tailFormItemLayout}>
            <Button type="primary" htmlType="submit">
              Register
            </Button>
            <br />
            Already have an account? <Link to="/login">Go to Log in !</Link>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default Register;
