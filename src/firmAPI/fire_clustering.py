#!/usr/bin/env python
# coding: utf-8

# In[ ]:


# pip install geopandas


# In[ ]:


# pip install shapely


# In[116]:


# importing required libraries

# for sth like Requirements.txt -> pip install mysql-connector-python
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
import seaborn as sns
import matplotlib.pyplot as plt
from scipy.cluster.hierarchy import dendrogram, linkage
from scipy.cluster.hierarchy import fcluster
import datetime as dt

# Getting data from API (url), making into a df
url ='https://firms.modaps.eosdis.nasa.gov/api/country/csv/01dbe567da924b7f4f01780a6615ef11/VIIRS_SNPP_NRT/ARG/1/'
df_init = pd.read_csv(url, skiprows=False, header='infer', sep=',')

# squares = [[[-33.39087482955327, -58.50674748160459], 
#             [-34.387524974821325, -59.123293544400354]],
#            [[-33.19934046720891, -59.13810756104891], 
#             [-33.83221610724139, -60.171178725618375]],
#            [[-32.612518268000905, -60.2006744136563],
#             [-33.0733681732123, -60.64234700361604]],
#            [[-31.886847558311302, -60.51245376437194],
#             [-32.69620288634272, -60.75438881783346]]]

# filtering records to be within squares
# for now - one big square using min/max of the squares above

df = df_init[((df_init["latitude"]>=-34.387524974821325) & (df_init["latitude"]<=-31.886847558311302)) & ((df_init["longitude"]>=-60.75438881783346) & (df_init["longitude"]<=-58.50674748160459))]

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
max_d = 0.01   # 0.1 of Latitude/Longitude value is approximately 11 km
                # 0.01 of unit ~ 1 km
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


# In[117]:


from shapely.geometry import Point
import geopandas as gpd
from geopandas import GeoDataFrame

geometry = [Point(xy) for xy in zip(df['longitude'], df['latitude'])]
gdf = GeoDataFrame(df, geometry=geometry)   

# a simple map that comes with geopandas
world = gpd.read_file(gpd.datasets.get_path('naturalearth_lowres'))
ax = world[world.continent == 'South America'].plot(color='white', edgecolor='black')
gdf.plot(ax=ax, marker='o', color='red', markersize=15)

minx, miny, maxx, maxy = gdf.total_bounds
ax.set_xlim(-60.75438881783346, -58.50674748160459)
ax.set_ylim(-34.387524974821325, -31.886847558311302)


# In[121]:


# view original df
# df


# In[119]:


# view clustered (processed) df
# Event_groups


# In[120]:


# geometry = [Point(xy) for xy in zip(Event_groups['longitude'], Event_groups['latitude'])]
# gdf = GeoDataFrame(Event_groups, geometry=geometry)   

# # a simple map that comes with geopandas
# world = gpd.read_file(gpd.datasets.get_path('naturalearth_lowres'))
# ax = world[world.continent == 'South America'].plot(color='white', edgecolor='black')
# gdf.plot(ax=ax, marker='o', color='red', markersize=15)

# minx, miny, maxx, maxy = gdf.total_bounds
# ax.set_xlim(-60.75438881783346, -58.50674748160459)
# ax.set_ylim(-34.387524974821325, -31.886847558311302)


# In[125]:


# TBD - to ingest data into the database & table
# Either keeping this part here, or in another code file

import mysql.connector
from mysql.connector import Error

MYSQL_HOST="198.27.80.122"
MYSQL_USER="ignis"
MYSQL_PASSWORD="h6qRmFJKJ96EUdXrP1NG!"
MYSQL_SCHEMA="ignis"

try:
    connection = mysql.connector.connect(host = MYSQL_HOST,
                                         user = MYSQL_USER,
                                         password = MYSQL_PASSWORD,
                                         database = MYSQL_SCHEMA)
    if connection.is_connected():
        db_Info = connection.get_server_info()
        print("Connected to MySQL Server version ", db_Info)
        cursor = connection.cursor()
        cursor.execute("select database();")
        record = cursor.fetchone()
        print("You're connected to database: ", record)

except Error as e:
    print("Error while connecting to MySQL", e)
    
finally:
    if connection.is_connected():
        cursor.close()
        connection.close()
        print("MySQL connection is closed")


# In[ ]:


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

