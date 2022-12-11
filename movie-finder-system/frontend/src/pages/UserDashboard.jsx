import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb, Layout, Button, Avatar, Card, Image, Rate, Empty, message, Spin, Divider, Modal, Tooltip } from 'antd';
import { UserOutlined, EditOutlined, CloseOutlined, UserDeleteOutlined, UserAddOutlined} from '@ant-design/icons';
import WishlistSvg from '../svg/like.svg';
import getFallback from "../svg/fallbackImg";

const { Content } = Layout;
const { Meta } = Card;
const fallback = getFallback(); // used when image loading error

const UserDashboard = () => {
  const userID = localStorage.getItem('userid');
  const [userName, setUserName] = useState('UserName');
  const [userEmail, setUserEmail] = useState('UserEmail');
  const [userImg, setUserImg] = useState();
  const [wishList, setWishList] = useState([]);
  const [follow, setFollow] = useState([]);
  const [follower, setFollower] = useState([]);
  const [ban, setBan] = useState([]);
  const [ifWishlist, setIfWishlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFollowVisible, setIsFollowVisible] = useState(false);
  const [isFollowerVisible, setIsFollowerVisible] = useState(false);
  const [isBanVisible, setIsBanVisible] = useState(false);
  const navigate = useNavigate();
  const key = 'updatable';

  const removeFollow = (id, name) => {
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
          content: `Successfully removed ${name} from followlist! :D`,
          key,
          duration: 2,
        });
        window.location.reload();
      }, 1000);
    })
  };

  const removeBan = (id, name) => {
    fetch(`http://localhost:5000/user/banned-list/remove?userid_banned=${id}&userid=${userID}`, {
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
          content: `Successfully removed ${name} from Banned list! :D`,
          key,
          duration: 2,
        });
        window.location.reload();
      }, 1000);
    })
  };

  const addFollow = (id, name) => {
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
            content: `Successfully added ${name} to followlist :D`,
            key,
            duration: 2,
          });
        }, 1000);        
      } else {
        message.warning(`${name} is already in the follow list.`)
      }
    })
  };

  const handleOk = () => {
    setIsFollowVisible(false);
    setIsFollowerVisible(false);
    setIsBanVisible(false);
  };

  const handleCancel = () => {
    setIsFollowVisible(false);
    setIsFollowerVisible(false);
    setIsBanVisible(false);
  };

  const jumpToPage = (path) => {
    navigate(path);
  };

  const jumpToDetail = (movieID, moviePoster) => {
    localStorage.setItem('movieID', movieID);
    localStorage.setItem('moviePoster', moviePoster);
    navigate(`/movie-details/${movieID}`);
  }

  const jumpToOthersDashboard = (otherUserID) => {
    navigate(`/dashboard/view/${otherUserID}`); 
  }

  const fetchData = (userID) => {
    fetch(`http://localhost:5000/user/dashboard/${userID}`, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then(res => res.json())
      .then(json => {
        setUserName(json.user_name);
        localStorage.setItem('userName', json.user_name);
        setUserEmail(json.email);
        localStorage.setItem('userEmail', json.email);
        if (json.userimg) {
          setUserImg(json.userimg);
          localStorage.setItem('userImg', json.userimg);
        } else {
          localStorage.setItem('userImg', null);          
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
        }
        if (json.banlist[0].length !== 0) {
          setBan(json.banlist);
        }
        setWishList(json.wishlist);
        setLoading(false);
      });
  }

  const checkFollow = () => {
    setIsFollowVisible(true);
  };

  const checkFollower = () => {
    console.log(follower);
    setIsFollowerVisible(true);
  };
  const checkBan = () => {
    console.log(ban);
    setIsBanVisible(true);
  };

  const removeFromWishList = (e, movieID) =>{
    e.stopPropagation();
    fetch(`http://localhost:5000/dashboard/wishlist-remove?movie_id=${movieID}&userid=${userID}`, {
      method: 'delete',
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then(res => res.json())
      .then(json => {
        message.success('Successfully removed from your wishlist! :)');
      })
      setTimeout(() => {
        window.location.reload();
      }, 1200);
  }

  useEffect(() => {
    fetchData(userID);
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
          <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
        </Breadcrumb>
        <div className='site-layout-content'>
          <div className='profile-wrapper'>
            <Avatar src={userImg} size={112} icon={<UserOutlined />} />
            <div className='profile'>
              <div className='name-id'>
                <div className='name'>{userName}</div> 
                <div className='id'>id: {userID}</div>
              </div>
              <div className='email'>{userEmail}</div>
              <div className='edit-profile'>
                <Button icon={<EditOutlined />} size='small' onClick={() => jumpToPage('/profile')}>Edit Profile</Button>
              </div>
            </div>
            <div className='control-panel'>
              <div className='control1'>
                <div className='number'>{follow.length}</div>
                <div className='text' onClick={checkFollow}>FOLLOWING</div>
                <Modal title="Following" visible={isFollowVisible} onOk={handleOk} onCancel={handleCancel} width={420}>
                  {follow.map((item, idx) => {
                        return (
                          <div className='follow-list' key={idx}>
                            <div>
                              <Avatar onClick={()=>jumpToOthersDashboard(item.user_id)} src={item.user_img} size={48} icon={<UserOutlined />} />
                            </div>
                            <div className='user-name'>
                              <p onClick={()=>jumpToOthersDashboard(item.user_id)}>{item.user_name} # {item.user_id}</p>
                            </div>
                            <UserDeleteOutlined style={{margin:'18px 0px 0px 0px', flex: '1',textAlign: 'right', opacity: '0.8'}}
                                                onClick={()=>removeFollow(item.user_id, item.user_name)}/>
                          </div>
                        )
                      })}
                  </Modal>
              </div>
              <div className='control1'>
                <div className='number'>{follower.length}</div>
                <div className='text' onClick={checkFollower}>FOLLOWERS</div>
                <Modal title="Followers" visible={isFollowerVisible} onOk={handleOk} onCancel={handleCancel} width={420}>
                  {follower.map((item, idx) => {
                          return (
                            <div className='follow-list' key={idx}>
                              <div>
                                <Avatar onClick={()=>jumpToOthersDashboard(item.user_id)} src={item.user_img} size={48} icon={<UserOutlined />} />
                              </div>
                              <div className='user-name'>
                                <p onClick={()=>jumpToOthersDashboard(item.user_id)}>{item.user_name} # {item.user_id}</p>
                              </div>
                              <UserAddOutlined style={{margin:'18px 0px 0px 0px', flex: '1',textAlign: 'right', opacity: '0.8'}}
                                                onClick={()=>addFollow(item.user_id, item.user_name)}/>
                            </div>
                          )
                        })}
                </Modal>
              </div>
              <div className='control1'>
                <div className='number'>{ban.length}</div>
                <div className='text' onClick={checkBan}>BANNED LIST</div>
                <Modal title="Banned list" visible={isBanVisible} onOk={handleOk} onCancel={handleCancel} width={420}>
                  {ban.map((item, idx) => {
                            return (
                              <div className='follow-list' key={idx}>
                                <div>
                                  <Avatar onClick={()=>jumpToOthersDashboard(item.user_id)} src={item.user_img} size={48} icon={<UserOutlined />} />
                                </div>
                                <div className='user-name'>
                                  <p onClick={()=>jumpToOthersDashboard(item.user_id)}>{item.user_name} # {item.user_id}</p>
                                </div>
                                <UserDeleteOutlined style={{margin:'18px 0px 0px 0px', flex: '1',textAlign: 'right', opacity: '0.8'}}
                                                onClick={()=>removeBan(item.user_id, item.user_name)}/>
                              </div>
                            )
                          })}
                </Modal>
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
                        <div style={{ paddingTop: "15px" }}>
                          <Button type="primary" icon={<CloseOutlined />} onClick={(e) => removeFromWishList(e, item.movie_id)} block>Wishlist</Button>
                        </div>
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

export default UserDashboard;