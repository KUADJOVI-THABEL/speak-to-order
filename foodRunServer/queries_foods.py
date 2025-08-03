import sqlite3
import re

def split_product_name(name):
    # Insert a space before each uppercase letter that follows a lowercase letter
    return re.sub(r'([a-z])([A-Z])', r'\1 \2', name)

def find_product_by_name_like(conn, name):
    cursor = conn.cursor()
    cursor.execute('''
        SELECT * FROM menu_products WHERE name LIKE ?
    ''', ('%' + name + '%',))
    return cursor.fetchall()

def parse_fetch_to_json(fetch_response):
    columns = ['id', 'name', 'description', 'price', 'image_url']
    result = []
    for row in fetch_response:
        item = dict(zip(columns, row))
        # Split the name if needed (e.g., by space or special char)
        item['name'] = split_product_name(item['name']) 
        result.append(item)
    return result
    