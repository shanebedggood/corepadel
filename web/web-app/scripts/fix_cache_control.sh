#!/bin/bash

# === CONFIGURE YOUR BUCKET NAME ===
BUCKET_NAME="padel-3b62e.firebasestorage.app"  # No "gs://" prefix here

# === TARGET FOLDER ===
TARGET_FOLDER="images"

# === DESIRED CACHE HEADER ===
CACHE_CONTROL="public,max-age=31536000"

echo "Fixing metadata for files in gs://${BUCKET_NAME}/${TARGET_FOLDER}/desktop"

# List all objects recursively under the images folder
gsutil ls -r "gs://${BUCKET_NAME}/${TARGET_FOLDER}/desktop" | while read -r FILE; do
  # Skip directories
  if [[ "$FILE" == */ ]]; then
    continue
  fi

  echo "Processing: $FILE"

  # Remove Firebase download token
  gsutil setmeta -h "x-goog-meta-firebaseStorageDownloadTokens:" "$FILE"

  # Set the correct cache control header
  gsutil setmeta -h "Cache-Control:${CACHE_CONTROL}" "$FILE"

done

echo "✅ Done updating metadata for all files under /images/desktop"
