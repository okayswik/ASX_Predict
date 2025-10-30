import yfinance as yf
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
import numpy as np

def predict_stock(ticker):
    # 1️⃣ Fetch historical data (3 months)
    data = yf.download(ticker, period="3mo", interval="1d")
    if data.empty:
        return {"error": "No data available"}

    # 2️⃣ Keep only the 'Close' column
    df = data[['Close']].copy()
    df['Return'] = df['Close'].pct_change()  # percentage change
    df['MA_3'] = df['Close'].rolling(window=3).mean()
    df['MA_5'] = df['Close'].rolling(window=5).mean()

    # Remove NaN rows
    df = df.dropna()

    # 3️⃣ Create lag features
    df['Lag_1'] = df['Close'].shift(1)
    df['Lag_2'] = df['Close'].shift(2)
    df = df.dropna()

    # 4️⃣ Define features (X) and target (y)
    X = df[['Lag_1', 'Lag_2', 'MA_3', 'MA_5', 'Return']]
    y = df['Close']

    # 5️⃣ Train-test split (time-based)
    split = int(len(df) * 0.8)
    X_train, X_test = X[:split], X[split:]
    y_train, y_test = y[:split], y[split:]

    # 6️⃣ Train the Linear Regression model
    model = LinearRegression()
    model.fit(X_train, y_train)

    # 7️⃣ Predict
    y_pred = model.predict(X_test)

    # 8️⃣ Evaluate performance
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    # 9️⃣ Predict the next day's price
    last_row = X.iloc[-1:].values
    next_day_pred = model.predict(last_row)[0]

    result = {
        "ticker": ticker,
        "next_day_prediction": float(next_day_pred),
        "mse": mse,
        "r2": r2,
        "last_close": float(df['Close'].iloc[-1])
    }

    return result

