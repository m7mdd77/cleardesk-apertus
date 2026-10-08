FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json ./
COPY src ./src
COPY data ./data
RUN npm test
ENTRYPOINT ["node", "src/assistant.mjs"]
CMD ["My work laptop is missing. What should I do?"]
