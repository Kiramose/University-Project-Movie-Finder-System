# capstone-project-9900-t12p-ordinaryfolk
capstone-project-9900-t12p-ordinaryfolk created by GitHub Classroom

Project topic: Movie finder system

Group Members:

    z5292284 Joshua Guo (SM/M)
    
    z5343702 Yue Cao
    
    z5242236 Yinuo Li
    
    z5295247 Yuzhe Yin
    
    z5292385 Yatfan Kam


---
# Change Log

`03/08/2022` : Remove the rate requirement in comment form on movie detail page, so allow 0 rate comment.

# Content

**[Start the Program]** [jump to -> ](#1)

1. [Setup Backend Environment](#setup_backend)

2. [Install Local Database: MySQL](#setup_database)

3. [Install Frontend Environment](#setup_frontend)

4. [Run the program](#run)


**[Method introduction]** [jump to -> ](#2)

1. [Database Tables in our system](#data_table)

2. [API functions](#api)

3. [Frontend pages](#frontend_page)


**[Other notes]** [jump to -> ](#3)

1. [requirements guides](#generate_requirement)

2. [nvm guides](#nvm_guide)
---

# Start the Program<a id='1'/>

## 1. Setup Backend Environment<a id="setup_backend"/>

### Install backend environment

First unzip the needed files: the `RS.zip` which contains 2 pkl file in `backend/sprint3` folder,

and make sure that 2 pkl file is under `sprint3` folder.

Run:
```
cd YOUR_PATH/movie-finder-system/backend/sprint3
unzip RS.zip
```

Run the follow comment under `backend/sprint3` folder to install all requirements for backend
`pip install -r requirement.txt`

### Problems solve about "requirement.txt"

See here:

-> [How to generate a requirement.txt file](#generate_requirement)

-> [How to install requirement - both online and offline](#install_requirement)

<br />

## 2. Install Local Database<a id="setup_database"/>

### 2.1 Install MySQL

**Linux** command-line install

(For windows, please use a Linux subsystem, like Ubuntu20.4)

```
apt-get update  // if needed
apt update // if needed
apt install mysql-client-core-8.0
apt install mysql-server
```

**Open mysql** :

```
sudo service mysql start
mysql -uroot -p
```
This will enter the mysql, show like: `mysql>`

<font size='16px' color='red'>When you first enter your mysql, please set your password as `123456`</font>

**Close mysql** :
```
mysql> quit
sudo service mysql stop
```

### 2.2 Initialise Databse

To use this project, we need to first create a database called "ordinary_folk" in mysql.

Run the commend below in mysql server:

`mysql> create database ordinary_folk`

Then, quit the mysql server, check you path, `cd` into `backend/sprint3`.

Run the commend below to initialise the database:

`python3 database.py`

After initialise the database, you can start the mysql server and view the data by SQL commend

like: `select * from usertable` to see all default user in database


<br />


## 3. Install Frontend Environment<a id="setup_frontend"/>

### 3.1 Install nodejs \(suggest v14.18.0 with npm 6.14.15\)

[WARNING] if you use meet any problem about node version, it might be better to use nvm to manage the package versions

**Windows** command-line install

```
sudo apt update
sudo apt install nodejs=14.18.0
```

If it shows: Version '14.18.1' for 'nodejs' was not found

You may try: 
```
sudo apt-get update
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v # v14.18.x
npm -v # 6.14.15
```

If still not get solved, try to use nvm to manage node version, see `3.3 Problem solving, use nvm...`

**MacOS** command-line install

If you haven't already, install homebrew first.
```
brew install node
```

**Linux** command-line install
```
sudo apt update
sudo apt install nodejs=14.18.0
```

### 3.2 Install frontend packages

Use `cd` to enter the project file of our `movie-finder-system/fronted` folder.

Under the `frontend` folder, enter `npm install` to install all package in one step.

If you meet any `npm` ERROR, please check your npm version(6.x.x or 8.x.x) and node version(14.18.0) by `node -v` and `npm -v`.

### 3.3 Problem solving, use nvm to manage node versions

See here -> [How to debug of npm problem on windows subsystem for Linux \[use nvm\]](#nvm_guide)


<br />


## 4. Run the program<a id="run"/>

To run the program, we need to start the mysql server, start the backend api and then start the frontend server.

Run the following commends:

YOUR_PATH is the path your `movei-finder-system` folder in.

```
$ cd YOUR_PATH/movie-finder-system/backend/sprint3
$ sudo service mysql start
$ python3 api_sprint3.2.py
```

Our API site is on `localhost:5000`.

Then, open another terminal to run the frontend server:
```
$ cd YOUR_PATH/movie-finder-system/frontend
$ npm start
```

Our frontend site is on `localhost:3000`.

Now, you can see the movie finder website.


---


# Method introduction <a id='2' />

## 1. Data Tables<a id="data_table" />

We have these following tables:

1. movies table : movie5000

    It stores all the movie detailed informations, the structure is:

    **movie5000(id, name, genres, overview, keywords, language, runtime, director, actor, rated)**

2. movie posters table: poster

    As our initial movie database does not include movie poster, so we fetch poster from other database.

    The poster's structure is:

    **poster(id, poster)**

3. user table : usertable

    We have 6 initial users: 
    | name | email | password |
    | ---- | ---- | ---- |
    | admin  | admin@gmail.com  | 123456  |
    | kam1  | kam1@gmail.com  | 123456  |
    | yue  | yue@gmail.com  | 123456  |
    | yinuo  | yinuo@gmail.com  | 123456  |
    | joshua  | joshua@gmail.com  | 123456  |
    | yuzhe  | yuzhe@gmail.com  | 123456  |

    The first user is an admin user and **should not have any review, banlist, wishlist and follow**, as we use it's banlist as unregistered users' banlist.

    User table's structure is:

    **usertable(id, user_name, email, password, create_time, userimg, wishlist, banlist, followlist, follower, is_admin)**

4. user comments : usercomment

    This table stores all rating data generate by users. Table structure is:

    **usercomment(id, userid, movieid, rated, comment, create_time)**

<br />

## 2. API functions<a id="api"/>

**Login/out and register**

1. Register: /user/auth/register

    Register requires a body of name, email and password, and will return a user token, user id and is_admin.

2. Login: /user/auth/login

    Login requires a body of name and email, returns the same output as register.

3. Logout: /user/auth/logout

    Logout have no required body and output.

**Main page and movie details**

4. Recommendation by category: /movie/recommend_category

    It requires a userid, which can be null(treat as unregister user), returns a list of movies that demonstrates on main page:
    Most popular, Action, Romance, Drama, Adventure, Horror, History, Thriller and Animation.

5. Movie details: /movie/{movie_id}

    It requires a movie_id, and alternative userid (used for banlist filtering), returns all the detailed information about this movie.

**Movie search**

6. Search by name: /movie/search-name/{name}

    It accept a name of the movie and return all movies equal or contains the input name.

7. Search by keyword: /movie/search-keyword/{keyword}

    It accept a keyword of the movie and return all movies have that keyword in its data.

8. Search by genre: /movie/search-genre/{genre}

    It accept a name of genre and return all movies of this genre.

9. Search by director: /movie/search-director/{director}

    It accept a name of director and return all movies directed by the director.

**User dashboard and user informations**

10. User dashboard informations: /user/dashboard/{user_id}

    It requires a user id, and return all the details about this user (basic info, wishlist, follow list and ban list (if is self)).

11. Update user profile: /user/profile-update/{user_id}

    It requires a user id, new name, new avator and new password. Only return a message of success or not.

**Banlist, wishlist, follows and Reviews**

12. Add to wishlist: /dashboard/wishlist-add

    It requires a movie_id and userid, check if it is already in wishlist, else add it into user's wishlist.

13. Remove from wishlist: /dashboard/wishlist-remove

    It requires the same input as above, and remove a movie from user's wishlist.

14. Add to banlist: /user/banned_list/add

    It requires a userid_banned and self userid, modified the users' banlist in database.

15. Remove from banlist: /user/banned_list/remove

    It requires the same input as above.

16. Add to follow list: /user/follow-list/add

    It requires a userid_follow and self user id, modified the users' follow list in database.

17. Remove from follow list: /user/follow-list/remove

    It requires the same input as above.

18. Write review: /movie/write-review/{movie_id}

    It requires a body of user_id, rate and reviews, with another parameter movie_id on the path. Store the information in usercomment table.

<br />

## 3. Frontend pages<a id="frontend_page"/>

1. Navigate bar

    Navigate bar is on the top of the page, always exist. It includes:

    - Logo: "OrdinaryMovie", click it direct to home page.
    - Home button: both register user and unregitered user can see, link to home page.
    - Login button: unregistered user can see, link to login page.
    - Register button: unregistered user can see, link to register page.
    - Dashboard button: logged user can see, link to self dashboard.
    - Logout button: logged user can see, cilck and click yes in modal can logout.

2. Login and register page

    In login page:

    - Email: Require a valid email.
    - Password: Require a valid password.
    - Remember me: If selected, the email and password would save locally for next time quick enter.
    - Forgot password: nothing yet.
    - Register now!: a link, link to register page.

    In register page:
    - Email: Require a valid email.
    - Password: Require a valid password with at least 6 character.
    - Confirm Password: Require to be same as Password.
    - UserName: A preferred name of the account.
    - Read the agreement: should be selected.
    - Go to Log in!: a link, link to login page.

3. Home page

    Home page can do movie search, demonstrate some long posters, and have 9 category of movie recommendations.

    - Search bar: choose a select type and enter some word then click search icon, which will direct to search result page. Notice, it not allow empty search.

    - Most popular: Recommendation movies with high rate. (Do no have more data link)

    - Other 8 genre recommendation: 10 movies in each session, click more can jump to search result page, search by genre.

4. User dashboard and other user dashboard

    - Top left area: user details (name, id, email). For self dashboard, an "Edit Profile" button shows and link to profile edit page. For other users' dashboard, user could see "follow" and "ban" button.

    - Top right area: statistic for follow info and banlist. For self dashboard, user could see following, followers and banlist number. For other users' dashboard, user could only see following and followers number.

    - Wish List area: Show all movies in wishlist, if it is self dashboard, remove a movie from wishlist is also available.

5. Profile edit page

    It includes upload avator, change user name and change password. After changes user need to click save button to save the changes.

6. Movie detail page

    Movie detail page shows all detail information about the movie, a reviews area and similar movie recommendations on the bottom.

    - Pink heart beside the movie title: Click it to add this movie into wishlist (only allow logged user to do so).

    - Write reviews: This button only allow logged user to write reviews, unregistered user would recieve a warning message. If a user post two reviews, the new review would rewrite the old one.

7. Movie search result

    Search bar: shows the search type and input about this search, can be modified and search again. Notice, it not accept empty input.

    It would show the number of movie finds and those movies list below.

---


# Others notes <a id='3' />

#### How to generate a requirement.txt file<a id="generate_requirement" />

Simple way to generate it: pip freeze > requirement.txt

[WARNING!] It will collects all packages in your computer!

Summaries packages imported in program using:

```
$ pip install pipreqs
$ cd programFolder
$ pipreqs ./ --encoding=utf8
```

#### How to install requirement <a id = "install_requirement" />

Install online: `$ pip isntall -r requirements.txt`

Install offline: first download packages to "packagesdir" folder,

and then you can install them offline.

```
$ pip wheel -w DIR -r requirements.txt
$ pip download -d DIR -r requirements.txt
$ pip install --no-index --find-links=DIR -r requirements.txt
```

More info about offline installation see: `https://blog.csdn.net/qq_28949847/article/details/103506597`


#### How to debug of npm problem on windows subsystem for Linux \(use nvm\) <a id="nvm_guide"/>

If you're using windows subsystem for Linux, you might meet the problem I had. And here are some possible solutions for debug.

If you get WARN about oldlockfile, ERR permission denied, or other problem when runing `npm install` or `npm start`, note to check the version of node and npm you used. It might because you use a later version.

To fix that,
 
First, install WSL2, and then update the distribution:
`sudo apt update && sudo apt upgrade`

Second, install nvm, nodejs, and npm:
```
sudo apt-get install curl
curl -o https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
```

If you are using MacOs, and the command above failed, try `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash`.

To verify installation, enter `command -v nvm` which should return 'nvm'. If not, close your current terminal and reopen it.

nvm is a node version control tool, we use it to install specific version of nodejs and npm

Enter: `nvm install 14.18.0`

Then use `nvm ls` to check what versions of Node are installed.

To verify the nodejs and npm version, type: `node -v` and `npm -v`.

To change the using version of node, type `nvm use 14.18.0`.
