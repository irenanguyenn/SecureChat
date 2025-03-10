import firebase_admin
from firebase_admin import credentials, db

# Path to your Firebase service account key file
cred = credentials.Certificate("C:/Users/lilyt/OneDrive/Desktop/SecureChatBeta-main/chat-9d342-firebase-adminsdk-fbsvc-57ba00ac8c.json")

# Initialize the app with a service account, granting admin privileges
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://chat-9d342-default-rtdb.firebaseio.com'
})