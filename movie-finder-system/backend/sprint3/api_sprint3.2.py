import pymysql
import requests
import config
from flask import Flask, request
from flask_restx import Resource, Api, fields, reqparse
from flask_cors import CORS
from werkzeug.datastructures import ImmutableMultiDict
from werkzeug.security import check_password_hash, generate_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, JWTManager, get_jwt
from models import db, UserModel, TokenBlocklist
from forms import LoginForm, RegisterForm, ReviewForm, UpdateForm
import numpy as np
import time
import pickle#new for s3
import pandas as pd#new for s3
'''
<<<<<<< HEAD
drop database ordinary_folk;
create database ordinary_folk;
#run database.py
use ordinary_folk;
insert into usertable(user_name,email,password,create_time,userimg,wishlist,banlist,followlist,follower) values("developer","zzz@gmail.com","12345","1","2","","","","");
insert into usertable(user_name,email,password,create_time,userimg,wishlist,banlist,followlist,follower) values("kam","abc-gmail.com","12345","1","2","3","3/4/5","5","");
insert into usertable(user_name,email,password,create_time,userimg,wishlist,banlist,followlist,follower) values("kam2","kkk-gmail.com","12345","1","2","3","1/3","5","");
insert into usertable(user_name,email,password,create_time,userimg,wishlist,banlist,followlist,follower) values("kam3","kkk-gmail.com","12345","1","2","3","2/4","5","");
insert into usertable(user_name,email,password,create_time,userimg,wishlist,banlist,followlist,follower) values("kam4","kkk-gmail.com","12345","1","2","3","1","5","");
insert into usertable(user_name,email,password,create_time,userimg,wishlist,banlist,followlist,follower) values("kam5","kkk-gmail.com","12345","1","2","3","","5","");
insert into usercomment(userid,movieid,rated,comment,create_time) values("1","100","5.0","good!","1");
insert into usercomment(userid,movieid,rated,comment,create_time) values("1","101","6.0","good!!","1");
insert into usercomment(userid,movieid,rated,comment,create_time) values("1","102","7.0","good!!!","1");
insert into usercomment(userid,movieid,rated,comment,create_time) values("2","100","7.0","ngood!","1");
insert into usercomment(userid,movieid,rated,comment,create_time) values("2","101","6.0","ngood!!","1");
insert into usercomment(userid,movieid,rated,comment,create_time) values("2","102","5.0","ngood!!!","1");
insert into usercomment(userid,movieid,rated,comment,create_time) values("3","100","1.0","vgood!","1");
insert into usercomment(userid,movieid,rated,comment,create_time) values("3","101","2.0","vgood!!","1");
insert into usercomment(userid,movieid,rated,comment,create_time) values("3","102","3.0","vgood!!!","1");
insert into usercomment(userid,movieid,rated,comment,create_time) values("4","100","3.0","ggood!","1");
insert into usercomment(userid,movieid,rated,comment,create_time) values("4","101","2.0","ggood!!","1");
insert into usercomment(userid,movieid,rated,comment,create_time) values("4","102","1.0","ggood!!!","1");
insert into usercomment(userid,movieid,rated,comment,create_time) values("5","100","10.0","d!","1");
insert into usercomment(userid,movieid,rated,comment,create_time) values("5","101","9.0","d!!","1");
insert into usercomment(userid,movieid,rated,comment,create_time) values("5","102","8.0","d!!!","1");
'''

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.config.from_object(config)  # get config
jwt = JWTManager(app)  # init JWT
db.init_app(app)  # init
db.create_all(app=app)  # creat all table
api = Api(app=app,
          version='3.0',
          title='Sprint3',
          description='Sprint3 (Add/delete on follow list) and (Add/delete on banned list) and (recommender) APIs')

ac_model = api.model('Review', {'user_id': fields.String(required=False),
                                'rate': fields.String(required=False),
                                'reviews': fields.String(required=False),
                                })
ac_model1 = api.model('Update', {'user_name': fields.String(required=False),
                                 'user_img': fields.String(required=False),
                                 'password': fields.String(required=False),
                                 })

parser = reqparse.RequestParser()
parser.add_argument('userid', type=int, location='args')
parser.add_argument('movie_id', type=int, location='args')
parser.add_argument('userid_follow', type=int, location='args')
parser.add_argument('userid_banned', type=int, location='args')

movies_dict = pickle.load(open('movies_dict.pkl', 'rb'))
similarity = pickle.load(open('similarity.pkl', 'rb'))
movies = pd.DataFrame(movies_dict)

@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    # if jti in blocklist, disable the token
    jti = jwt_payload["jti"]
    token = db.session.query(TokenBlocklist.id).filter_by(jti=jti).scalar()  # query token

    return token is not None


login_fields = api.model('LoginModel', {
    'email': fields.String(required=True, example="abc@gmail.com"),
    'password': fields.String(required=True, example="123456"),
})

register_fields = api.model('RegisterModel', {
    "name": fields.String(required=True, example="test_Account"),
    "email": fields.String(required=True, example="test@gmail.com"),
    "password": fields.String(required=True, example="123456"),
})

token_model = api.model("TokenResponseModel", {
    "token": fields.String(description="token")
})


def fetch_poster(movie_id):
    conn = pymysql.connect(host='localhost', port=3306, user='root', passwd='123456', db='ordinary_folk',
                           charset='utf8')
    cursor = conn.cursor()
    sql = 'select * from poster where id=' + str(movie_id)
    cursor.execute(sql)
    data = cursor.fetchall()
    list1 = []

    # if data not exist
    if len(data) == 0:
        print("Movie %s has no poster yet!\n" % movie_id)
        return ""
    for i in data:
        d = {
            'id': i[0],
            'poster': i[1]
        }
        list1.append(d)
    cursor.close()
    conn.close()
    return list1[0]["poster"]

def movie_search_with_recommender(movie):
    movie_index = movies[movies['movie_id'] == int(movie)].index[0]
    distances = similarity[movie_index]
    movies_list = sorted(list(enumerate(distances)), reverse=True, key=lambda x: x[1])[1:14]
    recommendation_movies = []
    for i in movies_list:
        print(movies.iloc[i[0]].movie_id)
        recommendation_movies.append(movies.iloc[i[0]].movie_id)
    return recommendation_movies

