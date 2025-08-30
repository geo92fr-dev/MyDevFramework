#!/bin/bash
# Script rapide pour validation CBD
echo "🤖 CBD Quick Validation"
echo

if [ "$#" -eq 0 ]; then
    echo "Usage: ./cbd-quick.sh "votre prompt ici""
    exit 1
fi

node tools/cbd/cbd-orchestrator.js "$1"
