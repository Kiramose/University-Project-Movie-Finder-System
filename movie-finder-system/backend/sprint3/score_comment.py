# -*- coding: utf-8 -*-
"""
Created on Tue Jul  5 12:24:31 2022

@author: kamyf
"""

# -*- coding: utf-8 -*-

import pymysql
from datetime import datetime
import numpy as np
class DataBase(object):
    def __init__(self,host, user, password, database, port):

        self.db = pymysql.connect(host=host,user=user,password=password,database=database,port=port,charset='utf8')


    def AddData(self,sql):

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

    def UpdateData(self,sql):
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
    def DeleteData(self,sql):
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
    def SelectData(self,sql):
        self.cursor = self.db.cursor()

        try:
            self.cursor.execute(sql)

            data = self.cursor.fetchall()


            list = []
            for i in data:
                list6=i[6].split("/")
                list7=i[7].split("/")
                list8=i[8].split("/")
                list9=i[9].split("/")
                d = {
                    'id':i[0],
                    'user_name':i[1],
                    'email':i[2],
                    'password':i[3],
                    'create_time':i[4],
                    'userimg':i[5],
                    'wishlist':list6,
                    'banlist':list7,
                    'followlist':list8,
                    'follower':list9,
                    
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
    def __init__(self,host, user, password, database, port):

        self.db = pymysql.connect(host=host,user=user,password=password,database=database,port=port,charset='utf8')


    def AddData(self,sql):

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

    def UpdateData(self,sql):
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
    def DeleteData(self,sql):
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
    def SelectData(self,sql):
        self.cursor = self.db.cursor()

        try:
            self.cursor.execute(sql)

            data = self.cursor.fetchall()


            list = []
            for i in data:
                d = {
                    'id':i[0],
                    'userid':i[1],
                    'movieid':i[2],
                    'rated':i[3],
                    'comment':i[4],
                    'create_time':i[5],

                    
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
    def __init__(self,host, user, password, database, port):
        self.db = pymysql.connect(host=host,user=user,password=password,database=database,port=port,charset='utf8')
        
    def SelectDatamovie(self,sql):
        self.cursor = self.db.cursor()

        try:
            self.cursor.execute(sql)

            data = self.cursor.fetchall()


            list = []
            for i in data:
                list2=i[2].split("/")
                str3=i[3].replace("/",",")
                list4=i[4].split("/")
                list8=i[8].split("/")
                d = {
                    'id':i[0],
                    'name':i[1],
                    'genres':list2,
                    'overview':str3,
                    'keywords':list4,
                    'language':i[5],
                    'runtime':i[6],
                    'director':i[7],
                    'actor':list8,
                    'rated':i[9],
                    
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


def find_scorecomment(userid,movieid_list):
    Data = DataBase('localhost','root','','ordinary_folk',3306)
    list = Data.SelectData('SELECT * from usertable where id ='+str(userid))
    banlist=[]
    if list:
        banlist=list[0]["banlist"]
        #print(banlist)
    else:
        return [],[]
    

    movie_rated=[]
    movie_comment=[]
    for i in range (len(movieid_list)):
        Data = socre_comment('localhost','root','','ordinary_folk',3306)
        list1 = Data.SelectData('SELECT * from usercomment where movieid ='+str(movieid_list[i]))
        if list1:
            userid=[]
            rate=[]
            comment=[]
            for j in range(len(list1)):
                if str(list1[j]["userid"]) not in banlist:
                    userid.append(list1[j]["userid"])
                    rate.append(list1[j]["rated"])
                    comment.append(list1[j]["comment"])
            
            movie_rated.append(np.mean(rate))
            movie_comment.append(comment)
        else:
            movie_rated.append(0.0)
            movie_comment.append([])
    return (movie_rated,movie_comment)
            

                
        
        
    
    

if __name__ == '__main__':
    Data = DataBasemovie('localhost','root','','ordinary_folk',3306)
    #change keywords between %%
    list = Data.SelectDatamovie('SELECT * from movie5000 where keywords like "%school of witchcraft%"')
    
    
    #Data.AddData('insert into usertable(user_name,email,password,create_time,userimg,wishlist,banlist,followlist) values("kam","abc-gmail.com","12345","1","2","3","3/4/5","5")')
    
    #Data.UpdateData('update usertable set email = "456@gmail.com" where user_name = "kam"')

    #Data.DeleteData('delete from usertable where id=2')

    #list=Data.SelectData('select * from usertable where user_name="kam"')
    list_ide=[100,101,102]
    list_id=[]
    if list:
        for i in range(len(list)):
            list_id.append(list[i]["id"])
        userid=1
        movie_rated,movie_comment=find_scorecomment(userid,list_ide)
    print( movie_rated)
    print( movie_comment)
    '''
命令行drop databse ordinary_folk;
create databse ordinary_folk;
然后重新运行一下database.py
命令行进入mysql后 use ordinary_folk;输入下面的sql语句在表里创建数据 然后测试一下

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
insert into usercomment(userid,movieid,rated,comment,create_time) values("5","102","8.0","d!!!","1");'''
            

    

   


