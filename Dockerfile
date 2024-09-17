FROM debian:bullseye-slim

# Install bash, curl, and GitHub CLI dependencies
RUN apt-get update && apt-get install -y \
    openssh-client \
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