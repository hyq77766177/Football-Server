FROM node:9-alpine

ENV PROJECT_DIR=/app

WORKDIR $PROJECT_DIR
RUN sed -i 's#http://dl-cdn.alpinelinux.org#https://mirrors.ustc.edu.cn#g' /etc/apk/repositories
# 时区
RUN apk add --no-cache tzdata
ENV TZ Asia/Shanghai

COPY ./package.json .
COPY ./yarn.lock .

#RUN yarn --registry=https://registry.npm.taobao.org
RUN yarn --registry=https://npmreg.proxy.ustclug.org

COPY . .

EXPOSE 80

#ENTRYPOINT ["/docker-entrypoint.sh"]

CMD ["yarn", "start"]
