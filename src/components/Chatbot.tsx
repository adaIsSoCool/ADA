## Changes Made

1. Refactored & consolidated renderers code to facilitate code reuse.
2. Introduced new functionality to have a copy button in `pre` tag for better UX.
3. Improved TypeScript typings to give better intellisense.
4. Changed the color of the copy button on click to indicate successful copy event.
5. Added error handling mechanism to give user a feedback on possible mistakes made during the use of application.

## Files Updated
- Updated `src/components/Chatbot.tsx` file; modified the renderer function of the `react-markdown` package to customize the appearance of markdown-rendered code, introduced a copy code option and managed state to deal with copy code action.

## Functionality Added
1. Added a copy button with each `pre` tag.
2. Cross-browser support for clipboard writing.
3. Feedback on copy button on successful copy event to improve UX.
4. Button to clear chat history.
