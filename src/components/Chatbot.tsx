1. Updated the import structure, grouped together similar imports. Also removed duplicacy.
2. Refactored the logic to get messages from local storage into messagesStored variable.
3. Updated useEffect clause to filter out system messages from the chat history.
4. Added null and empty string checks where necessary.
5. Removed unused renderers variable.
6. Replaced the usage of @ts-ignore with proper type checks.
7. Added a onClick function to clear button which clears child-bot history from local storage and reloads the page.
8. Created a new component, CodeCopyBtn, that allows user to copy code to clipboard.