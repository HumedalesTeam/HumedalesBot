#importing required libraries

import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
import seaborn as sns
import matplotlib.pyplot as plt
from scipy.cluster.hierarchy import dendrogram, linkage
from scipy.cluster.hierarchy import fcluster
import datetime as dt

# establishing the connection to MySQL
# TBD

# (Temporary) reading the CVS file
df = pd.read_csv('humedales.csv')

# (Visualize - uncomment)
# plt.title('All Coordinates')
# plt.scatter(x=df[['longitude']], y=df[['latitude']])

# generate the linkage matrix
X = df[['latitude', 'longitude']].values
Z = linkage(X,
            method='complete',  # dissimilarity metric: max distance across all pairs of 
                                # records between two clusters
            metric='euclidean'
    )                           # you can peek into the Z matrix to see how clusters are 
                                # merged at each iteration of the algorithm

# (Visualize - uncomment) calculate full dendrogram and visualize it
# plt.figure(figsize=(30, 100))
# dendrogram(Z)
# plt.show()

# retrive clusters with `max_d`
max_d = 0.02    # 0.1 of Latitude/Longitude value is approximately 11 km
                # 0.01 of unit ~ 1 km, thus ~0.03 of unit ~ 2 km
# generate clusters for all points  
clusters = fcluster(Z, max_d, criterion='distance')
# add a new column with assigned cluster number
df['cluster'] = clusters

# (Visualize - uncomment) plot the clusters
# sns.scatterplot(x = df['longitude'], y = df['latitude'], hue=clusters)

# creating a df of groups only
# longitude and latitude correspond to group circle's center

Event_groups = df.groupby(['cluster']).mean()
# adding a column with the time when we first classified the data
Event_groups['Init Time'] = dt.datetime.now()
# adding a column with the time we last classified the data
Event_groups['Last Updated'] = dt.datetime.now()

# (Uncomment to see the clustered fire events data)
# Event_groups

# (TBD) going through new fires identified as of today
# if these fires lie within a radius of previous fire groups - adding them to the group
# & keeping initial time
# else - creating a new fire group with these events
# def add_new_FireEvent(humedales_today):
    # for i in range(len(humedales_today)-1,0,-1): 

# TBD - to ingest data into the database & table
# Either keeping this part here, or in another code file

import mysql.connector
from mysql.connector import Error

try:
    connection = mysql.connector.connect(host = process.env.MYSQL_HOST,
                                         user = process.env.MYSQL_USER,
                                         password = process.env.MYSQL_PASSWORD,
                                         database = process.env.MYSQL_SCHEMA)
    if connection.is_connected():
        db_Info = connection.get_server_info()
        print("Connected to MySQL Server version ", db_Info)
        cursor = connection.cursor()
        cursor.execute("select database();")
        record = cursor.fetchone()
        print("You're connected to database: ", record)

except Error as e:
    print("Error while connecting to MySQL", e)

# finally:
#     if connection.is_connected():
#         cursor.close()
#         connection.close()
#         print("MySQL connection is closed")
        

cursor = connection.cursor()
fireClusters.to_sql(con=connection, name='fireClusters', if_exists='append', flavor='mysql')

# creating column list for insertion
cols = "`,`".join([str(i) for i in Event_groups.columns.tolist()])

# Insert DataFrame records one by one
for i, row in Event_groups.iterrows():
    sql = "INSERT INTO `fireClusters` (`" + cols + "`) VALUES (" + "%s,"*(len(row)-1) + "%s)"
    cursor.execute(sql, tuple(row))

    # the connection is not autocommitted by default, so we must commit to save our changes
    connection.commit()