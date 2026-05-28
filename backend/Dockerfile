FROM python:3.12-slim

WORKDIR /app

RUN pip install uv pyyaml

COPY pyproject.toml uv.lock ./
RUN uv sync

COPY . .

RUN mkdir -p /app/data

ENV PYTHONPATH=/app

RUN uv run python scripts/import_content.py
RUN uv run python scripts/import_quizzes.py

EXPOSE 8040

CMD ["./start.sh"]
