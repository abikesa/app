#!/bin/bash

# Prompt for inputs with defaults
read -p "Enter the root directory name (default: jama): " ROOT_DIR
ROOT_DIR=${ROOT_DIR:-jama}

read -p "Enter the source directory path (relative to root, default: _build/html/webApp): " SOURCE_DIR
SOURCE_DIR=${SOURCE_DIR:-_build/html/webApp}

read -p "Enter the destination directory path (relative to root, default: webApp): " DEST_DIR
DEST_DIR=${DEST_DIR:-webApp}

# Construct full paths
FULL_SOURCE_DIR="${ROOT_DIR}/${SOURCE_DIR}"
FULL_DEST_DIR="${ROOT_DIR}/${DEST_DIR}"

# Confirm the inputs
echo "Root directory: $ROOT_DIR"
echo "Source directory: $FULL_SOURCE_DIR"
echo "Destination directory: $FULL_DEST_DIR"
read -p "Are these correct? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
    echo "Operation cancelled."
    exit 1
fi

# Remove the old destination directory if it exists
rm -rf "$FULL_DEST_DIR"

# Copy the webApp folder to the destination directory
mv "$FULL_SOURCE_DIR" "$FULL_DEST_DIR"

# Remove the _build directory
rm -rf "${ROOT_DIR}/_build"

# Remove README.html from the destination directory
rm "$FULL_DEST_DIR/README.html"

echo "webApp folder moved to $DEST_DIR"