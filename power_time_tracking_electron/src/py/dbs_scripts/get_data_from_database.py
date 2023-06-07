#!/usr/bin/python

from __future__ import print_function

import psycopg2
def connect_to_datbase(host,user,dbname): # connect to a database and return a connection item
    conn = psycopg2.connect( host=host, user=user, dbname=dbname )
    return conn