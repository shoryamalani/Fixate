#!/usr/bin/python

from __future__ import print_function

import psycopg2
def execute_database_command(conn,command):
    cur = conn.cursor()
    cur.execute(command)
    return [conn, cur]
