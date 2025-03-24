# Secure Chat

## Overview 
The project's goal is to create a real-time communication tool aimed for remote teams that require secure efficient communication without relying on slack or teams. Users can login or register, add friends and begin instantly messaging other users.
## Features
- End-to-End Encrypted Communication via WSS
- User Authentication (Login/Register with bcrypt hashing)
- Rate Limiting to prevent spam
- Supports Multiple Clients in real-time
- Self-Signed SSL Certificates for secure connections
- Timestamp for each message sent
- Graphical User Interface (GUI) implemented
- Communication between multiple users
- Emojis and file sharing are available
- Friend requests
- Session logout
- Hide the password when the user is first logging in or creating an account.


 
---
## **Prerequisites**  
Before running SecureChat, ensure you have the following:
- **Node.js** and **npm** are installed

### Step 1: Clone the Repository
Clone the repository to your local machine:
```bash
git clone https://github.com/irenanguyenn/WebSocket-Project
```

### Step 2: Install Dependencies
Navigate to the project directory and install the required dependencies:
```bash
cd SecureChatBeta-branch320
npm install
```

### Step 3: Start the Development Server
Start the development server to run the application:
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


#### **IMPORTANT:**  
- Using different devices to communicate, they must be on the same internet connection.  
- The **server's public IP** must be manually set inside `cli-one.py` and `cli-two.py` before running.  
- **CSUF Wi-Fi is NOT recommended** due to dynamic public IP assignment, which causes connection failures.  


Now, your system should be up and running. 

## Using SecureChat

1. Login or Register
   * When client starts, users are prompted with:
     ```
     Type `login` to sign in or `register` to create an account.
     ```
   * User will then type `register` and is prompted
     ```
     Enter your `username` and `password`
     ```
2. Adding friends
    * Once logged in you have an option to add friends in the upper left hand corner.

3. Sending Messages
   * Type your message and press `Enter` to send.

4. Rate Limiting
   * A user can send a message every 2 seconds.
  
5. Disconnect
   * Logout. 

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
