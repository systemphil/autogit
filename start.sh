#!/bin/bash

# Git & GitHub setup
if [ -n "$GH_PAT" -a -n "$SSH_KEY" ]; then
  echo "$GH_PAT" | gh auth login --with-token
  gh auth status
  git config --global user.name "Autogit"
  git config --global user.email "service@systemphil.com"
  git config --global credential.helper store
  gh repo clone systemphil/sphil
  ( cd sphil ; git remote set-url origin https://$GH_PAT@github.com/systemphil/sphil.git )
else
  echo "GH_PAT or SSH_KEY environment variable is not set."
  exit 1
fi

# Start the server
bun run index.ts
