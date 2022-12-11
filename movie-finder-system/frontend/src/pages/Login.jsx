import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, Typography, message, Modal } from "antd";
import { Link, useNavigate } from "react-router-dom";

const { Title } = Typography;

function Login (param) {
  const setIslog = param.param.setIslog;
  const navigate = useNavigate();

  const loginError = (errorMsg) => {
    Modal.error({
      title: 'Login failed',
      content: `${errorMsg}`,
    });
  };
  // get localStorage
  const localEmail = localStorage.getItem("localUserEmail");
  const localPassword = localStorage.getItem("localUserPassword");
  console.log("get localstorage: ", localEmail, localPassword);

  const loginAPI = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/user/auth/login', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        })
      });
      if (response.status === 400) {
        const msg = await response.json();
        loginError(msg.error);
        return;
      }
      if (response.status === 200) {
        const data = await response.json();
        //dispatch(Actions.auth.saveLoginToken({ token: data.token }));
        localStorage.setItem('token', data.token);
        localStorage.setItem('userid', data.userid);
        localStorage.setItem('isadmin',data.isadmin);
        // is log status would set in message step later
        message
        .success(`Welcome back! ${email}`, 1.5)
        .then(() => setIslog(true))
        .then(() => message.loading('Going to home page...', 0.8))
        .then(() => navigate("/home"));
      }
    } catch (err) {
      console.log("error catched", err);
    }
  };

  const onFinish = (values) => {
    if (values.remember) {
      console.log("stored in localstorage");
      localStorage.setItem("localUserEmail", values.email);
      localStorage.setItem("localUserPassword", values.password);
    }

    // do login API here
    console.log("calling login API...");
    loginAPI(values.email,values.password);
  };

  const onFinishFailed = (errorInfo) => {
    message.warning("Please fill in valid info !");
    console.log("Failed:", errorInfo);
  };

  return (
    <div className="page-background bgLight">
      <div className="form-container-sm">
        <div className="align-center-box pb3">
          <Title>Log in</Title>
        </div>
        <Form
          name="normal_login"
          className="login-form"
          initialValues={{
            email: localEmail ? localEmail : "",
            password: localPassword ? localPassword : "",
            remember: true,
          }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          size={"large"}
        >
          <Form.Item
            name="email"
            rules={[
              {
                required: true,
                type: "email",
                message: "Invalid email !",
              },
            ]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Email"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: "Please enter your password !",
              },
              {
                type: "string",
                min: 6,
                message: "password must be at least 6 characters !"
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>
          <div className="align-right-box move-top-10">
            <Link className="login-form-forgot" to="/register">
              Forgot password
            </Link>
          </div>

          <Form.Item>
            <Form.Item
              name="remember"
              valuePropName="checked"
              noStyle
              style={{ width: "70%" }}
            >
              <Checkbox>Remember me</Checkbox>
            </Form.Item>
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
              block
            >
              Log in
            </Button>
            <br />
            Or <Link to="/register">register now!</Link>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default Login;
