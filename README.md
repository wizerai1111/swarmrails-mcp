# Swarmrails MCP

Call any Bittensor subnet — text, image, video, code, TTS, forecasting, 3D assets — directly from Claude and other AI assistants. Also includes SharpSignal prediction market intelligence.

No TAO. No node setup. No subscription. Free to try.

## Tools

| Tool | Capability | Cost |
|---|---|---|
| `bittensor_text` | Conversational AI (Llama 3.3 70B) | $0.005 |
| `bittensor_translate` | Multilingual translation | $0.005 |
| `bittensor_reasoning` | Advanced reasoning (DeepSeek R1) | $0.05 |
| `bittensor_image` | Text-to-image (SDXL) | $0.075 |
| `bittensor_llm` | LLM inference (Nous Research) | $0.01 |
| `bittensor_forecast` | Financial & crypto forecasting | $0.05 |
| `bittensor_code` | Code generation | $0.01 |
| `bittensor_data` | Data analysis & synthesis | $0.005 |
| `bittensor_tts` | Text-to-speech (returns MP3) | $0.025 |
| `bittensor_scrape` | Web scraping & content extraction | $0.01 |
| `bittensor_multimodal` | Image + text reasoning (Gemini) | $0.02 |
| `bittensor_video` | Text-to-video MP4 (async) | $2.00 |
| `bittensor_3d` | Image-to-3D GLB asset (async) | $0.75 |
| `sharpsignal_predict` | Prediction market intelligence | $0.25 |

## Quick Start

Works out of the box with no configuration — free test mode is enabled by default.

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "swarmrails": {
      "command": "npx",
      "args": ["-y", "swarmrails-mcp"]
    }
  }
}
```

### With real USDC payments

1. Send USDC on Base to: `0x14a129b3e3Bd154c974118299d75F14626A6157B`
2. Copy your transaction hash from [basescan.org](https://basescan.org)
3. Set the env var: `SWARMRAILS_API_KEY=myapp:0xYOUR_TX_HASH`

Each transaction hash is single-use. Payment protocol: [x402](https://x402.org) on Base.

## Payment Protocol

Swarmrails uses the **x402 protocol** — each USDC transaction on Base blockchain is a single-use API token. No accounts, no subscriptions, no API keys to manage.

```
Authorization: x402 <macaroon>:0xTRANSACTION_HASH
```

## License

MIT
