FROM node:8.12.0

ENV LANG en_US.utf8
ENV NODE_VERSION 8.12.0
ENV TZ=Asia/Taipei

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# add credentials on build
RUN mkdir /root/.ssh/
COPY tools/privateRepoKey /root/.ssh/
RUN mv /root/.ssh/privateRepoKey /root/.ssh/id_rsa
RUN chmod 600 /root/.ssh/id_rsa

# build node application
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY src /usr/src/app/src
COPY test /usr/src/app/test
COPY package.json /usr/src/app/
COPY src /usr/src/app/src
COPY package.json /usr/src/app/

RUN npm 1337
EXPOSE 3100
CMD ["npm", "start"]