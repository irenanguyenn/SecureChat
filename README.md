# Secure Chat Beta

## Overview 
SecureChatBeta is a modern-version of the Websocket Project. It is a real-time web chat platform with user-friendly design, Firebase integration, and extended functionality. Built for remote teams or individuals needing a lightweight but secure communication tool, SecureChatBeta brings together secure messaging, user authentication, friend management, and responsive UI—all in the browser.

## WebSocket Project Features (Old):
- End-to-End Encrypted Communication via WSS
- User Authentication (Login/Register with bcrypt hashing)
- Rate Limiting to prevent spam
- Supports Multiple Clients in real-time
- Self-Signed SSL Certificates for secure connections
- Timestamp for each message sent

## Secure Chat Beta Features (New): 
- **User Authentication** (Login/Register with Firebase Auth)
- **Friend System**
  - Send friend requests
  - Chat only with accepted friends
- **Real-Time Messaging**
  - Messages are displayed instantly with timestamped entries
  - Emoji picker & file attach UI
- **Modern UI**
  - Responsive and elegant interface
  - Mobile and desktop support
- **Cloud-Powered**
  - Firebase Realtime Database backend
  - Persistent chat history
- **Logout Functionality**
  - Clean session exit and redirection

---

## Hosted Application
- [smooth-state-453618-p4.web.app](https://smooth-state-453618-p4.web.app)
- [smooth-state-453618-p4.firebaseapp.com](https://smooth-state-453618-p4.firebaseapp.com)

---

## Security Implementation
SecureChatBeta has been designed with a strong emphasis on web security. Below are the core protections in place:

### Input Validation & Sanitization
- **`sanitizeInput()` / `escapeHTML()`**: Neutralize any potentially harmful characters before rendering or storing user input.
- **`containsDangerousTags()`**: Prevents input of dangerous HTML or JavaScript code.
- **`isValidUsername()` / `isValidEmail()` / `isStrongPassword()`**: Enforce strong rules for username, email, and password formats.

### DOM-Based XSS Protection
- Only sanitized content is inserted into the DOM.
- Messages are HTML-encoded before being stored in Firebase, and decoded before rendering on the client.
- Strict regex patterns ensure only safe, formatted anchor tags are rendered.

### Link Security
- **`isValidURL()`**: Ensures only `http`/`https` URLs are processed.
- **`isWhitelistedDomain()`**: Allows links only to trusted domains.
- **`isBlacklistedDomain()`**: Blocks known malicious or unsafe domains.
- **`linkify()`**: Converts safe plain URLs into clickable links with:
  - `target="_blank"`
  - `rel="noopener noreferrer"` to prevent tabnabbing

### Safe Data Storage
- User messages are HTML-encoded before saving to Firebase.
- Decoded and verified before rendering.

### Additional Measures
- Modified firebase.json to include: 
  - Content Security Policy (CSP) to restrict what can be uploaded and where. 
  - Clickjacking prevention via X-Frame-Options: DENY
  - MIME Sniffing preventing via X-Content-Type-Options
- File upload validation by type and size
- Emoji picker input sanitation
- Rate-limiting to prevent spam messaging
- Authentication and database access governed by strict Firebase security rules

---

## Using SecureChat

1. Login or Register
   * User will register account.
      * Errors will occur if:
          * Email already exists.
          * Username already exists.
          * Password is shorter than 8 letters.
          * Password does not match.
   * Users will login.
          * After 3 attempts of wrong credentials, users are timed out and blocked by Firebase for 10 seconds. 
     
2. Adding friends
    * Once logged in you have an option to add friends.
       * If user does not exist, error return:
 ``` User does not exist. ```
      
4. Accessing Private Chat
   * Once users are added, they will appear under the friend's list in which they can click on a username and open a private chat with their friend. 

6. Sending Messages
   * Type your message and press `Enter` to send
     * Includes:
          * bold, italicize, or normal text.
          * emojis
          * files uploads (images, .pdf, or .txt) 

7. Rate Limiting
   * When a user sends messages too fast, they are timed out for 20 seconds before they chat again.
  
8. Disconnect
   * Logout.
   * Close tab.

## Future Improvements
* Fully available via cloud
* More options for users such as
      - More navigation options: Settings, Change Password, Dashboard, Inbox.
* Better Rate Limiting Mechanism.
* Implement higher security measures.

## Authors
Developed by Lillian Thacker and Irena Nguyen as part of a Web Security Project.

## References
- AI tools were used to help understand concepts and format documentation.
- Zscaler. (2023). *A Look at the Top Websites Blocked by Zscaler*. Retrieved from https://www.zscaler.com/blogs/security-research/look-top-websites-blocked

### License
This project is for educational purposes only.