class DataBase(object):
    def __init__(self, host, user, password, database, port):

        self.db = pymysql.connect(host=host, user=user, password=password, database=database, port=port, charset='utf8')

    def AddData(self, sql):

        self.cursor = self.db.cursor()

        try:
            self.cursor.execute(sql)

            self.db.commit()

            print('AddData Done')
        except:
            self.db.rollback()

            print('AddData Failed')

        finally:
            self.cursor.close()

            self.db.close()

    def UpdateData(self, sql):
        self.cursor = self.db.cursor()
        a = self.cursor.execute(sql)
        print(a)
        if a:
            self.db.commit()
            print('UpdateData Done')
        else:
            self.db.rollback()
            print('UpdateData Failed')

        self.cursor.close()

    def DeleteData(self, sql):
        self.cursor = self.db.cursor()
        try:
            self.cursor.execute(sql)
            self.db.commit()
            print('DeleteData Done')
        except:
            self.db.rollback()
            print('DeleteData Failed')
        finally:
            self.cursor.close()

    def SelectData(self, sql):
        self.cursor = self.db.cursor()

        try:
            self.cursor.execute(sql)

            data = self.cursor.fetchall()

            list = []
            for i in data:
                list6 = i[6].split("/")
                list7 = i[7].split("/")
                list8 = i[8].split("/")
                list9 = i[9].split("/")
                d = {
                    'id': i[0],
                    'user_name': i[1],
                    'email': i[2],
                    'password': i[3],
                    'create_time': i[4],
                    'userimg': i[5],
                    'wishlist': list6,
                    'banlist': list7,
                    'followlist': list8,
                    'follower': list9,

                }
                list.append(d)

            return list

        except:
            print('No data')
        finally:
            self.cursor.close()

            self.db.close()

    def Close(self):
        self.cursor = self.db.cursor()
        self.cursor.close()
        print('Connection Closed')


class socre_comment(object):
    def __init__(self, host, user, password, database, port):

        self.db = pymysql.connect(host=host, user=user, password=password, database=database, port=port, charset='utf8')

    def AddData(self, sql):

        self.cursor = self.db.cursor()

        try:
            self.cursor.execute(sql)

            self.db.commit()

            print('AddData Done')
        except:
            self.db.rollback()

            print('AddData Failed')

        finally:
            self.cursor.close()

            self.db.close()

    def UpdateData(self, sql):
        self.cursor = self.db.cursor()
        a = self.cursor.execute(sql)
        print(a)
        if a:
            self.db.commit()
            print('UpdateData Done')
        else:
            self.db.rollback()
            print('UpdateData Failed')

        self.cursor.close()

    def DeleteData(self, sql):
        self.cursor = self.db.cursor()
        try:
            self.cursor.execute(sql)
            self.db.commit()
            print('DeleteData Done')
        except:
            self.db.rollback()
            print('DeleteData Failed')
        finally:
            self.cursor.close()

    def SelectData(self, sql):
        self.cursor = self.db.cursor()

        try:
            self.cursor.execute(sql)

            data = self.cursor.fetchall()

            list = []
            for i in data:
                d = {
                    'id': i[0],
                    'userid': i[1],
                    'movieid': i[2],
                    'rated': i[3],
                    'comment': i[4],
                    'create_time': i[5],

                }
                list.append(d)

            return list

        except:
            print('No data')
        finally:
            self.cursor.close()

            self.db.close()

    def Close(self):
        self.cursor = self.db.cursor()
        self.cursor.close()
        print('Connection Closed')


class DataBasemovie(object):
    def __init__(self, host, user, password, database, port):
        self.db = pymysql.connect(host=host, user=user, password=password, database=database, port=port, charset='utf8')

    def SelectDatamovie(self, sql):
        self.cursor = self.db.cursor()

        try:
            self.cursor.execute(sql)

            data = self.cursor.fetchall()

            list = []
            for i in data:
                list2 = i[2].split("/")
                str3 = i[3].replace("/", ",")
                list4 = i[4].split("/")
                list8 = i[8].split("/")
                d = {
                    'id': i[0],
                    'name': i[1],
                    'genres': list2,
                    'overview': str3,
                    'keywords': list4,
                    'language': i[5],
                    'runtime': i[6],
                    'director': i[7],
                    'actor': list8,
                    'rated': i[9],

                }
                list.append(d)

            return list

        except:
            print('No data')
        finally:
            self.cursor.close()

            # self.db.close()
    def UpdateDatamovie(self, sql):
        self.cursor = self.db.cursor()
        a = self.cursor.execute(sql)
        if a:
            self.db.commit()
            print('UpdateData Done')
        else:
            self.db.rollback()
            print('UpdateData Failed')

        self.cursor.close()

    def Close(self):
        self.cursor = self.db.cursor()
        self.cursor.close()
        print('Connection Closed')


def find_scorecomment(userid, movieid_list):
    Data = DataBase('localhost', 'root', '123456', 'ordinary_folk', 3306)
    list = Data.SelectData('SELECT * from usertable where id =' + str(userid))
    banlist = []
    if list:
        banlist = list[0]["banlist"]
        print(banlist)
    #    else:
    #       return [], []

    movie_rated = []
    movie_comment = []
    for i in range(len(movieid_list)):
        Data = socre_comment('localhost', 'root', '123456', 'ordinary_folk', 3306)
        list1 = Data.SelectData('SELECT * from usercomment where movieid =' + str(movieid_list[i]))
        if list1:
            userid = []
            rate = []
            comment = []
            for j in range(len(list1)):
                if str(list1[j]["userid"]) not in banlist:
                    userid.append(list1[j]["userid"])
                    rate.append(list1[j]["rated"])
                    comment.append(list1[j]["comment"])

            movie_rated.append(round(np.mean(rate), 1))
            movie_comment.append(comment)
        else:
            movie_rated.append(0.0)
            movie_comment.append([])
    return movie_rated, movie_comment


