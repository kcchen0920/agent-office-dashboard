# Codebase Optimization & Token Saving Skill

This skill guides you on how to work efficiently and minimize token usage in the `agent-office-dashboard` workspace.

## Guidelines for the Agent

### 1. Unified Context Retrieval via Repomix
- **DO NOT** run recursive search commands (`grep_search`, `Get-ChildItem -Recurse`, etc.) or list/view multiple individual source files unless explicitly requested by the user.
- **Check for `repomix-output.xml`**:
  - The project files are pre-packaged in [repomix-output.xml](file:///C:/Users/kc.chen/agent-office-dashboard/repomix-output.xml).
  - Use `view_file` to read the XML file. This loads the entire repository structure and codebase in a single action, drastically saving tokens and time.

### 2. Frontend Rendering Guidelines (`app.js`)
- Any updates to the UI, dashboard stats, or graph visualization must be **batched** to avoid browser freeze and layout thrashing.
- Always use `queueUIUpdate()` or `requestAnimationFrame()` to bundle multiple statistics or visualization updates within the same paint frame:
  ```javascript
  // Batch UI updates
  queueUIUpdate();
  ```
- Always throttle the Kanban board rendering:
  ```javascript
  // Throttle Kanban rendering
  renderKanban();
  ```

### 3. Backend Stream Filtering (`server.js`)
- Keep Server-Sent Events (SSE) `/stream` payload as small as possible.
- When sending transcript lines to the frontend:
  - If `strategy === 'window'`: Only send the last 5 steps on initial load.
  - If `strategy === 'prune'`: Aggressively prune tool output (`step.content`) for verbose tool types to 150 characters.
  - If `strategy === 'summarize'`: Prune tool outputs to 80 characters, and older user/planner inputs to 120 characters to simulate summarization.

### 4. Database Querying via SQLite MCP
- Since the SQLite MCP server is globally configured, do not read full database files or raw CSV datasets into context.
- Use the `sqlite` MCP tool directly to query the database using SQL SELECT statements, pulling only the relevant rows into your context.
