#!/usr/bin/python

from __future__ import print_function
# from _typeshed import NoneType

import psycopg2

def make_read_from_db(items,table):
    text_first_line = "SELECT"
    for item in items:
        text_first_line += " " + item + ","
    text_first_line = text_first_line[:-1] # removing the comma before adding the next line
    return f"""
    {text_first_line}
    FROM {table};
    """
def get_from_where_db(table,column,value):
    final_value = ""
    if type(value) == str:
        value = value.replace("'","&apos;")
        final_value += f"'{value}'"
    elif type(value) == int:
        final_value += f"{value}"
    elif type(value) == bool:
        final_value += f"{value}"
    else:
        final_value += "NULL"
    return f"""
    SELECT * FROM {table}
    WHERE {column}={final_value}
    """
def make_write_to_db(items_list_tuple,table,table_columns):
    text_first_line = f"INSERT INTO {table}"
    table_columns_text = ""
    
    if table_columns != None:
        table_columns_text = "("
        for column in table_columns:
            table_columns_text += column +", "
        table_columns_text = table_columns_text[:-2]
        table_columns_text += ")"
    all_values = ""
    for items_tuple in items_list_tuple:
        values_text = "("
        for value in items_tuple:
            if type(value) == str:
                value = value.replace("'","&apos;")
                values_text += f"'{value}'"
            elif type(value) == int:
                values_text += f"{value}"
            elif type(value) == bool:
                values_text += f"{value}"
            else:
                values_text += "NULL"
            values_text += ","
        values_text = values_text[:-1]
        values_text += "),"
        all_values+=values_text+"\n"
    all_values = all_values[:-2]
    return f"""
    {text_first_line}{table_columns_text}
    VALUES
    {all_values};
    """

        