def find_all(userid, movieid):
    Data = DataBase('localhost', 'root', '123456', 'ordinary_folk', 3306)
    # Data = DataBasemovie('localhost','root','','ordinary_folk',3306)
    # Data = DataBasemovie('localhost','root','','ordinary_folk',3306)
    list = Data.SelectData('SELECT * from usertable where id =' + str(userid))
    banlist = []
    if list:
        banlist = list[0]["banlist"]
        # print(banlist)

    movie_rated = []
    movie_comment = []

    Data = socre_comment('localhost', 'root', '123456', 'ordinary_folk', 3306)
    list1 = Data.SelectData('SELECT * from usercomment where movieid =' + str(movieid))
    if list1:
        userid = []
        rate = []

        for j in range(len(list1)):
            comment = {}
            if str(list1[j]["userid"]) not in banlist:
                userid.append(list1[j]["userid"])
                rate.append(list1[j]["rated"])
                comment["userid"] = list1[j]["userid"]
                comment["comment"] = list1[j]["comment"]
                comment["create_time"] = list1[j]["create_time"]
                comment["rate"] = list1[j]["rated"]
                Data = DataBase('localhost', 'root', '123456', 'ordinary_folk', 3306)
                list2 = Data.SelectData('SELECT * from usertable where id =' + str(list1[j]["userid"]))
                comment["user_name"] = list2[0]["user_name"]
                comment["userimg"] = list2[0]["userimg"]
                movie_comment.append(comment)
        movie_rated.append(round(np.mean(rate), 1))
    else:
        movie_rated.append(0.0)
        movie_comment.append({})
    return movie_rated, movie_comment


Data = DataBasemovie('localhost', 'root', '123456', 'ordinary_folk', 3306)


@api.route("/movie/search-name/<name>")
@api.doc(params={'name': 'Enter the name of a movie:'})
@api.doc(params={'userid': 'user id is:'})
class Movie_name(Resource):
    def get(self, name: str):
        INPUT = name
        args = parser.parse_args()
        userid = args.get('userid')
        if userid:
            # list1 = Data.SelectDatamovie('SELECT * from movie5000 where name = "' + INPUT + '"')
            list1 = Data.SelectDatamovie('SELECT * from movie5000 where name like "%' + INPUT + '%"')
            listall=[]
            listid=[]
            if list1:
                for i in range(len(list1)):
                    listall.append([list1[i]["id"],list1[i]["name"],fetch_poster(list1[i]["id"])])
                    listid.append(list1[i]["id"])
            movie_rated, movie_comment=find_scorecomment(userid, listid)
            for i in range(len(listall)):
                listall[i].append(movie_rated[i])
            for i in range(len(listall)):
                n = 0
                while n < len(listall) - 1:
                    if listall[n][3] < listall[n + 1][3]:
                        listall[n], listall[n + 1] = listall[n + 1], listall[n]
                    if (listall[n][3] == listall[n + 1][3]):
                        length=min(len(listall[n][1]),len(listall[n+1][1]))
                        for j in range(length):
                            if listall[n][1][j]<listall[n+1][1][j]:
                                break
                            elif listall[n][1][j]>listall[n+1][1][j]:
                                listall[n], listall[n + 1] = listall[n + 1], listall[n]
                                break
                    n += 1
            output=[]
            for i in range(len(listall)):
                output.append({'id':listall[i][0],'name':listall[i][1],'poster':listall[i][2],'rate':listall[i][3]})
            if output:
                return output, 200
            else:
                # return {"message": "movie of this name: {} does not exist".format(name)}, 404
                return output, 200
        else:
            userid = 1
            list1 = Data.SelectDatamovie('SELECT * from movie5000 where name like "%' + INPUT + '%"')
            listall=[]
            listid=[]
            if list1:
                for i in range(len(list1)):
                    listall.append([list1[i]["id"],list1[i]["name"],fetch_poster(list1[i]["id"])])
                    listid.append(list1[i]["id"])
            movie_rated, movie_comment=find_scorecomment(userid, listid)
            for i in range(len(listall)):
                listall[i].append(movie_rated[i])
            for i in range(len(listall)):
                n = 0
                while n < len(listall) - 1:
                    if listall[n][3] < listall[n + 1][3]:
                        listall[n], listall[n + 1] = listall[n + 1], listall[n]
                    if (listall[n][3] == listall[n + 1][3]):
                        length=min(len(listall[n][1]),len(listall[n+1][1]))
                        for j in range(length):
                            if listall[n][1][j]<listall[n+1][1][j]:
                                break
                            elif listall[n][1][j]>listall[n+1][1][j]:
                                listall[n], listall[n + 1] = listall[n + 1], listall[n]
                                break
                    n += 1
            output=[]
            for i in range(len(listall)):
                output.append({'id':listall[i][0],'name':listall[i][1],'poster':listall[i][2],'rate':listall[i][3]})
            if output:
                return output, 200
            else:
                # return {"message": "movie of this name: {} does not exist".format(name)}, 404
                return output, 200


