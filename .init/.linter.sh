#!/bin/bash
cd /home/kavia/workspace/code-generation/daily-task-organizer-12110-12119/todo_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

