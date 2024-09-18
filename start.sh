#!/bin/bash

# Git & GitHub setup
if [ -n "$GH_PAT" -a -n "$SSH_KEY" -a -n "$KNOWN_HOSTS" ]; then
  SSH_DIR="/etc/ssh"
  mkdir -p "$SSH_DIR"
  export GIT_SSH_COMMAND='ssh -Tv'
  echo "$SSH_KEY" > "$SSH_DIR/id_rsa"
  echo "$KNOWN_HOSTS" > "$SSH_DIR/known_hosts"
  echo "Host *" >> "$SSH_DIR/ssh_config" && echo "    StrictHostKeyChecking no" >> "$SSH_DIR/ssh_config"
  cat "$SSH_DIR/ssh_config"
  chmod 700 "$SSH_DIR"
  chmod 600 "$SSH_DIR/id_rsa"
  chmod 644 "$SSH_DIR/known_hosts"

  # Start the ssh-agent and add the private key
  eval "$(ssh-agent -s)"
  ssh-add "$SSH_DIR/id_rsa"

  echo "Printing tty..."
  ls -la /dev/tty
  echo "Testing SSH connection to GitHub..."
  ssh -Tv git@github.com

  echo "$GH_PAT" | gh auth login --with-token
  gh auth status
  git config --global user.name "Autogit"
  git config --global user.email "service@systemphil.com"
  GIT_SSH_COMMAND='ssh -v' git clone git@github.com:systemphil/sphil.git
else
  echo "Environment variables are not set."
  exit 1
fi

# Start the server
bun run index.ts
