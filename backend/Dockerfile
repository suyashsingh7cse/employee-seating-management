# Dev-oriented image, used by docker-compose.yml for local development.
# For the production single-service image (frontend + backend combined),
# see the root-level Dockerfile instead.
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5001

CMD ["python", "run.py"]
