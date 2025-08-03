import json
import sqlite3

def load_products_from_json(json_path):
    with open(json_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def create_products_table(conn):
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS menu_products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            description TEXT,
            price TEXT,
            image_url TEXT
        )
    ''')
    conn.commit()

def insert_products(conn, products):
    cursor = conn.cursor()
    for product in products:
        cursor.execute('''
            INSERT INTO menu_products (name, description, price, image_url)
            VALUES (?, ?, ?, ?)
        ''', (
            product['name'],
            product['description'],
            product['price'],
            product['image_url']
        ))
    conn.commit()

def seed_products_db(json_path, db_path):
    products = load_products_from_json(json_path)
    conn = sqlite3.connect(db_path)
    create_products_table(conn)
    insert_products(conn, products)
    conn.close()

# Example usage:
# seed_products_db('all_products.json', 'products.db')

def find_product_by_name_like(conn, name):
    cursor = conn.cursor()
    cursor.execute('''
        SELECT * FROM menu_products WHERE name LIKE ?
    ''', ('%' + name + '%',))
    return cursor.fetchall()

if __name__ == "__main__":
    # seed_products_db('all_products.json', 'products.db')
    # Example usage of find_product_by_name_like
    conn = sqlite3.connect('products.db')
    results = find_product_by_name_like(conn, 'Pizza')
    # show just the first result
    if results:
        print(results[0])
    else:
        print("No products found.")