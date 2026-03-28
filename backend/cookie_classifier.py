import pickle

def load_model(model_path="models/knn_model.pkl"):
    with open(model_path, "rb") as f:
        return pickle.load(f)

def parse_retention(val: str) -> float:
    val = val.strip().lower()
    return -1 if val == "session" else float(val)

def predict_category(cookie_name: str, retention_period: str, model_path="models/knn_model.pkl"):
    bundle = load_model(model_path)
    model = bundle["model"]
    feature_encoders = bundle["feature_encoders"]
    target_encoder = bundle["target_encoder"]

    le = feature_encoders["Cookie / Data Key name"]
    encoded_name = le.transform([cookie_name])[0] if cookie_name in le.classes_ else -1
    encoded_retention = parse_retention(retention_period)

    prediction = model.predict([[encoded_name, encoded_retention]])
    return target_encoder.inverse_transform(prediction)[0]


if __name__ == "__main__":
    category = predict_category(
        cookie_name="cookiePreferences",
        retention_period="63072000"
    )
    print(f"Predicted category: {category}")
