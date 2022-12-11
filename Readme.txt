# Changes after final demo

[03/08/2022] : Set the rate default value to 0 in comment form on movie detail page,
               so if user leave the rate blank, and submit the review, it will shows 0 rate.
               If user want to leave blank comment, they still need to enter at least one "blank".

[03/08/2022] : Add a warning modal in search bar, which will shows when user do a blank search or did not select a search type.

[04/08/2022] : We have uploaded our final submission to the team's GitHub classroom account on time.

We use VirtualBox 6.1.34 and lubuntu_20.04.1_VM. More details can be seen in “VirtualBox Environment.txt”.

Our GitHub repository: https://github.com/unsw-cse-comp3900-9900-22T2/capstone-project-9900-t12p-ordinaryfolk

The project is in folder named "movie-finder-system" and we have a detailed handbook about our system in "README.md" file

This Readme.txt is a summary, as is required to include by this Assignment.

------------------------------------------------------

# Initialise all environment for this Project

(For more detailed steps and problem solve, see in "README.md" file)
(For full details about install a new virtual machine and set up the project, see "VitrualBox Environment.txt")

1. Install backend packages and initialise

$ cd YOUR_PATH/capstone-project-9900-t12p-ordinaryfolk/movie-finder-system/backend/sprint3
$ unzip RS.zip
$ pip install -r requirement.txt

2. Install mysql

$ sudo apt-get update  // if needed
$ sudo apt update // if needed
$ sudo apt install mysql-client-core-8.0
$ sudo apt install mysql-server

Open mysql server to check if install successfully

$ sudo service mysql start
$ mysql -uroot -p

When you first enter mysql, please set your password as 123456 (as in api we use this password)

Then, create a new database called orinary_folk
mysql > create database orinary_folk
mysql > quit

Then, initialise the database:
$ python3 database.py

// if you want to stop mysql server: $ sudo service mysql stop

3. Install frontend packages

$ sudo apt update
$ sudo apt install nodejs=14.18.0

If it doesn't work, try below:
$ sudo apt-get update
$ curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
$ sudo apt-get install -y nodejs
$ node -v # v14.18.x
$ npm -v # 6.14.15

If still not have the right version, see README.md -> Other Notes -> last one: How to debug of npm problem on windows subsystem for Linux (use nvm)

Then install the frontend packages:
$ cd YOUR_PATH/movie-finder-system/frontend
$ npm -v         # 6.x or 8.x may be ok
$ npm install

--------------------------------------------

# Run the program

Open a terminal:
$ cd YOUR_PATH/movie-finder-system/backend/sprint3
$ sudo service mysql restart    # if it has open before and not stoped
$ python3 api_sprint3.2.py

Now the backend api has started

Open a new terminal:
$ cd YOUR_PATH/movie-finder-system/frontend
$ npm start

Now the frontend server has started

Our frontend site is on : http://localhost:3000
