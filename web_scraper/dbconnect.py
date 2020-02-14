import pymysql

host = "localhost"
dbname = "scrapertest"
user = "root"
password = "Test@123"


def get_db_connection():
    # Open and return db connection
    return pymysql.connect(host, user, password, dbname)
