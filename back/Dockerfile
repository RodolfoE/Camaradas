FROM node:20.11.0

COPY ./package.json ./

RUN npm install
RUN npm install -g nodemon

COPY . .

EXPOSE 3001

ENTRYPOINT [ "npm", "run", "dev" ]