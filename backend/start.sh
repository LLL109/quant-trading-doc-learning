#!/bin/sh
set -e

cd /app

# Run seed scripts if database is empty
if [ ! -f /app/data/quant_learning.db ] || [ "$(python3 -c "import sqlite3; conn = sqlite3.connect('/app/data/quant_learning.db'); print(conn.execute('SELECT COUNT(*) FROM knowledge_points').fetchone()[0])" 2>/dev/null || echo 0)" = "0" ]; then
    echo "Seeding database..."
    uv run python scripts/import_content.py
    uv run python scripts/import_quizzes.py
    echo "Seeding complete."
fi

# Start the server
exec uv run uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8040}
