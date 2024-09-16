#!/bin/bash

# Login to GitHub CLI
if [ -n "$GITHUB_TOKEN" ]; then
  echo "$GITHUB_TOKEN" | gh auth login --with-token
else
  echo "GITHUB_TOKEN environment variable is not set."
  exit 1
fi

# Start the server
bun run index.ts
