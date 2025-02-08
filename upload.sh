#!/bin/bash

set -e

# Check if a commit message is passed as an argument
if [ -z "$1" ]; then
  echo "Please provide a commit message."
  exit 1
fi

# Initialize Git repository if not already initialized
if [ ! -d ".git" ]; then
  git init
  echo "Enter your GitHub repository URL (e.g., https://github.com/username/repository.git):"
  read REPO_URL
  git remote add origin "$REPO_URL"
fi

# List of directories and files to remove before uploading
ITEMS_TO_REMOVE=(

)

# Remove specified directories and files from Git's index if they are tracked
for ITEM in "${ITEMS_TO_REMOVE[@]}"; do
  if git ls-files --error-unmatch "$ITEM" > /dev/null 2>&1; then
    git rm -r --cached "$ITEM"
    echo "Removed $ITEM from tracking"
  else
    echo "Skipping $ITEM: Not tracked by Git"
  fi
done

# Add, commit, and push changes
git add .
git commit -m "$1"
git push -u origin main
