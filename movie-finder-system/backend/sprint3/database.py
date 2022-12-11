# -*- coding: utf-8 -*-
"""
Created on Tue Jun 14 11:48:50 2022
@author: kamyf
"""


import pymysql
import pandas as pd
import matplotlib.pyplot as plt
import json
import warnings
from werkzeug.security import generate_password_hash
warnings.filterwarnings('ignore')
plt.rcParams['font.sans-serif'] = ['SimHei'] 


def saveToMysql(dataList):
    init_db()
    conn = pymysql.connect(host='localhost', port=3306, user='root', passwd='123456',db='ordinary_folk',charset='utf8')
    cursor = conn.cursor()
    for data in dataList:
        for index in range(len(data)):
            if index==0 or index==6 or  index==9:
                pass
            elif type(data[index])==str:
                data[index]='"'+data[index]+'"'
        sql = "INSERT INTO movie5000(id,name,genres,overview,keywords,language,runtime,director,actor,rated)\
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)" %(data[0],data[1],data[2],data[3],data[4],data[5],data[6],data[7],data[8],data[9])
        """
        sql='''
                insert into movie5000(
                    id,name,genres,overview,keywords,language,runtime,director,actor,rated)
                    values(%s)'''%",".join(data)"""
        sql = sql.replace("'None'", "NULL").replace("None", "NULL")
        cursor.execute(sql)
        conn.commit()
     
    cursor.close()
    conn.close()
    ano_db()
def ano_db():
    sql_11='''
    delete from movie5000 where id=36597;
    '''
    sql_12='''
    delete from movie5000 where id=50942;
    '''  
    sql_13='''
    delete from movie5000 where id=112430;
    ''' 
    sql_14='''
    delete from movie5000 where id=153397;
    '''
    sql_15='''
    delete from movie5000 where id=183894;
    '''  
    sql_16='''
    delete from movie5000 where id=292539;
    '''  
    sql_17='''
    delete from movie5000 where id=333355;
    '''  
    sql_18='''
    delete from movie5000 where id=370980;
    '''  
    sql_19='''
    delete from movie5000 where id=395766;
    '''  
    sql_20='''
    delete from movie5000 where id=459488;
    '''  
    conn = pymysql.connect(host='localhost', port=3306, user='root', passwd='123456',db='ordinary_folk',charset='utf8')
    cursor = conn.cursor()
    cursor.execute(sql_11)
    conn.commit()
    cursor.execute(sql_12)
    conn.commit()
    cursor.execute(sql_13)
    conn.commit()
    cursor.execute(sql_14)
    conn.commit()
    cursor.execute(sql_15)
    conn.commit()
    cursor.execute(sql_16)
    conn.commit()
    cursor.execute(sql_17)
    conn.commit()
    cursor.execute(sql_18)
    conn.commit()
    cursor.execute(sql_19)
    conn.commit()
    cursor.execute(sql_20)
    conn.commit()
    cursor.close()
    conn.close()
    poster = pd.read_csv('poster.csv')
    rows,columns=poster.shape
    datalist=[]
    for i in range(rows):
        data=[]
        data.append(str(poster['id'][i]))
        data.append(poster['poster'][i])
        datalist.append(data)
    
    conn = pymysql.connect(host='localhost', port=3306, user='root', passwd='123456',db='ordinary_folk',charset='utf8')
    cursor = conn.cursor()
    for data in datalist:
        sql = 'INSERT INTO poster(id,poster)VALUES ('+data[0]+',"'+data[1]+'")'
        
        sql = sql.replace("https://image.tmdb.org/t/p/w500/None", "NULL").replace("None", "NULL")
        cursor.execute(sql)
        conn.commit()
    cursor.close()
    conn.close()
    
