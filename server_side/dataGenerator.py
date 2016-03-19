#!/usr/bin/env python
from __future__ import print_function
from __future__ import division
import sys
import csv
from random import randint

#Looks to be 43190 unique keys for zipcodes, good to know for number generation
counter = 0
zipDict = {}
stateDict = {}
countyDict= {}
latLngDict = {}
quadrantBounds = {}
varId =0;
#Zip data found here: http://www.boutell.com/zipcodes/
#Headers ['zip', 'city', 'state', 'latitude', 'longitude', 'timezone', 'dst']
with open('./data/zipcode.csv', 'rb') as csvfile:
    zip_reader = csv.reader(csvfile)
    headers = next(zip_reader, None)
    for row in zip_reader:
        #Checking to see if the row is populated (theres some bad data in the set)
        if row:
            zipDict[counter] = row
            counter +=1
            if row[2] in latLngDict:
                latLngDict[row[2]].append([row[3],row[4]])
            else:
                latLngDict[row[2]] = [[row[3],row[4]]]

#http://statetable.com/ really good website for gata generation
#id,name,abbreviation.country,type,sort,status,occupied,notes,fips_state,assoc_press,standard_federal_region,census_region,census_region_name,census_division,census_division_name,circuit_court
with open('./data/state_table.csv', 'rU') as csvfile:
    state_reader = csv.reader(csvfile)
    next(state_reader, None)
    for row in state_reader:
        #Checking to see if the row is populated (theres some bad data in the set)
        if row:
            stateDict[row[2]] = row


#County data for another (needed) level of nest
#http://www.unitedstateszipcodes.org/zip-code-database/
with open('./data/counties.csv', 'rU') as csvfile:
    county_reader = csv.reader(csvfile)
    next(county_reader, None)
    for row in county_reader:
        #Checking to see if the row is populated (theres some bad data in the set)
        if row[6] and row[0]:
            countyDict[row[0]] =row[6]

def fetchPath(passedInt):
    responseList = []
    for x in range(0,passedInt):
        responseList.append("N")
    while(len(responseList)<3):
        responseList.insert(0,"Y")
    return responseList

#pretty much the same as this data set...http://dev.maxmind.com/geoip/legacy/codes/state_latlon/
def calculateQuadrantBounds():
    for key in latLngDict:
        lats=[]
        lngs=[]
        for array in latLngDict[key]:
            lats.append(float(array[0]))
            lngs.append(float(array[1]))
        avgLng = (min(lngs)+max(lngs))/2
        avgLat = (min(lats)+max(lats))/2
        quadrantBounds[key] = [avgLat,avgLng]

calculateQuadrantBounds()

def findQuadrant(data):
    #data[2] state code
    #data[3] = lat
    #data[4] = lng
    avgs = quadrantBounds[data[2]]
    returnString=""
    if(float(data[3])>=float(avgs[0])):
        returnString+="N"
    else:
        returnString+="S"
    if(float(data[4])>=float(avgs[1])):
        returnString+="E"
    else:
        returnString+="W"
    return returnString+" Corner of "+ stateDict[data[2]][1]

# writer = csv.writer(open('./output/dataTable.csv', 'wb'))

writer = csv.writer(open('../client_side/public/data/sankey.csv','wb'))
writer.writerow(['session_id','duration','Completed_step1','Completed_step2','Completed_pmt',"region_name","region_code","state_code","state_name","zip_code","city_name","lat","lng","state_quadrant","county_name","basket_price","country"])

#reccomended a (43190 * 4 = 172760) or more iterator (for key collisions)
for x in range(0,int(sys.argv[1])):
    index = randint(0,43190)
    zipData = zipDict[index]
    #half a second to 5 mins
    duration = randint(500,300000)
    basket_price = randint(5,250)
    state = stateDict[zipData[2]][1]
    path = fetchPath(randint(0,3))
    region_name = stateDict[zipData[2]][15]
    region_code = stateDict[zipData[2]][13]
    country = "United States"
    if zipData[0] in countyDict:
        county = countyDict[zipData[0]]
    else:
        county = "Unknown County"
    state_quadrant = findQuadrant(zipData)
    writer.writerow([varId,duration,path[0],path[1],path[2],region_name,region_code,zipData[2],state,zipData[0],zipData[1],zipData[3],zipData[4],state_quadrant,county,basket_price,country])
    varId+=1
  