@api.route("/movie/search-keyword/<keyword>")
@api.doc(params={'keyword': 'Enter the keyword of movies:'})
@api.doc(params={'userid': 'user id is:'})
class Keyword(Resource):
    def get(self, keyword: str):
        INPUT = keyword
        args = parser.parse_args()
        userid = args.get('userid')
        if userid:
            # list1 = Data.SelectDatamovie('SELECT * from movie5000 where name = "' + INPUT + '"')
            list1 = Data.SelectDatamovie('SELECT * from movie5000 where keywords like "%/' + INPUT + '/%"')
            listall=[]
            listid=[]
            if list1:
                for i in range(len(list1)):
                    listall.append([list1[i]["id"],list1[i]["name"],fetch_poster(list1[i]["id"])])
                    listid.append(list1[i]["id"])
            movie_rated, movie_comment=find_scorecomment(userid, listid)
            for i in range(len(listall)):
                listall[i].append(movie_rated[i])
            for i in range(len(listall)):
                n = 0
                while n < len(listall) - 1:
                    if listall[n][3] < listall[n + 1][3]:
                        listall[n], listall[n + 1] = listall[n + 1], listall[n]
                    if (listall[n][3] == listall[n + 1][3]):
                        length=min(len(listall[n][1]),len(listall[n+1][1]))
                        for j in range(length):
                            if listall[n][1][j]<listall[n+1][1][j]:
                                break
                            elif listall[n][1][j]>listall[n+1][1][j]:
                                listall[n], listall[n + 1] = listall[n + 1], listall[n]
                                break
                    n += 1
            output=[]
            for i in range(len(listall)):
                output.append({'id':listall[i][0],'name':listall[i][1],'poster':listall[i][2],'rate':listall[i][3]})
            if output:
                return output, 200
            else:
                # return {"message": "movie of this name: {} does not exist".format(name)}, 404
                return output, 200
        else:
            userid = 1
            list1 = Data.SelectDatamovie('SELECT * from movie5000 where keywords like "%/' + INPUT + '/%"')
            listall=[]
            listid=[]
            if list1:
                for i in range(len(list1)):
                    listall.append([list1[i]["id"],list1[i]["name"],fetch_poster(list1[i]["id"])])
                    listid.append(list1[i]["id"])
            movie_rated, movie_comment=find_scorecomment(userid, listid)
            for i in range(len(listall)):
                listall[i].append(movie_rated[i])
            for i in range(len(listall)):
                n = 0
                while n < len(listall) - 1:
                    if listall[n][3] < listall[n + 1][3]:
                        listall[n], listall[n + 1] = listall[n + 1], listall[n]
                    if (listall[n][3] == listall[n + 1][3]):
                        length=min(len(listall[n][1]),len(listall[n+1][1]))
                        for j in range(length):
                            if listall[n][1][j]<listall[n+1][1][j]:
                                break
                            elif listall[n][1][j]>listall[n+1][1][j]:
                                listall[n], listall[n + 1] = listall[n + 1], listall[n]
                                break
                    n += 1
            output=[]
            for i in range(len(listall)):
                output.append({'id':listall[i][0],'name':listall[i][1],'poster':listall[i][2],'rate':listall[i][3]})
            if output:
                return output, 200
            else:
                # return {"message": "movie of this name: {} does not exist".format(name)}, 404
                return output, 200


@api.route("/movie/<movie_id>")
@api.doc(params={'movie_id': 'Enter the id of movie to get details:'})
@api.doc(params={'userid': 'user id is:'})
class movie_id(Resource):
    def get(self, movie_id: int):
        args = parser.parse_args()
        userid = args.get('userid')
        output = []
        # for user not login, use user1's blank data
        if not userid:
            userid = 1
        list_1 = Data.SelectDatamovie('SELECT * from movie5000 where id=' + str(movie_id))
        movie_rated, movie_comment = find_all(userid, movie_id)
        list_1[0]["rated"] = movie_rated[0]
        list_1[0]["reviews"] = movie_comment
        list_1[0]["poster"] = fetch_poster(movie_id)
        list1 = movie_search_with_recommender(movie_id)
        movie_rated1, movie_comment1 = find_scorecomment(userid, list1)
        for i in range(len(list1)):
            list2 = Data.SelectDatamovie('SELECT * from movie5000 where id=' + str(list1[i]))
            for j in range(len(list2)):
                output.append(
                    {"id": list2[j]['id'], "name": list2[j]['name'], "poster": fetch_poster(list2[j]['id']),
                        "rate": movie_rated1[i]})
        list_1[0]["similar_recommend"] = output
        result = list_1[0]
        if result:
            return result, 200
        else:
            return result, 200


@api.route("/movie/search-director/<director>")
@api.doc(params={'director': 'Enter the name of a director:'})
@api.doc(params={'userid': 'user id is:'})
class Director_name(Resource):
    def get(self, director: str):
        INPUT = director
        args = parser.parse_args()
        userid = args.get('userid')
        if userid:
            # list1 = Data.SelectDatamovie('SELECT * from movie5000 where name = "' + INPUT + '"')
            list1 = Data.SelectDatamovie('SELECT * from movie5000 where director = "' + INPUT + '"')
            listall=[]
            listid=[]
            if list1:
                for i in range(len(list1)):
                    listall.append([list1[i]["id"],list1[i]["name"],fetch_poster(list1[i]["id"])])
                    listid.append(list1[i]["id"])
            movie_rated, movie_comment=find_scorecomment(userid, listid)
            for i in range(len(listall)):
                listall[i].append(movie_rated[i])
            for i in range(len(listall)):
                n = 0
                while n < len(listall) - 1:
                    if listall[n][3] < listall[n + 1][3]:
                        listall[n], listall[n + 1] = listall[n + 1], listall[n]
                    if (listall[n][3] == listall[n + 1][3]):
                        length=min(len(listall[n][1]),len(listall[n+1][1]))
                        for j in range(length):
                            if listall[n][1][j]<listall[n+1][1][j]:
                                break
                            elif listall[n][1][j]>listall[n+1][1][j]:
                                listall[n], listall[n + 1] = listall[n + 1], listall[n]
                                break
                    n += 1
            output=[]
            for i in range(len(listall)):
                output.append({'id':listall[i][0],'name':listall[i][1],'poster':listall[i][2],'rate':listall[i][3]})
            if output:
                return output, 200
            else:
                # return {"message": "movie of this name: {} does not exist".format(name)}, 404
                return output, 200
        else:
            userid = 1
            list1 = Data.SelectDatamovie('SELECT * from movie5000 where director = "' + INPUT + '"')
            listall=[]
            listid=[]
            if list1:
                for i in range(len(list1)):
                    listall.append([list1[i]["id"],list1[i]["name"],fetch_poster(list1[i]["id"])])
                    listid.append(list1[i]["id"])
            movie_rated, movie_comment=find_scorecomment(userid, listid)
            for i in range(len(listall)):
                listall[i].append(movie_rated[i])
            for i in range(len(listall)):
                n = 0
                while n < len(listall) - 1:
                    if listall[n][3] < listall[n + 1][3]:
                        listall[n], listall[n + 1] = listall[n + 1], listall[n]
                    if (listall[n][3] == listall[n + 1][3]):
                        length=min(len(listall[n][1]),len(listall[n+1][1]))
                        for j in range(length):
                            if listall[n][1][j]<listall[n+1][1][j]:
                                break
                            elif listall[n][1][j]>listall[n+1][1][j]:
                                listall[n], listall[n + 1] = listall[n + 1], listall[n]
                                break
                    n += 1
            output=[]
            for i in range(len(listall)):
                output.append({'id':listall[i][0],'name':listall[i][1],'poster':listall[i][2],'rate':listall[i][3]})
            if output:
                return output, 200
            else:
                # return {"message": "movie of this name: {} does not exist".format(name)}, 404
                return output, 200



