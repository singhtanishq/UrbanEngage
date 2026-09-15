#!/bin/bash

cd "$(dirname "$0")" || exit 1

while true; do
    sleep 5

    if [ -n "$(git status --porcelain)" ]; then
        sleep 5

        if [ -n "$(git status --porcelain)" ]; then
            git add .

            # Get added, modified, and deleted files
            ADDED=$(git diff --cached --name-status | awk '$1 == "A" {print $2}')
            MODIFIED=$(git diff --cached --name-status | awk '$1 == "M" {print $2}')
            DELETED=$(git diff --cached --name-status | awk '$1 == "D" {print $2}')

            ADDED_COUNT=$(echo "$ADDED" | grep -c .)
            MODIFIED_COUNT=$(echo "$MODIFIED" | grep -c .)
            DELETED_COUNT=$(echo "$DELETED" | grep -c .)

            TOTAL=$((ADDED_COUNT + MODIFIED_COUNT + DELETED_COUNT))

            if [ "$TOTAL" -eq 1 ]; then

                if [ "$ADDED_COUNT" -eq 1 ]; then
                    FILENAME=$(basename "$ADDED")
                    COMMIT_MESSAGE="Add $FILENAME"

                elif [ "$MODIFIED_COUNT" -eq 1 ]; then
                    FILENAME=$(basename "$MODIFIED")
                    COMMIT_MESSAGE="Update $FILENAME"

                elif [ "$DELETED_COUNT" -eq 1 ]; then
                    FILENAME=$(basename "$DELETED")
                    COMMIT_MESSAGE="Delete $FILENAME"
                fi

            else
                # Multiple files
                if [ "$ADDED_COUNT" -gt 0 ] && [ "$MODIFIED_COUNT" -eq 0 ] && [ "$DELETED_COUNT" -eq 0 ]; then
                    COMMIT_MESSAGE="Add multiple files"

                elif [ "$MODIFIED_COUNT" -gt 0 ] && [ "$ADDED_COUNT" -eq 0 ] && [ "$DELETED_COUNT" -eq 0 ]; then
                    COMMIT_MESSAGE="Update multiple files"

                elif [ "$DELETED_COUNT" -gt 0 ] && [ "$ADDED_COUNT" -eq 0 ] && [ "$MODIFIED_COUNT" -eq 0 ]; then
                    COMMIT_MESSAGE="Delete multiple files"

                else
                    COMMIT_MESSAGE="Update multiple files"
                fi
            fi

            echo "→ $COMMIT_MESSAGE"

            git commit -m "$COMMIT_MESSAGE"
            git push
        fi
    fi
done

#Start ./auto-push.sh