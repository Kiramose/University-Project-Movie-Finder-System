import {
    BrowserRouter as Router,
    Route,
    Routes,
    Navigate
} from 'react-router-dom';
import { Footer } from 'antd/lib/layout/layout';
import Login from './pages/Login';
import Register from './pages/Register';
import MainPage  from './pages/MainPage';
import MovieDetails from './pages/MovieDetails';
import SearchResult from './pages/SearchResult';
import Profile from './pages/Profile';
import UserDashboard from './pages/UserDashboard';
import AppHeader from './components/Header';
import OthersDashboard from './pages/OthersDashboard';
import MsgBoard from './pages/MsgBoard';
import { useState } from 'react';

const AppRouter = () => {
  const [islog, setIslog] = useState(localStorage.getItem('token') ? true : false);
  return (
    <div className='App'>
      <Router>
        <AppHeader param={{ islog, setIslog }} />
        <Routes>
            {/* For other unkown link, redirect to home page */}
            <Route path='*' element={<Navigate to="/home" />}/>
            {/* Main exact routers */}
            <Route exact path="/" element={<MainPage />}/>
            <Route exact path="/home" element={<MainPage />}/>
            <Route exact path="/login" element={<Login param={{setIslog}}/>}/>
            <Route exact path="/register" element={<Register param={{setIslog}}/>}/>
            <Route exact path="/movie-details/:movieID" element={<MovieDetails param={{ islog, setIslog }} />}/>
            <Route exact path="/search-result/:searchtype/:input" element={<SearchResult />}/>
            <Route exact path="/profile" element={<Profile />}/>
            <Route exact path="/dashboard" element={<UserDashboard />}/>
            <Route exact path="/dashboard/view/:id" element={<OthersDashboard />}/>
            <Route exact path="/message-board" element={<MsgBoard />}/>
        </Routes>
      </Router>
      <Footer
        style={{
          textAlign: 'center',
        }}
      >
        Ordinary Movie &copy;2022 Created by Ordinary Folks
      </Footer>
      <Footer
        style={{
          textAlign: 'center',
          marginTop: '-50px'
        }}
      >
        This product uses the TMDB API but is not endorsed or certified by TMDB
      </Footer>
    </div>
  );
}

export default AppRouter;
