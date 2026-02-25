#!/bin/bash
# Prepare the serve directory with basePath structure
cd "$(dirname "$0")"
rm -rf .serve-root
mkdir -p .serve-root/dira-fair
cp -R out/* .serve-root/dira-fair/
exec npx serve .serve-root -l 3000 --no-clipboard
