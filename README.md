# Secure Chat

## Overview 
The project's goal is to create a real-time communication tool aimed for remote teams that require secure efficient communication without relying on slack or teams. Users can login or register to begin instantly messaging other users. It supports user authentication with bycrypt-hashed passwords.

## Features
- End-to-End Encrypted Communication via WSS
- User Authentication (Login/Register with bcrypt hashing)
- Rate Limiting to prevent spam
- Supports Multiple Clients in real-time
- Self-Signed SSL Certificates for secure connections
- Timestamp for each message sent

---
## **Prerequisites**  
Before running SecureChat, ensure the following:  
- **Python 3** is installed on all devices.
- The required files are in the same directory:  
  - `serv.py` (server script)  
  - `cli-one.py` and `cli-two.py` (client scripts)  
  - `cert.pem` and `key.pem` (SSL certificate and key)  
  - `db.txt` (user credentials database)  
- All devices are connected to the **same network**.  
- The **same public IP address** is used for communication between different devices.

#### ** IMPORTANT: **  
- Using different devices to communicate, they must be on the same internet connection.  
- The **server's public IP** must be manually set inside `cli-one.py` and `cli-two.py` before running.  
- **CSUF Wi-Fi is NOT recommended** due to dynamic public IP assignment, which causes connection failures.  

  
## **How To Run SecureChat**

### **Step 1: Ensure you have python3 installed.**

```
git clone https://github.com/irenanguyenn/WebSocket-Project
```
or

```
wget https://github.com/irenanguyenn/WebSocket-Project
```

### **Step 2: Find the Server's Public IP Address**
On the **server device** (the device running `serv.py`), open a terminal and run:

```bash
ifconfig
```

### **Step 3: Update the Client Files IP Address**
Open 'cli-one.py' and 'cli-two.py' and fill the blank space in line 5 with your public IP address:
```
SERVER_URI = "wss://____:8765"
```
Save and close. 

### **Step 4: Start serv.py**
Run command in Linux: 
```
python3 serv.py
```
On Windows: 
```
python serv.py
```

### **Step 5: Start cli-one.py on one device**
Run command in Linux: 
```
python3 cli-one.py
```
On Windows: 
```
python cli-one.py
```

### **Step 6: Start cli-two.py on another device**
Run command in Linux: 
```
python3 cli-two.py
```
On Windows: 
```
python cli-two.py
```
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
   * If registration is successful, restart the client and login.

2. Sending Messages
   * Type your message and press `Enter` to send.

4. Rate Limiting
   * A user can send a message every 2 seconds. Exceeding that limit would result in this message:
     ```
     Rate limit exceeded! Messages after will not appear for other client. Resend message after 2 seconds.
     ```
5. Disconnect
   * Close the terminal. 

## Common Problems & Potential Fixes
1. Server not starting
   * Ensure the SSL certificate (`cert.pem` and `key.pem`) exists

2. Clients Not connecting
   * Check if the server is running properly (`python3 serv.py`)
   * Ensure you're using the correct WebSocket protocol


## Future Improvements
* Graphical UI using a web-based or desktop interface.
* Database Integration such as SQLite instead of db.txt.
* More options for users such as
      - More navigation options: Settings, Change Password, Dashboard, Inbox.
* Better Rate Limiting Mechanism.
* Implement higher security measures.
* Allow users to have an inbox of messages while they are away.
* Hide the password when the user is first logging in or creating an account.


## Authors
Developed by Lillian Thacker and Irena Nguyen as part of a Web Security Project.

AI tools were used to help understand concepts and format documentation.


### License
This project is for educational purposes only.
