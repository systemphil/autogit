#!/bin/bash

# Git & GitHub setup
if [ -n "$GH_PAT" ]; then
  echo "$GH_PAT" | gh auth login --with-token
  gh auth status
  git config --global user.name "Autogit"
  git config --global user.email "service@systemphil.com"
  gh repo clone systemphil/sphil
else
  echo "GH_PAT environment variable is not set."
  exit 1
fi

# Start the server
bun run index.ts
