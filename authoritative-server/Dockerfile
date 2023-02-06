FROM node
RUN mkdir -p /usr/share/capstone-server
WORKDIR /usr/share/capstone-server
COPY package.json /usr/share/capstone-server
RUN npm install
COPY . /usr/share/capstone-server
CMD [ "node", "server.js" ]