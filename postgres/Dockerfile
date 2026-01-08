FROM postgis/postgis:15-3.4-alpine

# Instalar dependencias para compilar pgvector
RUN apk add --no-cache --virtual .build-deps \
    build-base \
    git \
    clang15 \
    llvm15

# Compilar pgvector
RUN git clone --branch v0.5.1 https://github.com/pgvector/pgvector.git /tmp/pgvector \
    && cd /tmp/pgvector \
    && make \
    && make install \
    && apk del .build-deps \
    && rm -rf /tmp/pgvector
