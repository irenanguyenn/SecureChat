# Secure Chat Beta

## Overview 
SecureChatBeta is a modern-version of the Websocket Project. It is a real-time web chat platform with user-friendly design, Firebase integration, and extended functionality. Built for remote teams or individuals needing a lightweight but secure communication tool, SecureChatBeta brings together secure messaging, user authentication, friend management, and responsive UI—all in the browser.

## WebSocket Project Features:
- End-to-End Encrypted Communication via WSS
- User Authentication (Login/Register with bcrypt hashing)
- Rate Limiting to prevent spam
- Supports Multiple Clients in real-time
- Self-Signed SSL Certificates for secure connections
- Timestamp for each message sent

## Secure Chat Beta Features: 
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
## **Prerequisites**  
Before running SecureChat, ensure you have the following:
- A web browser (Chrome/Firefox recommended)
- Access to project Firebase Console
- **Node.js** and **npm** are installed
- **Emoji-picker-element** is installed and in the /public/js folder of the project directory.

### Firebase Configuration

This project uses the following Firebase services:
- **Authentication** for user login/register
- **Realtime Database** for storing:
  - Messages
  - Friend requests
  - User profiles
- **HeartBeart** functionality
  
All Firebase credentials are already embedded in the `auth.js` and `script.js` files.

### Step 1: Clone the Repository
Clone the repository to your local machine:
```bash
git clone https://github.com/irenanguyenn/SecureChatBeta-main
```

### Step 2: Install Dependencies
Navigate to the project directory and install the required dependencies:
```bash
cd SecureChatBeta-main
npm install
```

### Step 3: Start the Development Server
Open a terminal with the directory leading to the project public folder and run:
```bash
firebase serve --host 0.0.0.0
```
Also can try
```
npm install -g http-server
http-server local
```

### Step 4: Access the Application
Open your web browser and navigate to `http://[yourIPaddress]:5000` to access the SecureChat application.
 - To find the public IP address, run:
``` ipconfig ```

#### **IMPORTANT:**  
- Using different devices to communicate, they must be on the same internet connection, meaning same public IP address. 
- **CSUF Wi-Fi is NOT recommended** due to dynamic public IP assignment, which causes connection failures.  

Now, your system should be up and running. 

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

## Common Problems & Potential Fixes
1. Server not starting
* Ensure all packages are downloaded

## Future Improvements
* Fully available via cloud
* More options for users such as
      - More navigation options: Settings, Change Password, Dashboard, Inbox.
* Better Rate Limiting Mechanism.
* Implement higher security measures.
* Allow users to have an inbox of messages while they are away.


## Authors
Developed by Lillian Thacker and Irena Nguyen as part of a Web Security Project.

AI tools were used to help understand concepts and format documentation.


### License
This project is for educational purposes only.
