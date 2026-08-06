import sqlite3

def run():
    print("Migrating vrebro.db...")
    try:
        conn = sqlite3.connect("vrebro.db")
        cursor = conn.cursor()
        
        # Add delivery_cost to orders
        try:
            cursor.execute("ALTER TABLE orders ADD COLUMN delivery_cost FLOAT DEFAULT 0.0")
            print("Added delivery_cost to orders.")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e).lower():
                print("Column delivery_cost already exists.")
            else:
                print(f"Error adding delivery_cost: {e}")
                
        # Create StoreSettings table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS store_settings (
                key VARCHAR PRIMARY KEY,
                value VARCHAR NOT NULL
            )
        """)
        print("Created store_settings table.")
        
        conn.commit()
        conn.close()
        print("Migration complete!")
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == '__main__':
    run()
