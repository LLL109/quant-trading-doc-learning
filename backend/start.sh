#!/bin/sh
# Run seed scripts if database is empty
if [ ! -f /app/data/quant_learning.db ] || [ "$(python3 -c "import sqlite3; conn = sqlite3.connect('/app/data/quant_learning.db'); print(conn.execute('SELECT COUNT(*) FROM knowledge_points').fetchone()[0])" 2>/dev/null || echo 0)" = "0" ]; then
    echo "Seeding database..."
    cd /app
    python3 ../scripts/import_content.py 2>/dev/null || true
    python3 ../scripts/import_quizzes.py 2>/dev/null || true
    echo "Seeding complete."
fi

# Start the server
exec uv run uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8040}
