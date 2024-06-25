#!/bin/bash

# Prompt for inputs
read -p "Enter the root directory name (default: jama): " ROOT_DIR
ROOT_DIR=${ROOT_DIR:-jama}

read -p "Enter the source directory path (default: webApp): " SOURCE_DIR_NAME
SOURCE_DIR_NAME=${SOURCE_DIR_NAME:-webApp}

read -p "Enter the destination directory path (default: _build/html/webApp): " DEST_DIR_NAME
DEST_DIR_NAME=${DEST_DIR_NAME:-_build/html/webApp}

# Construct full paths
FULL_SOURCE_DIR="${ROOT_DIR}/${SOURCE_DIR_NAME}"
FULL_DEST_DIR="${ROOT_DIR}/${DEST_DIR_NAME}"

# Confirm the inputs
echo "Root directory: $ROOT_DIR"
echo "Source directory: $FULL_SOURCE_DIR"
echo "Destination directory: $FULL_DEST_DIR"
read -p "Are these correct? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
    echo "Operation cancelled."
    exit 1
fi

# Copy the webApp folder to the destination directory
rm -rf "$FULL_DEST_DIR"
mv "$FULL_SOURCE_DIR/" "$FULL_DEST_DIR/"

echo "webApp folder moved to $DEST_DIR_NAME"