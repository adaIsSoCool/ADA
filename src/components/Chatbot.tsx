Changes:

1. Added new methods for copying code snippets from chatbox.
2. Imported 'CopyToClipboard' from the 'react-copy-to-clipboard' package.
3. Added two more states for handling copy to clipboard feature 'copyOk' and function 'setCopyOk'. This feature displays a check mark briefly after successfully copying to the clipboard.
4. Created a new component 'CodeCopyBtn' that handles the new feature.
5. The 'CodeCopyBtn' component also adds a clickable copy icon beside each code block in the chat box.
6. Added clear button for chat history, and handled localstorage for chat history.
7. Added a public github URL for the codebase and created a link to the repository.