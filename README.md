# AIVA

+-----------------------+
| 1. User visits site   |
+-----------------------+
           |
           v
+-----------------------+
| 2. Signs in with      |
| Firebase (Google/Auth)|
+-----------------------+
           |
           v
+-----------------------+
| 3. Receives Firebase  |
| ID token              |
+-----------------------+
           |
           v
+-----------------------+
| 4. Opens Chat UI      |
+-----------------------+
           |
           v
+-----------------------+
| 5. User sends message |
| (e.g., "Schedule...") |
+-----------------------+
           |
           v
+-----------------------------+
| 6. Main n8n Chat Webhook    |
| Receives message + token   |
+-----------------------------+
           |
           v
+-----------------------------+
| 7. Verify Firebase Token    |
| in n8n                      |
+-----------------------------+
           |
           v
+-----------------------------+
| 8. AI Intent Routing        |
| (via OpenAI or keywords)    |
+-----------------------------+
           |
           v
+------------------------------+
| 9. Forward to correct        |
| sub-workflow:               |
| - Calendar                  |
| - Sheet Analysis            |
| - MongoDB Storage           |
+------------------------------+
           |
           v
+-------------------------------+
| 10. Sub-workflow executes:    |
| - Use Google Calendar API     |
| - Analyze Google Sheet        |
| - Save/Fetch MongoDB data     |
+-------------------------------+
           |
           v
+----------------------------+
| 11. Return final reply     |
| to chatbot interface       |
+----------------------------+