@api.route("/movie/search-genre/<genre>")
@api.doc(params={'genre': 'Enter the name of a genre:'})
@api.doc(params={'userid': 'user id is:'})
class Genre_name(Resource):
    def get(self, genre: str):
        INPUT = genre
        args = parser.parse_args()
        userid = args.get('userid')
        if userid:
            # list1 = Data.SelectDatamovie('SELECT * from movie5000 where name = "' + INPUT + '"')
            list1 = Data.SelectDatamovie('SELECT * from movie5000 where genres like "%/' + INPUT + '/%"')
            listall=[]
            listid=[]
            if list1:
                for i in range(len(list1)):
                    listall.append([list1[i]["id"],list1[i]["name"],fetch_poster(list1[i]["id"])])
                    listid.append(list1[i]["id"])
            movie_rated, movie_comment=find_scorecomment(userid, listid)
            for i in range(len(listall)):
                listall[i].append(movie_rated[i])
            for i in range(len(listall)):
                n = 0
                while n < len(listall) - 1:
                    if listall[n][3] < listall[n + 1][3]:
                        listall[n], listall[n + 1] = listall[n + 1], listall[n]
                    if (listall[n][3] == listall[n + 1][3]):
                        length=min(len(listall[n][1]),len(listall[n+1][1]))
                        for j in range(length):
                            if listall[n][1][j]<listall[n+1][1][j]:
                                break
                            elif listall[n][1][j]>listall[n+1][1][j]:
                                listall[n], listall[n + 1] = listall[n + 1], listall[n]
                                break
                    n += 1
            output=[]
            for i in range(len(listall)):
                output.append({'id':listall[i][0],'name':listall[i][1],'poster':listall[i][2],'rate':listall[i][3]})
            if output:
                return output, 200
            else:
                # return {"message": "movie of this name: {} does not exist".format(name)}, 404
                return output, 200
        else:
            userid = 1
            list1 = Data.SelectDatamovie('SELECT * from movie5000 where genres like "%/' + INPUT + '/%"')
            listall=[]
            listid=[]
            if list1:
                for i in range(len(list1)):
                    listall.append([list1[i]["id"],list1[i]["name"],fetch_poster(list1[i]["id"])])
                    listid.append(list1[i]["id"])
            movie_rated, movie_comment=find_scorecomment(userid, listid)
            for i in range(len(listall)):
                listall[i].append(movie_rated[i])
            for i in range(len(listall)):
                n = 0
                while n < len(listall) - 1:
                    if listall[n][3] < listall[n + 1][3]:
                        listall[n], listall[n + 1] = listall[n + 1], listall[n]
                    if (listall[n][3] == listall[n + 1][3]):
                        length=min(len(listall[n][1]),len(listall[n+1][1]))
                        for j in range(length):
                            if listall[n][1][j]<listall[n+1][1][j]:
                                break
                            elif listall[n][1][j]>listall[n+1][1][j]:
                                listall[n], listall[n + 1] = listall[n + 1], listall[n]
                                break
                    n += 1
            output=[]
            for i in range(len(listall)):
                output.append({'id':listall[i][0],'name':listall[i][1],'poster':listall[i][2],'rate':listall[i][3]})
            if output:
                return output, 200
            else:
                # return {"message": "movie of this name: {} does not exist".format(name)}, 404
                return output, 200

@api.route("/movie/recommend_category")
@api.doc(params={'userid': 'user id is:'})
class Recommend_category(Resource):
    def get(self):
        args = parser.parse_args()
        userid = args.get('userid')
        Data = DataBasemovie('localhost', 'root', '123456', 'ordinary_folk', 3306)
        list5 = Data.SelectDatamovie('select * from movie5000 order by rated desc, name asc limit 0,10')
        kk=[]
        for i in range(len(list5)):
            kk.append({"id": list5[i]['id'], "name": list5[i]['name'], "poster": fetch_poster(list5[i]['id']),
                             "rate": list5[i]['rated']})
        result = {}
        result['most_popular']=kk
        if userid:
            genres = ['Action', 'Romance', 'Drama', 'Adventure', 'Horror', 'History', 'Thriller', 'Animation']

            for i in range(len(genres)):
                # print(genres[i])
                Data = DataBasemovie('localhost', 'root', '123456', 'ordinary_folk', 3306)
                list1 = Data.SelectDatamovie(
                    'SELECT * from movie5000 where genres like "%' + genres[i] + '%" ORDER BY RAND() LIMIT 10')
                list_id = []
                if list1:
                    for j in range(len(list1)):
                        list_id.append(list1[j]["id"])
                    movie_rated, movie_comment = find_scorecomment(userid, list_id)
                    # change no comment to -1 rate, different from rate 0
                    for idx in range(len(movie_rated)):
                        if (len(movie_comment[idx]) == 0):
                            movie_rated[idx] = -1.0
                    output = []
                    for k in range(len(list1)):
                        output.append(
                            {"id": list1[k]['id'], "name": list1[k]['name'], "poster": fetch_poster(list1[k]['id']),
                             "rate": movie_rated[k]})
                    result[genres[i]] = output
            return result, 200
        else:
            userid = 1
            genres = ['Action', 'Romance', 'Drama', 'Adventure', 'Horror', 'History', 'Thriller', 'Animation']

            for i in range(len(genres)):
                # print(genres[i])
                Data = DataBasemovie('localhost', 'root', '123456', 'ordinary_folk', 3306)
                list1 = Data.SelectDatamovie(
                    'SELECT * from movie5000 where genres like "%' + genres[i] + '%" ORDER BY RAND() LIMIT 10')
                list_id = []
                if list1:
                    for j in range(len(list1)):
                        list_id.append(list1[j]["id"])
                    movie_rated, movie_comment = find_scorecomment(userid, list_id)
                    # change no comment to -1 rate, different from rate 0
                    for idx in range(len(movie_rated)):
                        if (len(movie_comment[idx]) == 0):
                            movie_rated[idx] = -1.0
                    output = []
                    for k in range(len(list1)):
                        output.append(
                            {"id": list1[k]['id'], "name": list1[k]['name'], "poster": fetch_poster(list1[k]['id']),
                             "rate": movie_rated[k]})
                    result[genres[i]] = output
            return result, 200


