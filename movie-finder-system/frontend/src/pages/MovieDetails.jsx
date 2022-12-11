import React from 'react';
import { useState, useEffect } from 'react';
import { Breadcrumb, Layout, Image, Divider, Tabs, Tag, message, Popconfirm, Avatar, Comment, Tooltip, Input, Rate, Empty, Button, Modal, Form, Card } from 'antd';
import MovieSvg from '../svg/movie.svg';
import WishlistSvg from '../svg/like.svg';
import CommentSvg from '../svg/comment.svg'
import { HeartTwoTone, HighlightOutlined, UserOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import getFallback from "../svg/fallbackImg";

const { Content } = Layout;
const { TabPane } = Tabs;
const { Meta } = Card;
const { TextArea } = Input;
const fallback = getFallback(); // used when image loading error

const onChange = (key) => {
  console.log(key);
};

const desc = ['terrible', 'bad', 'normal', 'good', 'wonderful'];

const MovieDetails = (param) => {
  const navigate = useNavigate();
  const islog = param.param.islog;
  const setIslog = param.param.setIslog;
  const { movieID } = useParams();
  console.log("get in detail page of id:", movieID);

  const userID = localStorage.getItem('userid');
  const [moviePoster, setMoviePoster] = useState("error");
  const [movieName, setMovieName] = useState('name');
  const [movieDirector, setMovieDirector] = useState('director');
  const [movieOverview, setMovieOverview] = useState('overview');
  const [movieGenres, setMovieGenres] = useState(['a','b','c']);
  const [movieLanguage, setMovieLanguage] = useState('en');
  const [movieRuntime, setMovieRuntime] = useState(90);
  const [movieActors, setMovieActors] = useState(['a','b','c']);
  const [movieKeywords, setMovieKeywords] = useState(['a','b','c']);
  const [movieReviews, setMovieReviews] = useState([]);
  const [ifReviews, setIfReviews] = useState(false);
  const [movieRate, setMovieRate] = useState(0);
  const [writeReview, setWriteReview] = useState('');
  const [writeRate, setWriteRate] = useState(0);
  const [similar, setSimilar] = useState([]);

  const [visible, setVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const jumpToDetail = (movieID) => {
    navigate(`/movie-details/${movieID}`);
    window.location.reload();
  }

  const showModal = () => {
    if (islog) {
      setVisible(true);  
    } else {
      message.error('Please login first :)');
    }
  };

  const handleOk = () => {
    setConfirmLoading(true);
    console.log('rate:',writeRate);
    console.log('review:',writeReview); 
    if (writeReview) {
      fetch(`http://localhost:5000/movie/write-review/${movieID}`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userID,
          rate: writeRate,
          reviews: writeReview
        })
      })
      .then(res => res.json())
      .then(json => {
        setTimeout(() => {
          setVisible(false);
          setConfirmLoading(false);
          message.success('Your comment has been submitted :)')
        }, 2000);
      })
      setTimeout(() => {
        window.location.reload();
      }, 3000);      
    } else {
      message.error('Rate and comment are required :(')
      setConfirmLoading(false);
    }
  };

  const handleCancel = () => {
    console.log('Clicked cancel button');
    setVisible(false);
  };

  const confirm = () => {
    fetch(`http://localhost:5000/dashboard/wishlist-add?movie_id=${movieID}&userid=${userID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
    })
    .then(res => res.json())
    .then(json => {
      if (json.message) {
        message.success('Successfully added to your wishlist! :)');
      } else {
        message.error('The movie is already in the wishlist! :(');
      }
    });
  };


  const viewDashboard = (id) => {
    if (userID != id) {
      navigate(`/dashboard/view/${id}`); 
    } else {
      navigate(`/dashboard`); 
    }
  };

  const fetchData = (movieID, userID) => {
    if (userID !== null) {
      setIslog(true);
      fetch(`http://localhost:5000/movie/${movieID}?userid=${userID}`, {
        method: 'get',
        headers: {
          'Content-Type': 'application/json'
        },
      })
        .then(res => res.json())
        .then(json => {
          // console.log(json);
          setMovieName(json.name);
          setMovieDirector(json.director);
          setMovieOverview(json.overview);
          setMovieGenres(json.genres);
          setMovieLanguage(json.language);
          setMovieRuntime(json.runtime);
          setMovieActors(json.actor);
          setMovieKeywords(json.keywords);
          setMovieReviews(json.reviews);
          setMovieRate(json.rated);
          setSimilar(json.similar_recommend)
          // console.log(json.similar_recommend);
          if (json.poster !== "") {
            setMoviePoster(json.poster);
          }
          if (json.reviews[0].userid !== undefined) {
            setIfReviews(true);
          } else {
            setIfReviews(false);
          }
        });
    } else {
      fetch(`http://localhost:5000/movie/${movieID}`, {
        method: 'get',
        headers: {
          'Content-Type': 'application/json'
        },
      })
        .then(res => res.json())
        .then(json => {
          console.log(json);
          setMovieName(json.name);
          setMovieDirector(json.director);
          setMovieOverview(json.overview);
          setMovieGenres(json.genres);
          setMovieLanguage(json.language);
          setMovieRuntime(json.runtime);
          setMovieActors(json.actor);
          setMovieKeywords(json.keywords);
          setMovieReviews(json.reviews);
          setSimilar(json.similar_recommend)
          setMovieRate(json.rated);
          if (json.poster !== "") {
            setMoviePoster(json.poster);
          }
          if (json.reviews[0].userid !== undefined) {
            setIfReviews(true);
          } else {
            setIfReviews(false);
          }
        });      
    }
  };

  useEffect(() => {
    fetchData(movieID, userID);
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
          <Breadcrumb.Item>Movie details</Breadcrumb.Item>
        </Breadcrumb>
        <div className="site-layout-content">
          <div className='title-1'>
            <img className='svg-icon' src={MovieSvg} />
            <span style={{marginLeft: '10px'}}>Details</span>
          </div>
          <div className='details-and-img-wrapper'>
            <Image
              className='img-wrapper'
              src={moviePoster}
              fallback={fallback}
              style={{width: '320px',borderRadius: '8px'}}
            />
            <div className='details-wrapper'>
              <div className='title-2'>
                <div>{movieName}</div>
                {!islog && <Popconfirm
                  title="Please login first :)"
                  okText="OK"
                  cancelText="Canel"
                  showCancel={false}
                >
                  <div className='wishlist-icon' style={{marginLeft: '150px', size: '10px'}}><HeartTwoTone twoToneColor="#db3d56"/></div>
                </Popconfirm>}
                {islog && <Popconfirm
                  title="Add this movie to your wishlist?"
                  onConfirm={confirm}
                  okText="Yes"
                  cancelText="Canel"
                >
                  <div className='wishlist-icon' style={{marginLeft: '150px', size: '10px'}}><HeartTwoTone twoToneColor="#db3d56"/></div>
                </Popconfirm>}
              </div>
              <Divider style={{margin: '0px 0px 18px 0px'}}/>
              <div className='details-and-rate'>
                <div className='details'>
                  <div className='movie-rate'>
                    <div>
                      {ifReviews && <div style={{fontSize: '20px', marginLeft: '10px', marginRight: '10px'}}>{movieRate}</div>  }                  
                      {!ifReviews && <div className='not-rated'>No rates yet</div>  }                
                    </div>
                    <Rate disabled allowHalf={true} value={movieRate}/>   
                  </div>
                  {ifReviews && <div className='rates-num'>{movieReviews.length} people rated this movie</div>}
                  {!ifReviews && <div className='rates-num'>0 people rated this movie</div>}
                  <div className='director'>
                    Directed by <span className='director-name' style={{marginLeft: '5px'}}>{movieDirector}</span>
                  </div>
                  <div className='overview'>
                    {movieOverview}
                  </div>
                </div>      
              </div>
            </div>
          </div>
          <div className='detail-by-tabs'>
            <Tabs defaultActiveKey="1" onChange={onChange}>
              <TabPane tab="CAST" key="1">
                {movieActors.map((item, idx) => {
                  return (
                    <Tag key={idx}>{item}</Tag>
                  )
                })}
              </TabPane>
              <TabPane tab="GENRES" key="2">
                {movieGenres.map((item, idx) => {
                  return (
                    <Tag key={idx}>{item}</Tag>
                  )
                })}
              </TabPane>
              <TabPane tab="OTHER INFORMATION" key="3">
                <div className='keywords'>Keywords: </div>
                {movieKeywords.map((item, idx) => {
                    return (
                      <Tag key={idx}>{item}</Tag>
                    )
                  })}
                <div className='language' style={{marginTop: '8px'}}>Language: {movieLanguage}</div>
                <div className='runtime' style={{marginTop: '8px'}}>Run time: {movieRuntime} minuates</div>
              </TabPane>
            </Tabs>
          </div>
          <div className='title-1' style={{marginTop: '20px'}}>
            <img className='svg-icon' src={CommentSvg} />
            <span style={{marginLeft: '10px'}}>Reviews</span>
            <Button style={{marginLeft: '20px'}} icon={<HighlightOutlined />} onClick={showModal}>Write reviews</Button>
            <Modal
              title="Write some comment for this movie..."
              visible={visible}
              onOk={handleOk}
              confirmLoading={confirmLoading}
              onCancel={handleCancel}
              width={800}
            >
              <Form>
                <Form.Item 
                  label='Rate'
                  name='rate'
                  rules={[
                    {
                      required: true,
                      message: 'Please rate this movie!',
                    },
                  ]}
                  >
                    <Rate allowHalf 
                          tooltips={desc}
                          value={writeRate}
                          defaultValue={0}
                          onChange={setWriteRate}/>
                    {writeRate ? <span className="ant-rate-text">{desc[writeRate - 1]}</span> : ''}
                </Form.Item>
                <Form.Item label="Comment" 
                            name='comment'
                            rules={[
                              {
                                required: true,
                                message: 'Please write some reviews!',
                              },
                            ]}>
                  <TextArea rows={5}
                            allowClear={true}
                            value={writeReview}
                            onChange={(e)=>setWriteReview(e.target.value)}
                            />
                </Form.Item>
              </Form>
            </Modal>
          </div>
          {ifReviews && <div className='rates-num'>( {movieReviews.length} reviews )</div>}
          {!ifReviews && <div className='rates-num'>( 0 reviews )</div>}
          <div className='comment-area'>
            {ifReviews && movieReviews.map((item, idx) => {
              return (
                <Comment
                  key={idx}
                  author={<a onClick={() => viewDashboard(item.userid)}>{item.user_name} # {item.userid}</a>}
                  avatar={<Avatar src={item.userimg} alt={item.userid} icon={<UserOutlined />} onClick={() => viewDashboard(item.userid)}/>}
                  content={
                    <div className='comment'>
                      {item.comment}
                      <div className='comment-rate'>
                        <span>
                          <span style={{marginRight: '10px', opacity: '0.7', fontFamily: 'TiemposHeadlineWeb-Bold'}}>{item.rate}</span>
                          <Rate disabled allowHalf={true} defaultValue={item.rate}/>                
                        </span>
                      </div>
                    </div>
                  }
                  datetime={
                    <Tooltip title={item.create_time}>
                      <span>{item.create_time}</span>
                    </Tooltip>
                  }
                />                
              )
            })}
            {!ifReviews && <Empty style={{marginTop: '100px', marginBottom: '100px'}} description={'No reviews'}/>}
          </div>
          <div className='title-1' style={{marginTop: '20px'}}>
            <img className='svg-icon' src={WishlistSvg} />
            <span style={{marginLeft: '10px'}}>You may also like...</span>
          </div>
          <div className='content-row' style={{marginTop: '25px'}}>
            {console.log(similar)}
            {similar.map((item, idx) => {
              return (
                <Card
                  className="home-card"
                  type="inner"
                  hoverable
                  key={idx}
                  style={{
                    width: 200,
                  }}
                  cover={
                    <Image
                      alt="movie-R1-1"
                      src={ item.poster }
                      fallback={ fallback }
                    />
                  }
                  onClick={() => jumpToDetail(item.id, item.poster)}
                >
                  <Meta
                    title={ item.name }
                    description={<Rate disabled allowHalf defaultValue={item.rate} />}
                  >
                  </Meta>
                </Card>
              )
            })}          
          </div>
        </div>
      </Content>
    </Layout>
  )
}

export default MovieDetails;