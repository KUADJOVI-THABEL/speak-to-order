import random
import spacy
import sqlite3
from sentence_transformers import SentenceTransformer, util

from word2number import w2n  # to convert "two" → 2

# Load models once
nlp = spacy.load("en_core_web_sm")
model = SentenceTransformer("all-MiniLM-L6-v2")

# 1. Load Products from DB
def load_products(db_path="products.db"):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, description, price, image_url FROM menu_products")
    rows = cursor.fetchall()
    conn.close()
    products_lists = [
        {
            "id": row[0],
            "name": row[1],
            "description": row[2],
            "price": row[3],
            "image_url": row[4]
        }
        for row in rows
    ]
    return products_lists

products = load_products()

nlp = spacy.load("en_core_web_sm")
model = SentenceTransformer("all-MiniLM-L6-v2")

# Convert text to number (e.g., "two" -> 2)
def extract_quantity(token):
    if token.like_num:
        try:
            return int(token.text)
        except ValueError:
            try:
                return w2n.word_to_num(token.text)
            except (ValueError, TypeError):
                return 1
    elif token.text.lower() in ["a", "an", "one"]:
        return 1
    return None

# Extract (quantity, product name) pairs from text
def extract_orders(transcript):
    doc = nlp(transcript)
    orders = []

    for i, token in enumerate(doc):
        if token.pos_ == "NOUN":
            quantity = 1  # default
            prev_token = doc[i - 1] if i > 0 else None
            if prev_token:
                q = extract_quantity(prev_token)
                if q:
                    quantity = q
            orders.append((token.text.lower(), quantity))
    
    return orders


# 3. Embed product texts
def embed_products(products):
    product_texts = [f"{p['name']} {p['description']}" for p in products]
    embeddings = model.encode(product_texts, convert_to_tensor=True)
    return embeddings
def generate_company_name():
    """
    Generates a random, fake company name for a restaurant or food business.
    The company names are tailored to a business that sells pizza, sandwiches, burgers, and salads.
    """
    company_names = [
        "Slice & Stack Eatery",
        "The Urban Grill",
        "Crust & Core Kitchen",
        "Melt & Crunch Deli",
        "The Greener Plate Co.",
        "Primo Plates",
        "Burger & Beyond",
        "The Daily Dish",
        "Savor Street",
        "The Happy Table",
        "Gourmet Grindhouse",
        "Fusion Bites Cafe"
    ]
    return random.choice(company_names)

# 4. Match extracted phrases to products
def match_orders_to_products(orders, products, embeddings, threshold=0.3):
    results = []
    for name, qty in orders:
        query_embedding = model.encode(name, convert_to_tensor=True)
        hits = util.semantic_search(query_embedding, embeddings, top_k=1)[0]
        if hits and hits[0]["score"] > threshold:
            product = products[hits[0]["corpus_id"]]
            results.append({
                "product": product,
                "quantity": qty,
                "company_name": generate_company_name()  # Add a random company name
            })
    return results


# 5. Master function
def get_products_from_transcript(transcript):
    product_embeddings = embed_products(products)
    orders = extract_orders(transcript)
    matched_orders = match_orders_to_products(orders, products, product_embeddings)
    return matched_orders

if __name__ == "__main__":
    # Example usage
    transcript = "I would like to order two pizzas and one coke"
    matched_products = get_products_from_transcript(transcript)
    for item in matched_products:
        print(f"Product: {item['product']['name']}, Quantity: {item['quantity']}")