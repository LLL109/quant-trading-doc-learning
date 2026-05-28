FROM python:3.12-slim

WORKDIR /app

RUN pip install uv pyyaml

COPY pyproject.toml uv.lock ./
RUN uv sync

COPY . .

RUN mkdir -p /app/data

ENV PYTHONPATH=/app

RUN python3 scripts/import_content.py || true
RUN python3 scripts/import_quizzes.py || true

EXPOSE ${PORT:-8040}

CMD ["sh", "-c", "uv run uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8040}"]