@api.route("/dashboard/wishlist-add")
@api.doc(params={'userid': 'Enter the id of a user:'})
@api.doc(params={'movie_id': 'Enter the id of a movie:'})
class Wishlist_add(Resource):
    def post(self):
        Data = DataBase('localhost', 'root', '123456', 'ordinary_folk', 3306)
        args = parser.parse_args()
        userid = args.get('userid')
        movie_id = args.get('movie_id')
        list1 = Data.SelectData('SELECT * from usertable where id = ' + str(userid))
        list_wish = []
        if list1:
            for i in range(len(list1)):
                list_wish.append(list1[i]["wishlist"])
        print(list_wish)

        if str(movie_id) in list_wish[0]:
            return {"error": "the movie is already in the wish list"}, 400
        else:
            if list_wish[0][0] == '':
                list_wish[0][0] = str(movie_id)

            else:
                list_wish[0].append(str(movie_id))

            print(list_wish)
            str_wish = '/'.join(list_wish[0])
            print(str_wish)
            print(type(str_wish))
            Data = DataBase('localhost', 'root', '123456', 'ordinary_folk', 3306)
            Data.UpdateData('update usertable set wishlist = "' + str_wish + '" where id = ' + str(userid))
            return {"message": "successfully added it to wishlist"}, 200


@api.route("/user/follow-list/add")
@api.doc(params={'userid': 'Enter the id of a user:'})
@api.doc(params={'userid_follow': 'Enter the id of a user added to follow_list:'})
class Follow_add(Resource):
    def post(self):
        Data = DataBase('localhost', 'root', '123456', 'ordinary_folk', 3306)
        args = parser.parse_args()
        userid = args.get('userid')
        userid_follow = args.get('userid_follow')
        list1 = Data.SelectData('SELECT * from usertable where id = ' + str(userid))
        follow_list = []
        if list1:
            for i in range(len(list1)):
                follow_list.append(list1[i]["followlist"])
        Data = DataBase('localhost', 'root', '123456', 'ordinary_folk', 3306)
        list2 = Data.SelectData('SELECT * from usertable where id = ' + str(userid_follow))
        follower_list = []
        if list2:
            for i in range(len(list2)):
                follower_list.append(list2[i]["follower"])        

        if str(userid_follow) in follow_list[0]:
            return {"error": "This user is already in the follow list"}, 400
        else:
            if follow_list[0][0] == '':
                follow_list[0][0] = str(userid_follow)
                
                
            else:
                follow_list[0].append(str(userid_follow))
            if follower_list[0][0] == '':
                follower_list[0][0] = str(userid)
            else:    
                follower_list[0].append(str(userid))


            str_follow = '/'.join(follow_list[0])
            str_follower = '/'.join(follower_list[0])

            Data = DataBase('localhost', 'root', '123456', 'ordinary_folk', 3306)
            Data.UpdateData('update usertable set followlist = "' + str_follow + '" where id = ' + str(userid))
            Data = DataBase('localhost', 'root', '123456', 'ordinary_folk', 3306)
            Data.UpdateData('update usertable set follower = "' + str_follower + '" where id = ' + str(userid_follow))
            
            return {"message": "successfully added it to followlist"}, 200

@api.route("/user/banned-list/add")
@api.doc(params={'userid': 'Enter the id of a user:'})
@api.doc(params={'userid_banned': 'Enter the id of a user added to banned-list:'})
class Banned_add(Resource):
    def post(self):
        Data = DataBase('localhost', 'root', '123456', 'ordinary_folk', 3306)
        args = parser.parse_args()
        userid = args.get('userid')
        userid_banned = args.get('userid_banned')
        list1 = Data.SelectData('SELECT * from usertable where id = ' + str(userid))
        ban_list = []
        if list1:
            for i in range(len(list1)):
                ban_list.append(list1[i]["banlist"])
        print(ban_list)

        if str(userid_banned) in ban_list[0]:
            return {"error": "This user is already in the banned list"}, 400
        else:
            if ban_list[0][0] == '':
                ban_list[0][0] = str(userid_banned)

            else:
                ban_list[0].append(str(userid_banned))

            print(ban_list)
            str_ban = '/'.join(ban_list[0])
            print(str_ban)
            print(type(str_ban))
            Data = DataBase('localhost', 'root', '123456', 'ordinary_folk', 3306)
            Data.UpdateData('update usertable set banlist = "' + str_ban + '" where id = ' + str(userid))
            return {"message": "successfully added it to ban_list"}, 200


# user_id = 1

