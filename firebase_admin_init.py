import firebase_admin
from firebase_admin import credentials

# Path to your new Firebase service account key file
cred = credentials.Certificate("c:/Users/lilyt/Downloads/smooth-state-453618-p4-firebase-adminsdk-fbsvc-f7a6ab28ef.json")

# Initialize the app with a service account, granting admin privileges
firebase_admin.initialize_app(cred)