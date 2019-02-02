FROM mariadb
ENV LANG=C.UTF-8
ENV TZ=Asia/Taipei
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
COPY script /docker-entrypoint-initdb.d/
EXPOSE 3306