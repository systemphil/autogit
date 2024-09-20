#!/bin/bash

# Git & GitHub setup
if [ -n "$GH_PAT" -a -n "$SSH_KEY" -a -n "$KNOWN_HOSTS" ]; then
  # Uncomment to debug SSH
  # export GIT_SSH_COMMAND='ssh -Tv'
  
  SSH_DIR="/etc/ssh"
  mkdir -p "$SSH_DIR"
  echo "$SSH_KEY" > "$SSH_DIR/id_rsa"
  echo "$KNOWN_HOSTS" > "$SSH_DIR/known_hosts"
  echo "Host *" >> "$SSH_DIR/ssh_config" && echo "    StrictHostKeyChecking no" >> "$SSH_DIR/ssh_config"
  chmod 700 "$SSH_DIR"
  chmod 600 "$SSH_DIR/id_rsa"
  chmod 644 "$SSH_DIR/known_hosts"

  # Start the ssh-agent and add the private key
  eval "$(ssh-agent -s)"
  ssh-add "$SSH_DIR/id_rsa"

  # gh config set git_protocol ssh --host github.com
  # echo "$GH_PAT" | gh auth login --with-token
  # gh auth status
  
  git config --global user.name "autogit"
  git config --global user.email "service@systemphil.com"

  # Uncomment to debug
  # echo "GIT CONFIG: "
  # git config --list
  # echo "GH CONFIG: "
  # gh config get git_protocol
else
  echo "Environment variables are not set."
  exit 1
fi

# Start the server
bun run index.ts
