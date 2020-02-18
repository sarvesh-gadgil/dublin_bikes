import pymysql

# host = "dublin-bikes.c96ersz2ktrh.us-east-1.rds.amazonaws.com"
host = "localhost"
dbname = "dublin_bikes"
user = "root"
# password = "dublin_bikes_root"
password = "Chaitu@2601"


def get_db_connection():
    # Open and return db connection
    return pymysql.connect(host, user, password, dbname)