@api.route("/dashboard/wishlist-remove")
@api.doc(params={'userid': 'Enter the id of a user:'})
@api.doc(params={'movie_id': 'Enter the id of a movie:'})
class Wishlist_remove(Resource):
    def delete(self):
        Data = DataBase('localhost', 'root', '123456', 'ordinary_folk', 3306)
        args = parser.parse_args()
        userid = args.get('userid')
        movie_id = args.get('movie_id')
        list1 = Data.SelectData('SELECT * from usertable where id = ' + str(userid))
        list_wish = []
        if list1:
            for i in range(len(list1)):
                list_wish.append(list1[i]["wishlist"])
        print(list_wish)

        if str(movie_id) not in list_wish[0]:
            return {"error": "the movie is not in the wish list"}, 400
        else:
            list_wish[0].remove(str(movie_id))
            # print(list_wish)
            str_wish = '/'.join(list_wish[0])
            # print(str_wish)
            # print(type(str_wish))
            Data = DataBase('localhost', 'root', '123456', 'ordinary_folk', 3306)
            Data.UpdateData('update usertable set wishlist = "' + str_wish + '" where id = ' + str(userid))
            return {"message": "successfully delete it on wishlist"}, 200


@api.route("/user/follow-list/remove")
@api.doc(params={'userid': 'Enter the id of a user:'})
@api.doc(params={'userid_follow': 'Enter the id of a user that want to remove from follow_list:'})
class Followlist_remove(Resource):
    def delete(self):
        Data = DataBase('localhost', 'root', '123456', 'ordinary_folk', 3306)
        args = parser.parse_args()
        userid = args.get('userid')
        userid_follow = args.get('userid_follow')
        list1 = Data.SelectData('SELECT * from usertable where id = ' + str(userid))
        list_follow = []
        if list1:
            for i in range(len(list1)):
                list_follow.append(list1[i]["followlist"])
        Data = DataBase('localhost', 'root', '123456', 'ordinary_folk', 3306)
        list2 = Data.SelectData('SELECT * from usertable where id = ' + str(userid_follow))
        list_follower = []
        if list2:
            for i in range(len(list2)):
                list_follower.append(list2[i]["follower"])
        if str(userid_follow) not in list_follow[0]:
            return {"error": "the movie is not in the follow list"}, 400
        else:
            list_follow[0].remove(str(userid_follow))
            list_follower[0].remove(str(userid))
            # print(list_wish)
            str_wish = '/'.join(list_follow[0])
            str_follower = '/'.join(list_follower[0])
            # print(str_wish)
            # print(type(str_wish))
            Data = DataBase('localhost', 'root', '123456', 'ordinary_folk', 3306)
            Data.UpdateData('update usertable set followlist = "' + str_wish + '" where id = ' + str(userid))
            Data = DataBase('localhost', 'root', '123456', 'ordinary_folk', 3306)
            Data.UpdateData('update usertable set follower = "' + str_follower + '" where id = ' + str(userid_follow))           
            return {"message": "successfully delete it on followlist"}, 200


@api.route("/user/banned-list/remove")
@api.doc(params={'userid': 'Enter the id of a user:'})
@api.doc(params={'userid_banned': 'Enter the id of a user that want to remove from banned_list:'})
class Banlist_remove(Resource):
    def delete(self):
        Data = DataBase('localhost', 'root', '123456', 'ordinary_folk', 3306)
        args = parser.parse_args()
        userid = args.get('userid')
        userid_banned = args.get('userid_banned')
        list1 = Data.SelectData('SELECT * from usertable where id = ' + str(userid))
        ban_list = []
        if list1:
            for i in range(len(list1)):
                ban_list.append(list1[i]["banlist"])
        print(ban_list)

        if str(userid_banned) not in ban_list[0]:
            return {"error": "the movie is not in the banned list"}, 400
        else:
            ban_list[0].remove(str(userid_banned))
            # print(list_wish)
            str_ban = '/'.join(ban_list[0])
            # print(str_wish)
            # print(type(str_wish))
            Data = DataBase('localhost', 'root', '123456', 'ordinary_folk', 3306)
            Data.UpdateData('update usertable set banlist = "' + str_ban + '" where id = ' + str(userid))
            return {"message": "successfully delete it on bannedlist"}, 200


@api.route("/movie/write-review/<movie_id>")
@api.expect(ac_model, validate=True)
@api.doc(body=ac_model)
class Write_review(Resource):
    def post(self, movie_id):
        form = ReviewForm(ImmutableMultiDict(request.json))
        if form.validate():
            user_id = form.user_id.data
            rate = form.rate.data
            reviews = form.reviews.data
            time1 = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())
            Data = socre_comment('localhost', 'root', '123456', 'ordinary_folk', 3306)
            list2 = Data.SelectData(
                'SELECT * from usercomment where movieid = ' + str(movie_id) + ' AND  userid = ' + str(user_id) + '')
            print(list2)
            if len(list2) != 0:
                Data = socre_comment('localhost', 'root', '123456', 'ordinary_folk', 3306)
                Data.UpdateData('update usercomment set rated = ' + str(rate) + ' where movieid = ' + str(
                    movie_id) + ' AND  userid = ' + str(user_id) + '')
            else:
                Data = socre_comment('localhost', 'root', '123456', 'ordinary_folk', 3306)
                Data.AddData(
                    'insert into usercomment(movieid,userid,rated,comment,create_time) values('
                    '"' + str(movie_id) + '","' + str(user_id) + '","' + str(rate) + '","' + reviews + '","' + str(
                        time1) + '")')
            # Data.UpdateData('update usercomment set movieid = ' + str(movie_id) + ' where userid = ' + str(user_id) + '')
            # Data.UpdateData('update usercomment set rated = ' + str(rate) +' where movieid = ' + str(movie_id) + ' AND  userid = ' + str(user_id) + '')
            movie_list1=[]
            movie_list1.append(movie_id)
            rate_,comment_=find_scorecomment(1, movie_list1)
            Data = DataBasemovie('localhost', 'root', '123456', 'ordinary_folk', 3306)
            Data.UpdateDatamovie('update movie5000 set rated = '+str(rate_[0])+' where id = '+str(movie_id))
            return {"message": "Success!"}, 200
        else:
            return {"error": "There could be some error :)"},