def init_db():
    sql_1='''
        create table movie5000(
        id int primary key,
        name text,
        genres text,
        overview text,
        keywords text,
        language text,       
        runtime int,
        director text,
        actor text,
        rated double
        )engine = innodb default charset = utf8;
    '''
    sql_2='''
        create table usertable(
        id int primary key auto_increment,
        user_name text,
        email text,
        password text,
        create_time text,
        userimg mediumtext,
        wishlist text,
        banlist text,
        followlist text,
        follower text,
        is_admin int
        )engine = innodb default charset = utf8;
    '''
    sql_3='''
        create table usercomment(
        id int primary key auto_increment,
        userid int,
        movieid int,
        rated double,
        comment text,
        create_time text
        )engine = innodb default charset = utf8;
    '''
    hash_password = generate_password_hash('123456')
    sql_4='insert into usertable(user_name,email,password,create_time,userimg,wishlist,banlist,followlist,follower,is_admin) values("admin","admin@gmail.com","'+hash_password+'","","","","","","",1)'
    sql_5='insert into usertable(user_name,email,password,create_time,userimg,wishlist,banlist,followlist,follower,is_admin) values("kam1","kam1@gmail.com","'+hash_password+'","","","","","","",0)'
    sql_6='insert into usertable(user_name,email,password,create_time,userimg,wishlist,banlist,followlist,follower,is_admin) values("yue","yue@gmail.com","'+hash_password+'","","","","","","",0)'
    sql_7='insert into usertable(user_name,email,password,create_time,userimg,wishlist,banlist,followlist,follower,is_admin) values("yinuo","yinuo@gmail.com","'+hash_password+'","","","","","","",0)'
    sql_8='insert into usertable(user_name,email,password,create_time,userimg,wishlist,banlist,followlist,follower,is_admin) values("joshua","joshua@gmail.com","'+hash_password+'","","","","","","",0)'
    sql_9='insert into usertable(user_name,email,password,create_time,userimg,wishlist,banlist,followlist,follower,is_admin) values("yuzhe","yuzhe@gmail.com","'+hash_password+'","","","","","","",0)'
    sql_10='''
        create table poster(
        id int primary key,
        poster text
        )engine = innodb default charset = utf8;
    '''
    conn = pymysql.connect(host='localhost', port=3306, user='root', passwd='123456',db='ordinary_folk',charset='utf8')
    cursor = conn.cursor()
    cursor.execute(sql_1)
    cursor.execute(sql_2)
    cursor.execute(sql_3)
    cursor.execute(sql_4)
    conn.commit()
    cursor.execute(sql_5)
    conn.commit()
    cursor.execute(sql_6)
    conn.commit()
    cursor.execute(sql_7)
    conn.commit()
    cursor.execute(sql_8)
    conn.commit()
    cursor.execute(sql_9)
    conn.commit()
    cursor.execute(sql_10)
    cursor.close()
    conn.close()
def getData():
    datalist = []
    movies = pd.read_csv('movies.csv')
    credits= pd.read_csv('credits.csv')
    credits.drop(['title'], axis = 1, inplace = True)
    #print(movies.columns,credits.columns)
    full = pd.concat([movies, credits], axis = 1)
    #print(full.columns)
    full.drop(['budget','homepage','original_title','popularity','production_companies','production_countries','release_date','revenue','spoken_languages','status','tagline','vote_average','vote_count','movie_id'], axis = 1, inplace = True)
    #print(full.columns)
    #print(full.loc[full['runtime'].isnull()])
    full.loc[2656, 'runtime'] = 94
    full.loc[4140, 'runtime'] = 240
    
    
    cols = ['genres', 'keywords', 'cast','crew']
    for col in cols:
        full[col] = full[col].apply(json.loads)
    def getname(x):
        list = []
        for i in x:
            list.append(i['name'])
        return '/'.join(list)
    for col in cols[0:2]:
        full[col] = full[col].apply(getname)
    def getactor(x):
        list = [i['name'] for i in x]
        return '/'.join(list)
    full['cast'] = full['cast'].apply(getactor)
    def getdirector(x):
        list = [i['name'] for i in x if i['job'] == 'Director']
        return '/'.join(list)
    full['crew'] = full['crew'].apply(getdirector)
    rows,columns = full.shape
    full['overview'] = full['overview'].str.replace(',', '/')
    full['overview'] = full['overview'].str.replace('"', '')
    full['overview'] = full['overview'].str.replace("'", "")
    full['keywords'] = full['keywords'].str.replace('"', '')
    full['keywords'] = full['keywords'].str.replace("'", "")
    full['cast'] = full['cast'].str.replace('"', '')
    full['cast'] = full['cast'].str.replace("'", "")
    full['crew'] = full['crew'].str.replace('"', '')
    full['crew'] = full['crew'].str.replace("'", "")
    full = full.astype(object).where(pd.notnull(full), None)

    for i in range (rows):
        data=[]
        
        data.append(""" '%s' """ %full['id'][i])
        data.append(full['title'][i])
        data.append(full['genres'][i])
        data.append(full['overview'][i])
        data.append(full['keywords'][i])
        data.append(full['original_language'][i])
        data.append(""" '%s' """ %full['runtime'][i])
        data.append(full['crew'][i])
        data.append(full['cast'][i])
        data.append(""" '%s' """ %"0.0")

            
        datalist.append(data)
    #print(datalist[0])
    return datalist
def main():
    datalist=getData()

    saveToMysql(datalist)
    
if __name__=="__main__":
    main()
    print("Done")
