# Build stage
FROM node:20-bullseye AS builder

WORKDIR /app

ENV NODE_OPTIONS=--max_old_space_size=4096

COPY package*.json ./

RUN npm ci --prefer-offline --no-audit

COPY . .

RUN npm run build

COPY start.sh ./start.sh
COPY migrate.sh ./migrate.sh
RUN chmod +x ./start.sh ./migrate.sh

# Install bash
RUN apt-get update && apt-get install -y bash && rm -rf /var/lib/apt/lists/*

EXPOSE 8000

# Use bash to run the script
CMD ["bash", "./start.sh"]
