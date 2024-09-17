#!/bin/bash

# Git & GitHub setup
if [ -n "$GH_PAT" -a -n "$SSH_KEY" ]; then
  mkdir -p ~/.ssh
  # Add the private key from the environment variable
  echo "$SSH_KEY" > ~/.ssh/id_rsa
  chmod 600 ~/.ssh/id_rsa

  # Start the ssh-agent and add the private key
  eval "$(ssh-agent -s)"
  ssh-add ~/.ssh/id_rsa

  echo "$GH_PAT" | gh auth login --with-token
  gh auth status
  git config --global user.name "Autogit"
  git config --global user.email "service@systemphil.com"
  git clone git@github.com:systemphil/sphil.git
else
  echo "GH_PAT or SSH_KEY environment variable is not set."
  exit 1
fi

# Start the server
bun run index.ts