@api.route("/user/profile-update/<user_id>")
@api.expect(ac_model1, validate=True)
@api.doc(body=ac_model1)
class Update(Resource):
    def post(self, user_id):
        form = UpdateForm(ImmutableMultiDict(request.json))
        if form.validate():
            user_name = form.user_name.data
            user_img = form.user_img.data
            # password = form.password.data
            hash_password = generate_password_hash(form.password.data)  # generate pwd
            Data = DataBase('localhost', 'root', '123456', 'ordinary_folk', 3306)
            Data.UpdateData(
                'update usertable set user_name = "' + str(user_name) + '", userimg = "' + str(
                    user_img) + '", password = "' + str(hash_password) + '" where id = "' + str(user_id) + '"')
            return {"message": "Profile has been modified"}, 200
        else:
            return {"error": "Invalid input"}, 400


@api.route("/user/dashboard/<user_id>")
@api.doc(params={'user_id': 'user id is:'})
class GetProfile(Resource):
    def get(self, user_id):
        Data = DataBase('localhost', 'root', '123456', 'ordinary_folk', 3306)
        list_1 = Data.SelectData('SELECT * from usertable where id=' + str(user_id))
        #print(list_1[0])
        if list_1[0]['wishlist'][0] == '':
            pass
        else:
            movieid_list = list_1[0]['wishlist']
            wishlist_out = []
            movie_rated, movie_comment = find_scorecomment(user_id, movieid_list)
            for i in range(len(movieid_list)):
                dic = {}
                Data = DataBasemovie('localhost', 'root', '123456', 'ordinary_folk', 3306)
                list_2 = Data.SelectDatamovie('SELECT * from movie5000 where id=' + str(movieid_list[i]))
                dic['movie_id'] = list_2[0]['id']
                dic['movie_name'] = list_2[0]['name']
                dic['poster'] = fetch_poster(list_2[0]['id'])
                dic['rate'] = movie_rated[i]
                wishlist_out.append(dic)
            list_1[0]['wishlist'] = wishlist_out
        if list_1[0]['banlist'][0] == '':
            pass
        else:
            banlist = list_1[0]['banlist']
            banlist_out = []
    
            for i in range(len(banlist)):
                dic = {}
                Data = DataBase('localhost', 'root', '123456', 'ordinary_folk', 3306)
                list_3 = Data.SelectData('SELECT * from usertable where id=' + str(banlist[i]))
                dic['user_id'] = list_3[0]['id']
                dic['user_name'] = list_3[0]['user_name']
                dic['user_img'] = list_3[0]['userimg']
                banlist_out.append(dic)
            list_1[0]['banlist'] = banlist_out   
        if list_1[0]['followlist'][0] == '':
            pass
        else:
            followlist = list_1[0]['followlist']
            followlist_out = []
    
            for i in range(len(followlist)):
                dic = {}
                Data = DataBase('localhost', 'root', '123456', 'ordinary_folk', 3306)
                list_4 = Data.SelectData('SELECT * from usertable where id=' + str(followlist[i]))
                dic['user_id'] = list_4[0]['id']
                dic['user_name'] = list_4[0]['user_name']
                dic['user_img'] = list_4[0]['userimg']
                followlist_out.append(dic)
            list_1[0]['followlist'] = followlist_out   
        if list_1[0]['follower'][0] == '':
            pass
        else:
            follower = list_1[0]['follower']
            follower_out = []
    
            for i in range(len(follower)):
                dic = {}
                Data = DataBase('localhost', 'root', '123456', 'ordinary_folk', 3306)
                list_5 = Data.SelectData('SELECT * from usertable where id=' + str(follower[i]))
                dic['user_id'] = list_5[0]['id']
                dic['user_name'] = list_5[0]['user_name']
                dic['user_img'] = list_5[0]['userimg']
                follower_out.append(dic)
            list_1[0]['follower'] = follower_out  
        del (list_1[0]['password'])
        del (list_1[0]['create_time'])
        del (list_1[0]['id'])
        print(list_1[0])
        result=list_1[0]
        
        return result, 200
    

@api.route("/user/auth/register")
@api.expect(register_fields, validate=True)
@api.doc(body=register_fields)
class Register(Resource):
    def post(self):
        print("register:", request.json)
        form = RegisterForm(ImmutableMultiDict(request.json))
        if form.validate():
            email = form.email.data
            username = form.name.data
            password = form.password.data
            hash_password = generate_password_hash(password)  # generate pwd
            user = UserModel(email=email, user_name=username, password=hash_password,
                             userimg='', wishlist='', banlist='', followlist='',
                             follower='', is_admin=0)  # create user model
            db.session.add(user)  # add user
            db.session.commit()  # commit in db
            return {"token": create_access_token(identity=email), "userid": user.id, "isadmin": user.is_admin}, 200
        else:
            # print(form.errors.get()) ??
            if form.errors.get("email"):
                # duplicate email
                return {"error": "Email address already registered"}, 400
        return {"error": "Invalid input"}, 400


@api.route("/user/auth/login")
@api.expect(login_fields, validate=True)
@api.doc(body=login_fields)
class Login(Resource):
    def post(self):
        print("login:", request.json)
        form = LoginForm(ImmutableMultiDict(request.json))  # init data from json body
        if form.validate():
            email = form.email.data  # get email
            password = form.password.data  # get password
            user = UserModel.query.filter_by(email=email).first()  # query user
            # login = Login()
            if user and check_password_hash(user.password, password):  # check the user's pwd
                # global user_id
                # user_id = user.id
                return {"token": create_access_token(identity=email), "userid": user.id,
                        "isadmin": user.is_admin}, 200  # creat and return token
            else:
                # validation email or password error
                return {"error": "Invalid username or password"}, 400
        return {"error": "Invalid input"}, 400


@api.route("/user/auth/logout")
@api.doc(params={'token': 'user token is:'})
class Logout(Resource):
    # @jwt_required()
    def post(self):
        # [WARNING!] As not use for token check, logout just do nothing but return 200
        # jti = get_jwt()["jti"]  # get jti
        # print("Log out show jti:", jti, '\n')
        # now = datetime.now(datetime.timezone.utc)
        # db.session.add(TokenBlocklist(jti=jti, created_at=now))  # creat blocklist record
        # db.session.commit()
        return {"message": "Log out success!"}, 200


if __name__ == "__main__":
    app.run(debug=True)
