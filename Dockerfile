FROM node:18

RUN apt-get update && apt-get install -y \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    libaio1

WORKDIR /var/www

COPY ./package*.json /var/www/

RUN npm install

ARG ORACLE_URI=https://download.oracle.com/otn_software/linux/instantclient/217000
ARG INSTANTCLIENT_SUFFIX=-linux.x64-21.7.0.0.0dbru.zip

ARG BASIC=instantclient-basic$INSTANTCLIENT_SUFFIX
ARG SDK=instantclient-sdk$INSTANTCLIENT_SUFFIX

ARG VERSION=instantclient_21_7

RUN cd /tmp &&\
    wget $ORACLE_URI/$BASIC &&\
    wget $ORACLE_URI/$SDK &&\

    unzip /tmp/$BASIC -d /usr/local/ &&\
    unzip /tmp/$SDK -d /usr/local/

RUN ln -s -f /usr/local/$VERSION/libclntsh.so.12.1 /usr/local/$VERSION/libclntsh.so &&\
    ln -s -f /usr/local/$VERSION/libclntshcore.so.12.1 /usr/local/$VERSION/libclntshcore.so &&\
    ln -s -f /usr/local/$VERSION/libocci.so.12.1 /usr/local/$VERSION/libocci.so &&\
    rm -rf /tmp/*.zip

ENV LD_LIBRARY_PATH=/usr/local/$VERSION