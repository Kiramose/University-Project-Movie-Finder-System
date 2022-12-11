import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import getFallback from "../svg/fallbackImg";
import {
  Layout,
  Input,
  Space,
  Carousel,
  Card,
  Image,
  Button,
  Modal,
  Rate,
  Select,
  Empty,
  Spin,
} from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import hengfu1 from "../svg/hengfu1.png";
import hengfu3 from "../svg/hengfu3.png";
import hengfu4 from "../svg/hengfu4.png";

const { Search } = Input;
const { Option } = Select;
const { Content } = Layout;
const { Meta } = Card;
const fallback = getFallback(); // used when image loading error

function MainPage() {
  const [searchInput, setSearchInput] = useState("");
  const [searchType, setSearchType] = useState("");
  const navigate = useNavigate();

  const jumpToSearch = (searchType, searchInput) => {
    console.log(searchInput);
    console.log(searchType);
    if (searchInput === "" || searchType ==="") {
        Modal.warning({
            title: 'Empty search',
            content: 'Please select a Search by type and not leave search bar blank!',
        });
        return;
    }
    navigate(`/search-result/${searchType}/${searchInput}`);
  };

  const changeSearchType = (value) => {
    setSearchType(value);
  };

  const moreOnClick = (type) => {
    console.log(type);
    if (type === "Most Popular") {
        Modal.warning({
            title: 'No more data...',
            content: 'Click other <More> to search more about that type',
        });
        return;
    }
    Modal.confirm({
        title: 'Confirm',
        content: 'This would direct to a search result page, do you want to go?',
        icon: <ExclamationCircleOutlined />,
        okText: "Yes",
        cancelText: "Cancel",
        onOk() { jumpToSearch('byGenre', type); },
    });
  };

  // Mainpage info
  const [mainRecom, setMainRecom] = useState([
    { name: "Most Popular", movieList: []},
    { name: "Action", movieList: [] },
    { name: "Romance", movieList: [] },
    { name: "Drama", movieList: [] },
    { name: "Adventure", movieList: [] },
    { name: "Horror", movieList: [] },
    { name: "History", movieList: [] },
    { name: "Thriller", movieList: [] },
    { name: "Animation", movieList: [] },
  ]);
  const [loading, setLoading] = useState(mainRecom[0]["movieList"].length);

  // Get mainpage content API
  const LoadMainPage = () => {
    const userId = localStorage.getItem('userid') ? localStorage.getItem('userid') : 1;
    fetch(`http://localhost:5000/movie/recommend_category`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      userid: userId,
    })
      .then((res) => res.json())
      .then((json) => {
        console.log("Fetch mainpage complete, setting data...");
        for (let key in json) {
          switch (key) {
            case "most_popular":
                mainRecom[0]["movieList"] = json[key];
                break;
            case "Action":
              mainRecom[1]["movieList"] = json[key];
              break;
            case "Romance":
              mainRecom[2]["movieList"] = json[key];
              break;
            case "Drama":
              mainRecom[3]["movieList"] = json[key];
              break;
            case "Adventure":
              mainRecom[4]["movieList"] = json[key];
              break;
            case "Horror":
              mainRecom[5]["movieList"] = json[key];
              break;
            case "History":
              mainRecom[6]["movieList"] = json[key];
              break;
            case "Thriller":
              mainRecom[7]["movieList"] = json[key];
              break;
            case "Animation":
              mainRecom[8]["movieList"] = json[key];
              break;
            default:
              break;
          }
        }
        console.log("get mainpage:", mainRecom);
        setMainRecom(mainRecom);
        setLoading(false);
      });
  };

  React.useEffect(() => {
    LoadMainPage();
  }, []);

  // Components
  const EmptySpace = () => {
    return (
        <Spin tip="Loading...">
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </Spin>
      );
  }
  const CreateMovieCard = (info) => {
    const movie = info.info;

    return (
      <Card
        id={movie.id}
        className="Category-movie-card"
        type="inner"
        hoverable
        style={{
          width: 240,
        }}
        cover={<Image alt="movie-R1-1" src={movie.poster ? movie.poster : "error"} fallback={fallback} style={{ height:'340px'}}/>}
      >
        <Meta
          title={<a onClick={()=>{navigate(`/movie-details/${movie.id}`)}}>{movie.name}</a>}
          description={
            <div>
                <Rate disabled allowHalf={true} defaultValue={movie.rate === -1.0 ? 0 : movie.rate} />
                <span style={{paddingLeft: '10px'}}>{movie.rate === -1.0 ? "No rate" : movie.rate}</span>
            </div>}
        ></Meta>
      </Card>
    );
  };
  const MovieShowCards = (params) => {
    const InfoList = params.InfoList;
    if (InfoList.length === 0) {
      return EmptySpace();
    } else {
      return (
        <Space size="large">
        {InfoList.map((movie,id2) => {
            return (
                <CreateMovieCard 
                  key={id2}
                  info={movie}
                />
            );
        })}
        </Space>
      );
    }
  };

  return (
    <Layout className="layout">
      <Content
        className="mainpage-top-content"
        style={{
          paddingTop: "20px",
          margin: "0 15%",
        }}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div className="align-center-box">
            <Input.Group>
              <Select
                defaultValue="Search by..."
                size="large"
                onChange={changeSearchType}
                style={{ width: "15%" }}
              >
                <Option value="byName">Title</Option>
                <Option value="byKeyword">Keyword</Option>
                <Option value="byGenre">Genre</Option>
                <Option value="byDirector">Director</Option>
              </Select>
              <Search
                placeholder="Enter name of a movie"
                allowClear
                onSearch={() => jumpToSearch(searchType, searchInput)}
                size="large"
                enterButton
                style={{
                  width: "85%",
                }}
                value={searchInput}
                onChange={(value) => setSearchInput(value.target.value)}
              />
            </Input.Group>
          </div>
          <Carousel
            className="mainpage-carousel-container"
            autoplay
            style={{
              width: "100%",
            }}
          >
            <div className="carousel1">
              <Image src={hengfu3} />
            </div>
            <div className="carousel2">
              <Image src="https://images.squarespace-cdn.com/content/v1/538f2721e4b0e4caa9823ef4/1442957286448-L6IR0A48Q7FQFC289KJS/image-asset.jpeg" />
            </div>
            <div className="carousel3">
              <Image src={hengfu1} />
            </div>
            <div className="carousel4">
              <Image src={hengfu4} />
            </div>
          </Carousel>
        </Space>
      </Content>
      <Content
        className="mainpage-main-content"
        style={{
          padding: "0 50px",
        }}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          {mainRecom.map((type, id) => {
            return (
              <Card
                key={id}
                className="Categories-card"
                title={<h1 style={{ margin: 0 }}>{type.name}</h1>}
                extra={
                    <Button 
                      onClick={() => {moreOnClick(type.name)}}
                      style = {{
                        background: "transparent",
                        border: "0px",
                        color: "#0d7bed",
                        fontSize: "18px",
                      }}
                    >
                        More
                    </Button>
                }
                hoverable
                style={{
                  width: "100%",
                  backgroundColor: "transparent",
                }}
              >
                { loading ? <EmptySpace />
                : <div className="outerMovieContainer" style={{ padding:'0 20px', overflowX:'auto' }}>
                <MovieShowCards InfoList={type.movieList} />
              </div>}
              </Card>
            );
          })}
        </Space>
      </Content>
    </Layout>
  );
}

export default MainPage;
