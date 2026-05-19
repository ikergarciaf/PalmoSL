from pyngrok import ngrok

if __name__ == "__main__":
    public_url = ngrok.connect(8000, bind_tls=True)
    print("Public URL:", public_url)
    print("Use this URL in your n8n workflow for the endpoint:")
    print(f"{public_url}/stock/predict-stock")
    print("Press Ctrl+C to stop the tunnel.")
    try:
        input("Tunnel is running. Press Enter to stop...\n")
    finally:
        ngrok.disconnect(public_url)
