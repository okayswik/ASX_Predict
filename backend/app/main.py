from flask import Flask, jsonify
import yfinance as yf
from model import predict_stock

app = Flask(__name__)

# ✅ Homepage route
@app.route("/")
def home():
    return jsonify({
        "message": "✅ Welcome to ASX Predict API",
        "routes": {
            "Get Stock Data": "/stock/<ticker>",
            "Predict Stock": "/predict/<ticker>"
        }
    })

# ✅ Prediction route
@app.route("/predict/<ticker>")
def predict(ticker):
    result = predict_stock(ticker)
    return jsonify(result)

# ✅ Stock history route
@app.route("/stock/<ticker>")
def get_stock(ticker):
    try:
        # Download stock data
        data = yf.download(ticker, period="5d", interval="1d")
        print("Downloaded data:\n", data)

        if data.empty:
            return jsonify({"error": f"No data found for ticker {ticker}"}), 404

        # Flatten multi-level columns
        data.columns = ["_".join(col).strip() if isinstance(col, tuple) else col for col in data.columns]

        # Convert to JSON
        result = data.reset_index().to_dict(orient="records")
        return jsonify({"ticker": ticker, "data": result})

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": str(e)}), 500

# ✅ Run the app
if __name__ == "__main__":
    app.run(debug=True)
