import React from "react";
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import getFallback from "../svg/fallbackImg";
import { Layout, Input, Space, Breadcrumb, Card, Image, Button, Rate, Spin, Select, message, Modal } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import SearchSvg from '../svg/search.svg';

const { Search } = Input;
const { Content } = Layout;
const { Meta } = Card;
const { Option } = Select;
const fallback = getFallback();  // used when image loading error
const userID = localStorage.getItem('userid');
// console.log(userID);

const SearchResult = () => {
  const jumpToSearch2 = () => {
    if (searchInput === "") {
        Modal.warning({
            title: 'Empty search',
            content: 'Please select a Search by type and not leave search bar blank!',
        });
        return;
    }
    setLoading(true);
    if (searchType === 'byName') {
      navigate(`/search-result/byName/${searchInput}`);
      fetchName(searchInput, userID);      
    } else if (searchType === 'byKeyword') {
      navigate(`/search-result/byKeyword/${searchInput}`);
      fetchKeyword(searchInput, userID);
    } else if (searchType === 'byGenre') {
      navigate(`/search-result/byGenre/${searchInput}`);
      fetchGenre(searchInput, userID);
    } else if (searchType === 'byDirector') {
      navigate(`/search-result/byDirector/${searchInput}`);
      fetchDirector(searchInput, userID);
    } else {
      fetchName(initialInput, userID);
    }
  }
  const navigate = useNavigate();
  const { input, searchtype } = useParams();
  const initialInput = input;
  const initialSearchType = searchtype;
  const [searchType, setSearchType] = useState(initialSearchType);
  const [searchInput, setSearchInput] = useState(initialInput);
  const [nameResultNum, setNameResNum] = useState(0);
  const [titleName, setTitleName] = useState(initialInput)
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  console.log(searchtype);

  const changeSearchType = (value) => {
    setSearchType(value);
    // localStorage.setItem('searchtype', value);
  }

  const addToWishlist = (e,movieID,userID) => {
    e.stopPropagation();
    if (userID !== null) {
      fetch(`http://localhost:5000/dashboard/wishlist-add?movie_id=${movieID}&userid=${userID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
      })
      .then(res => res.json())
      .then(json => {
        // console.log(json)
        if (json.message) {
          message.success('Successfully added to your wishlist! :)');
        } else {
          message.error('The movie is already in the wishlist! :(');
        }
      });
    } else {
      message.error('Please login!')
    }
  }

  const fetchName = (name, userID) => {
    if (userID === null) {
      fetch(`http://localhost:5000/movie/search-name/${name}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      })
        .then(res => res.json())
        .then(json => {
          // console.log(json)
          localStorage.setItem('searchInput', name);
          if (json === null) {
            setLoading(false);
          }
          else {
            setTitleName(name);
            setNameResNum(json.length);
            setData(json);
            setLoading(false);          
          }
        });   
    } else {
      fetch(`http://localhost:5000/movie/search-name/${name}?userid=${userID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      })
        .then(res => res.json())
        .then(json => {
          // console.log(json)
          localStorage.setItem('searchInput', name);
          if (json === null) {
            setLoading(false);
          }
          else {
            setTitleName(name);
            setNameResNum(json.length);
            setData(json);
            setLoading(false);          
          }
        });      
    }
  }

  const fetchKeyword = (keyword, userID) => {
    if (userID === null) {
      fetch(`http://localhost:5000/movie/search-keyword/${keyword}`, {
        method: 'get',
        headers: {
          'Content-Type': 'application/json'
        },
      })
        .then(res => res.json())
        .then(json => {
          // console.log(json)
          localStorage.setItem('searchInput', keyword);
          if (json === null) {
            setLoading(false);
          }
          else {
            setTitleName(keyword);
            setNameResNum(json.length);
            setData(json);
            setLoading(false);          
          }
        });
    } else {
      fetch(`http://localhost:5000/movie/search-keyword/${keyword}?userid=${userID}`, {
        method: 'get',
        headers: {
          'Content-Type': 'application/json'
        },
      })
        .then(res => res.json())
        .then(json => {
          // console.log(json)
          localStorage.setItem('searchInput', keyword);
          if (json === null) {
            setLoading(false);
          }
          else {
            setTitleName(keyword);
            setNameResNum(json.length);
            setData(json);
            setLoading(false);          
          }
        });
    }
  }

  const fetchGenre = (genre, userID) => {
    if (userID === null) {
      fetch(`http://localhost:5000/movie/search-genre/${genre}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      })
        .then(res => res.json())
        .then(json => {
          // console.log(json)
          localStorage.setItem('searchInput', genre);
          if (json === null) {
            setLoading(false);
          }
          else {
            setTitleName(genre);
            setNameResNum(json.length);
            setData(json);
            setLoading(false);          
          }
        });
    } else {
      fetch(`http://localhost:5000/movie/search-genre/${genre}?userid=${userID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      })
        .then(res => res.json())
        .then(json => {
          // console.log(json)
          localStorage.setItem('searchInput', genre);
          if (json === null) {
            setLoading(false);
          }
          else {
            setTitleName(genre);
            setNameResNum(json.length);
            setData(json);
            setLoading(false);          
          }
        });
    }
  }

  const fetchDirector = (director, userID) => {
    if (userID === null) {
      fetch(`http://localhost:5000/movie/search-director/${director}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      })
        .then(res => res.json())
        .then(json => {
          // console.log(json)
          localStorage.setItem('searchInput', director);
          if (json === null) {
            setLoading(false);
          }
          else {
            setTitleName(director);
            setNameResNum(json.length);
            setData(json);
            setLoading(false);          
          }
        });      
    } else {
      fetch(`http://localhost:5000/movie/search-director/${director}?userid=${userID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      })
        .then(res => res.json())
        .then(json => {
          // console.log(json)
          localStorage.setItem('searchInput', director);
          if (json === null) {
            setLoading(false);
          }
          else {
            setTitleName(director);
            setNameResNum(json.length);
            setData(json);
            setLoading(false);          
          }
        }); 
    }
  }
  
  useEffect(() => {
    if (initialSearchType === 'byName') {
      fetchName(initialInput, userID);      
    } else if (initialSearchType === 'byKeyword') {
      fetchKeyword(initialInput, userID);
    } else if (initialSearchType === 'byGenre') {
      fetchGenre(initialInput, userID);
    } else if (initialSearchType === 'byDirector') {
      fetchDirector(initialInput, userID);
    } else {
      fetchName(initialInput, userID);
    }
  }, [])
  
  const jumpToDetail = (movieID, moviePoster) => {
    localStorage.setItem('movieID', movieID);
    localStorage.setItem('moviePoster', moviePoster);
    navigate(`/movie-details/${movieID}`);
  }

  return (
    <Layout className="layout">
      <Content
        className="mainpage-top-content"
        style={{
          paddingTop: "20px",
          margin: "0 15%",
        }}
      >
        <Breadcrumb
          style={{
            margin: '30px 0',
          }}
        >
          <Breadcrumb.Item>Home</Breadcrumb.Item>
          <Breadcrumb.Item>Search Result</Breadcrumb.Item>
        </Breadcrumb>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div className="align-center-box">
          <Input.Group>
            <Select defaultValue={searchType} size='large' onChange={changeSearchType} style={{width: '15%'}}>
              <Option value="byName">Title</Option>
              <Option value="byKeyword">Keyword</Option>
              <Option value="byGenre">Genre</Option>
              <Option value="byDirector">Director</Option>
            </Select>
              <Search
                defaultValue={searchInput}
                allowClear
                onSearch={jumpToSearch2}
                size="large"
                enterButton
                style={{
                  width: '85%'
                }}
                onChange={(value) => setSearchInput(value.target.value)}
              />
            </Input.Group>
          </div>
        </Space>
            <Spin spinning={loading}>
              <div className='title-3'>
                <img className='svg-icon-search' src={SearchSvg} />
                <span style={{marginLeft: '10px'}}>Find at least {nameResultNum} match for "{titleName}"</span>
              </div >
              <div className='content-row'>
                {data.map((item, idx) => {
                  return (
                    <Card
                      className="home-card"
                      type="inner"
                      hoverable
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
                      <div style={{ paddingTop: "15px" }}>
                      <Button type="primary" icon={<PlusOutlined />} onClick={(e) => addToWishlist(e, item.id, userID)} block>Wishlist</Button>
                      </div>
                    </Card>
                  )
                })}          
              </div>
            </Spin>
      </Content>
    </Layout>
  );
}

export default SearchResult ;