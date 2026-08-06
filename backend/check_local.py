import sqlite3
import json

conn = sqlite3.connect('vrebro.db')
conn.row_factory = sqlite3.Row
cursor = conn.cursor()
cursor.execute("SELECT * FROM categories")
rows = cursor.fetchall()
print(json.dumps([dict(row) for row in rows], ensure_ascii=False, indent=2))
conn.close()
