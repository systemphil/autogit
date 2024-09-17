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


# =========== BUN IMAGE
# FROM oven/bun:debian AS base
# WORKDIR /app

# RUN (type -p wget >/dev/null || (sudo apt update && sudo apt-get install wget -y)) \
# 	&& sudo mkdir -p -m 755 /etc/apt/keyrings \
# 	&& wget -qO- https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
# 	&& sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
# 	&& echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
# 	&& sudo apt update \
# 	&& sudo apt install gh -y

# COPY . .

# ENV NODE_ENV=production

# RUN bun install
# EXPOSE 8080

# # Make the script executable
# RUN chmod +x start.sh

# # Command to run the application
# CMD ["start.sh"]




# ======== gh cli image

# FROM maniator/gh:latest

# RUN apk add --no-cache bash curl
# RUN curl -Lo /etc/apk/keys/sgerrand.rsa.pub https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub && \
#     curl -Lo glibc.apk https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.35-r0/glibc-2.35-r0.apk && \
#     apk add glibc.apk && \
#     rm glibc.apk
# RUN curl -fsSL https://bun.sh/install | bash 
# ENV PATH="/root/.bun/bin:$PATH"

# RUN bun add -g prettier

# # Set working directory
# WORKDIR /app

# # Copy package.json and install dependencies
# COPY package.json bun.lockb ./
# RUN bun install

# # Copy the rest of the application code
# COPY . .

# # Expose the necessary port
# EXPOSE 8080

# # Copy the startup script
# COPY start.sh start.sh

# # Make the script executable
# RUN chmod +x start.sh

# # Command to run the application
# CMD ["start.sh"]



# ========== UBUNTU IMAGE 
# FROM ubuntu:latest

# # Install dependencies
# RUN apt update && apt install -y \
#     curl \
#     git \
#     unzip \
#     wget \
#     build-essential \
#     --no-install-recommends \
#     && rm -rf /var/lib/apt/lists/*

# # Install Bun
# RUN curl -fsSL https://bun.sh/install | bash 

# # Add Bun to the PATH
# ENV BUN_INSTALL="/root/.bun"
# ENV PATH="$BUN_INSTALL/bin:$PATH"

# # Install GitHub CLI
# RUN apt update && apt install -y \
#   curl \
#   gpg
# RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | gpg --dearmor -o /usr/share/keyrings/githubcli-archive-keyring.gpg;
# RUN echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null;
# RUN apt update && apt install -y gh;

# # Install Prettier globally
# RUN bun add -g prettier

# # Set working directory
# WORKDIR /app

# # Copy package.json and install dependencies
# COPY package.json bun.lockb ./
# RUN bun install

# # Copy the rest of the application code
# COPY . .

# # Expose the necessary port
# EXPOSE 8080

# # Copy the startup script
# COPY start.sh start.sh

# # Make the script executable
# RUN chmod +x start.sh

# # Command to run the application
# CMD ["start.sh"]



# ========= DEBIAN IMAGE
# Use a Debian-based image
FROM debian:bullseye-slim

# Install bash, curl, and GitHub CLI dependencies
RUN apt-get update && apt-get install -y \
    bash \
    curl \
    unzip \
    git \
    sudo \
    && apt-get clean

# Install GitHub CLI
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null && \
    apt-get update && apt-get install -y gh && \
    apt-get clean

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash

# Add Bun to the system PATH
ENV PATH="/root/.bun/bin:$PATH"

# Verify installations
RUN gh --version && bun --version

# Set working directory
WORKDIR /app

# Expose port (if necessary)
EXPOSE 8080

# Copy the startup script (if you have one)
COPY . .
COPY start.sh start.sh

# Install dependencies
RUN bun install

# Make the script executable
RUN chmod +x start.sh

# Command to run the application
CMD ["./start.sh"]