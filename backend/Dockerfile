FROM python:3.12-slim

WORKDIR /app

RUN pip install uv

COPY pyproject.toml uv.lock ./
RUN uv sync --no-dev

COPY . .

RUN mkdir -p /app/data

EXPOSE ${PORT:-8040}

CMD ["sh", "-c", "python3 scripts/import_content.py; python3 scripts/import_quizzes.py; uv run uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8040}"]
