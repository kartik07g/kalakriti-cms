import psycopg2
import pandas as pd
import csv

# ====== CONFIGURATION ======
CSV_FILE = 'data.csv'               # Path to your input CSV file
FAILED_CSV = 'failed_records.csv'   # Path to log failed records
DB_CONFIG = {
    'dbname': 'your_db',
    'user': 'your_user',
    'password': 'your_password',
    'host': 'localhost',
    'port': '5432'
}
TABLE_NAME = 'your_table'           # Target table name
# ============================

def insert_data_from_csv():
    # Load CSV into pandas DataFrame
    df = pd.read_csv(CSV_FILE)

    # Create a connection to PostgreSQL
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
    except Exception as e:
        print("❌ Database connection failed:", e)
        return

    success_count = 0
    failed_rows = []

    print(f"🚀 Starting insertion of {len(df)} records...")

    for index, row in df.iterrows():
        try:
            columns = ', '.join(row.index)
            placeholders = ', '.join(['%s'] * len(row))
            values = tuple(row)

            query = f"INSERT INTO {TABLE_NAME} ({columns}) VALUES ({placeholders})"
            cursor.execute(query, values)
            conn.commit()

            success_count += 1
            print(f"✅ Record {index + 1} inserted successfully. Total success: {success_count}")

        except Exception as e:
            print(f"❌ Error inserting record {index + 1}: {e}")
            failed_rows.append(row.to_dict())
            conn.rollback()

    # Log failed rows to CSV
    if failed_rows:
        print(f"\n⚠️ {len(failed_rows)} records failed. Writing to {FAILED_CSV}")
        pd.DataFrame(failed_rows).to_csv(FAILED_CSV, index=False)

    # Close DB connection
    cursor.close()
    conn.close()

    print(f"\n🎯 Insertion completed. {success_count} records inserted successfully. {len(failed_rows)} failed.")

if __name__ == "__main__":
    insert_data_from_csv()
