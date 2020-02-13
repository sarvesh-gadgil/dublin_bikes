import pandas as pd
import pymysql

host = "localhost"
port = 3306
dbname = ""
user = ""
password = ""

conn = pymysql.connect(host, user=user, port=port, passwd=password, db=dbname)

pd.read_sql('select * from ;', con=conn)