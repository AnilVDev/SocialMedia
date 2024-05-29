# Docker file for Django

FROM python:3.9-slim
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY . /app/



EXPOSE 8000

CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "socialmediabackend.asgi:application"]