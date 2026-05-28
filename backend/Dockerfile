FROM python:3.12-slim

WORKDIR /app

RUN pip install uv

COPY pyproject.toml uv.lock ./
RUN uv sync

COPY . .

RUN mkdir -p /app/data

EXPOSE ${PORT:-8040}

CMD ["sh", "-c", ".venv/bin/python scripts/import_content.py && .venv/bin/python scripts/import_quizzes.py && .venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8040}"]
