#!/bin/bash

# Login to GitHub CLI
if [ -n "$GH_PAT" ]; then
  echo "$GH_PAT" | gh auth login --with-token
else
  echo "GH_PAT environment variable is not set."
  exit 1
fi

# Start the server
bun run index.ts
