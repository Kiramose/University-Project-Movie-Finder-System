import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Breadcrumb, Layout, Button, Avatar, Card, Image, Rate, Empty, message, Spin, Divider } from 'antd';
import { UserOutlined, UserAddOutlined, UserDeleteOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import WishlistSvg from '../svg/like.svg';
import getFallback from "../svg/fallbackImg";

const { Content } = Layout;
const { Meta } = Card;
const fallback = getFallback(); // used when image loading error

const OthersDashboard = () => {
  const { id } = useParams();
  const userID = localStorage.getItem('userid')
  const [userName, setUserName] = useState('UserName');
  const [userEmail, setUserEmail] = useState('UserEmail');
  const [userImg, setUserImg] = useState();
  const [wishList, setWishList] = useState([]);
  const [ifWishlist, setIfWishlist] = useState(false);
  const [follow, setFollow] = useState([]);
  const [follower, setFollower] = useState([]);
  const [ifFollow, setIfFollow] = useState(false);
  const [ifBan, setIfBan] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const key = 'updatable';

  const jumpToDetail = (movieID, moviePoster) => {
    navigate(`/movie-details/${movieID}`);
  }

  const addFollow = () => {
    if (userID != null) {
      fetch(`http://localhost:5000/user/follow-list/add?userid_follow=${id}&userid=${userID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
      })
      .then(res => res.json())
      .then(json => {
        // console.log(json);
        if (json.message) {
          message.loading({
            content: 'Adding...',
            key,
          });
          setTimeout(() => {
            message.success({
              content: `Successfully added ${userName} to followlist :D`,
              key,
              duration: 2,
            });
          }, 1000);        
        } else {
          message.warning(`${userName} is already in the follow list.`)
        }
      })      
    } else {
      message.error('Please login!')
    }
  };

  const removeFollow = () => {
    fetch(`http://localhost:5000/user/follow-list/remove?userid_follow=${id}&userid=${userID}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
    })
    .then(res => res.json())
    .then(json => {
      console.log(json);
      message.loading({
        content: 'Removing...',
        key,
      });
      setTimeout(() => {
        message.success({
          content: `Successfully removed ${userName} from followlist! :D`,
          key,
          duration: 2,
        });
        setIfFollow(true);
        window.location.reload();
      }, 1000);
    })
  };

  const addBan = () => {
    if (userID != null) {
      // remove from follow list first
      fetch(`http://localhost:5000/user/follow-list/remove?userid_follow=${id}&userid=${userID}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
      })
      .then(res => res.json())
      .then(json => {
        console.log(json);
      });
      // add to banned list
      fetch(`http://localhost:5000/user/banned-list/add?userid_banned=${id}&userid=${userID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
      })
      .then(res => res.json())
      .then(json => {
        if (json.message) {
          message.loading({
            content: 'Adding...',
            key,
          });
          setTimeout(() => {
            message.success({
              content: `Successfully added ${userName} to banned list!`,
              key,
              duration: 2,
            });
          }, 1000);        
        } else {
          message.warning(`${userName} is already in the banned list.`)
        }
      })
    } else {
      message.error('Please login!')
    }
  };

  const fetchData = (otherUserID) => {
    fetch(`http://localhost:5000/user/dashboard/${otherUserID}`, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then(res => res.json())
      .then(json => {
        setUserName(json.user_name);
        setUserEmail(json.email);
        if (json.userimg) {
          setUserImg(json.userimg);
        }
        if (json.wishlist[0].length !== 0) {
          setIfWishlist(true);
        } else {
          setIfWishlist(false);
        }
        if (json.followlist[0].length !== 0) {
          setFollow(json.followlist);
        }
        if (json.follower[0].length !== 0) {
          setFollower(json.follower);
          json.follower.map((item, idx) => {
            console.log(item.user_id);
            console.log(userID)
            if (item.user_id == userID) {
              setIfFollow(true);
              console.log('following...');
            }
          })
        }
        setWishList(json.wishlist);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData(id);
  }, [])

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
          <Breadcrumb.Item>View Others Dashboard</Breadcrumb.Item>
        </Breadcrumb>
        <div className='site-layout-content'>
          <div className='profile-wrapper'>
            <Avatar src={userImg} size={112} icon={<UserOutlined />} />
            <div className='profile'>
              <div className='name-id'>
                <div className='name'>{userName}</div> 
                <div className='id'>id: {id}</div>
              </div>
              <div className='email'>{userEmail}</div>
              <div className='add-to-follow'>
                {!ifFollow && <Button icon={<UserAddOutlined />} onClick={addFollow} size='small'>Follow</Button>}
                {ifFollow && <Button icon={<UserDeleteOutlined />} onClick={removeFollow} size='small'>Unfollow</Button>}
                <Button style={{marginLeft: '20px'}} icon={<EyeInvisibleOutlined />} onClick={addBan} size='small'>Ban</Button>
              </div>
            </div>
            <div className='control-panel-others'>
              <div className='1' style={{marginLeft: '25px'}}>
                <div className='number'>{follow.length}</div>
                <div className='text'>FOLLOWING</div>
              </div>
              <div className='2' style={{marginLeft: '15px'}}>
                <div className='number'>{follower.length}</div>
                <div className='text'>FOLLOWERS</div>
              </div>
            </div>
          </div>  
          <Divider />
          <div className='reviews-wrapper'></div>        
          <div className='wishlist-wrapper'>
            <div className='title-1' style={{marginBottom: '30px', marginTop: '-10px'}}>
              <img className='svg-icon' src={WishlistSvg} />
              <span style={{marginLeft: '10px'}}>Wish List</span>
            </div>
            <Spin spinning={loading}>
              <div className='content-row'>
                  {ifWishlist && wishList.map((item, idx) => {
                    return (
                      <Card
                        className="home-card"
                        type="inner"
                        hoverable
                        style={{
                          width: 200,
                        }}
                        key={idx}
                        cover={
                          <Image
                            alt="movie-R1-1"
                            src={ item.poster }
                            fallback={ fallback }
                          />
                        }
                        onClick={() => jumpToDetail(item.movie_id, item.poster)}
                      >
                        <Meta
                          title={ item.movie_name }
                          description={<Rate disabled allowHalf defaultValue={item.rate} />}
                        >
                        </Meta>
                      </Card>
                    )
                  })}
                  {!ifWishlist && <Empty style={{marginTop: '60px', marginBottom: '60px'}} description={'No movies'}/>}          
              </div>
            </Spin>

          </div>       
        </div>
      </Content>
    </Layout>
  )
}

export default OthersDashboard;