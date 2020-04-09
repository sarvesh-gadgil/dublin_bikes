import pymysql
import requests

host = "dublin-bikes.c96ersz2ktrh.us-east-1.rds.amazonaws.com"
dbname = "dublin_bikes"
user = "root"
password = "dublin_bikes_root"



def get_db_connection():
    # Open and return db connection
    return pymysql.connect(host, user, password, dbname)


def get_api_response(url, params):
    # Make a GET request and return json response
    return requests.get(url=url, params=params).json()
