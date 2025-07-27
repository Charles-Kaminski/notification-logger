#!/usr/bin/env bash
# make-zip.sh
# Creates a clean ZIP package for extensions.gnome.org (EGO)

EXTENSION_UUID="notification-logger@charles-kaminski.github.io"
EXTENSION_DIR="$HOME/.local/share/gnome-shell/extensions/$EXTENSION_UUID"
OUTPUT_ZIP="$EXTENSION_DIR/${EXTENSION_UUID}.zip"

# List of required files
REQUIRED_FILES=(
    "metadata.json"
    "extension.js"
    "prefs.js"
    "LICENSE.txt"
    "schemas/org.gnome.shell.extensions.notification-logger.gschema.xml"
)

echo "=== Preparing Clean ZIP for EGO ==="

# Navigate to the extension directory
cd "$EXTENSION_DIR" || { echo "Extension directory not found: $EXTENSION_DIR"; exit 1; }

# Check for required files
MISSING=0
for FILE in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$FILE" ]; then
        echo "ERROR: Required file not found: $FILE"
        MISSING=1
    fi
done

if [ $MISSING -ne 0 ]; then
    echo "Aborting ZIP creation due to missing files."
    exit 1
fi

# Remove any old ZIP
rm -f "$OUTPUT_ZIP"

# Create the ZIP file with only essential files
zip -r "$OUTPUT_ZIP" \
    metadata.json \
    extension.js \
    prefs.js \
    LICENSE.txt \
    schemas/org.gnome.shell.extensions.notification-logger.gschema.xml

echo "=== ZIP Creation Complete ==="
echo "Result: $OUTPUT_ZIP"
