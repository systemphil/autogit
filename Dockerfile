# FROM rust:1-slim-buster AS build
# WORKDIR /app
# COPY src /app/src
# COPY Cargo.toml /app/
# COPY Cargo.lock /app/
# RUN cargo build --release

# FROM debian:buster-slim
# COPY --from=build /app/target/release/autogit /app/autogit
# RUN chmod +x /app/autogit
# EXPOSE 8080
# CMD "/app/autogit"

# FROM oven/bun AS base
# WORKDIR /app

# COPY . .

# ENV NODE_ENV=production

# RUN bun install
# EXPOSE 8080
# CMD ["bun", "run", "index.ts"]


# Use a lightweight Ubuntu image
FROM debian:bookworm-slim

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    unzip \
    build-essential \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash

# Add Bun to the PATH
ENV BUN_INSTALL="/root/.bun"
ENV PATH="$BUN_INSTALL/bin:$PATH"

# Install GitHub CLI
RUN (type -p wget >/dev/null || (sudo apt update && sudo apt-get install wget -y)) \
	&& sudo mkdir -p -m 755 /etc/apt/keyrings \
	&& wget -qO- https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
	&& sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
	&& echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
	&& sudo apt update \
	&& sudo apt install gh -y

# Install Prettier globally
RUN bun add -g prettier

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json bun.lockb ./
RUN bun install

# Copy the rest of the application code
COPY . .

# Expose the necessary port
EXPOSE 8080

# Copy the startup script
COPY start.sh start.sh

# Make the script executable
RUN chmod +x start.sh

# Command to run the application
CMD ["start.sh"]