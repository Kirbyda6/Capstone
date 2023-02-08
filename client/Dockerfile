FROM node
RUN mkdir -p /usr/share/capstone-client
WORKDIR /usr/share/capstone-client
COPY package.json /usr/share/capstone-client
RUN npm install
COPY . /usr/share/capstone-client
CMD [ "node", "index.js" ]