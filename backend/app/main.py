#app/main.py 

# Step 1: Importing necessary libraries

from flask import Flask, request, jsonify #Flask for backend API
import yfinance as yf  #For fetching stock data
import pandas as pd #Data Manipulation
import numpy as np #Numerical operations

#Step 2: Intializing FLask App

app = Flask(__name__)
@app.route('/')
def home():
    return jsonify({"message": "Backend is running"})

if __name__ == '__main__':
    app.run(debug=True)
    
