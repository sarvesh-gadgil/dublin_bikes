import pymysql

host = "dublin-bikes.c96ersz2ktrh.us-east-1.rds.amazonaws.com"
dbname = "dublin_bikes"
user = "root"
password = "dublin_bikes_root"


def get_db_connection():
    # Open and return db connection
    return pymysql.connect(host, user, password, dbname)
