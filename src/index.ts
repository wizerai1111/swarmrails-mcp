#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

const GATEWAY_URL =
  "https://xosljjzcpsouwifbclsy.supabase.co/functions/v1/payment_gate";

// Use env var or fall back to test mode
const API_KEY =
  process.env.SWARMRAILS_API_KEY ?? "test_mode:swarmrails_test_2026";

async function callGateway(body: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `x402 ${API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as Record<string, unknown>;

  if (!res.ok) {
    const msg =
      typeof data.error === "string" ? data.error : `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

async function pollJob(
  jobId: string,
  maxWaitMs = 180_000
): Promise<Record<string, unknown>> {
  const deadline = Date.now() + maxWaitMs;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 5_000));
    const res = await fetch(`${GATEWAY_URL}?job_id=${jobId}`);
    const data = (await res.json()) as Record<string, unknown>;
    if (data.status === "completed") return data;
    if (data.status === "failed") throw new Error("Job failed on gateway");
  }
  throw new Error("Job timed out after 3 minutes");
}

// ─── Tool definitions ────────────────────────────────────────────────────────

const TOOLS: Tool[] = [
  {
    name: "bittensor_text",
    description:
      "Conversational AI via Bittensor subnet 1 (Text Prompting). Good for general questions, summaries, and chat. Cost: $0.005 per call.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "Your text prompt" },
      },
      required: ["prompt"],
    },
  },
  {
    name: "bittensor_translate",
    description:
      "Multilingual translation via Bittensor subnet 3 (Machine Translation). Cost: $0.005 per call.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description: "Text to translate, including target language (e.g. 'Translate to French: Hello world')",
        },
      },
      required: ["prompt"],
    },
  },
  {
    name: "bittensor_reasoning",
    description:
      "Advanced reasoning via Bittensor subnet 4 (Targon). Best for complex multi-step problems. Cost: $0.05 per call.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "Your reasoning task or question" },
      },
      required: ["prompt"],
    },
  },
  {
    name: "bittensor_image",
    description:
      "Text-to-image synthesis via Bittensor subnet 5. Returns an image URL. Cost: $0.075 per call.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "Image description to generate" },
      },
      required: ["prompt"],
    },
  },
  {
    name: "bittensor_llm",
    description:
      "Fine-tuned LLM inference via Bittensor subnet 6 (Nous Research). Cost: $0.01 per call.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "Your prompt" },
      },
      required: ["prompt"],
    },
  },
  {
    name: "bittensor_forecast",
    description:
      "Financial and crypto time series forecasting via Bittensor subnet 8. Cost: $0.05 per call.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description: "Forecasting request, e.g. 'Forecast BTC price for next 7 days'",
        },
      },
      required: ["prompt"],
    },
  },
  {
    name: "bittensor_code",
    description:
      "Advanced code generation via Bittensor subnet 11. Cost: $0.01 per call.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "Code generation request" },
      },
      required: ["prompt"],
    },
  },
  {
    name: "bittensor_data",
    description:
      "Data analysis and synthesis via Bittensor subnet 13 (Data Universe). Cost: $0.005 per call.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "Data analysis request" },
      },
      required: ["prompt"],
    },
  },
  {
    name: "bittensor_tts",
    description:
      "Text-to-speech via Bittensor subnet 16. Returns audio as base64 MP3. Cost: $0.025 per call.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "Text to convert to speech" },
      },
      required: ["prompt"],
    },
  },
  {
    name: "bittensor_scrape",
    description:
      "Web scraping and URL content extraction via Bittensor subnet 21. Cost: $0.01 per call.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description: "URL to scrape, e.g. 'https://example.com'",
        },
      },
      required: ["prompt"],
    },
  },
  {
    name: "bittensor_multimodal",
    description:
      "Image + text reasoning via Bittensor subnet 24 (Omega Multimodal). Cost: $0.02 per call.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "Text prompt or question about the image" },
        image_url: { type: "string", description: "URL of the image to analyse" },
      },
      required: ["prompt"],
    },
  },
  {
    name: "bittensor_video",
    description:
      "Text-to-video generation via Bittensor subnet 18. Async — polls until ready (up to 3 min). Returns an MP4 URL. Cost: $2.00 per call.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "Video description to generate" },
      },
      required: ["prompt"],
    },
  },
  {
    name: "bittensor_3d",
    description:
      "Image-to-3D asset generation via Bittensor subnet 29. Requires a source image URL. Async — polls until ready (up to 3 min). Returns a GLB file URL. Cost: $0.75 per call.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "Description of the 3D asset" },
        image_url: {
          type: "string",
          description: "URL of the source image to convert to 3D",
        },
      },
      required: ["prompt", "image_url"],
    },
  },
  {
    name: "sharpsignal_predict",
    description:
      "Prediction market intelligence. Submit any yes/no question and get back a structured bull case, bear case, and implied probability from live web search. Powered by Perplexity sonar-reasoning-pro. Cost: $0.25 per call.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description: "A yes/no prediction market question, e.g. 'Will the Fed cut rates in May 2026?'",
        },
      },
      required: ["prompt"],
    },
  },
];

// ─── Server setup ────────────────────────────────────────────────────────────

const server = new Server(
  { name: "swarmrails", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const a = (args ?? {}) as Record<string, string>;

  try {
    let result: unknown;

    switch (name) {
      // ── sync subnets ──────────────────────────────────────────────────────
      case "bittensor_text":
        result = await callGateway({ netuid: 1, prompt: a.prompt });
        break;
      case "bittensor_translate":
        result = await callGateway({ netuid: 3, prompt: a.prompt });
        break;
      case "bittensor_reasoning":
        result = await callGateway({ netuid: 4, prompt: a.prompt });
        break;
      case "bittensor_image":
        result = await callGateway({ netuid: 5, prompt: a.prompt });
        break;
      case "bittensor_llm":
        result = await callGateway({ netuid: 6, prompt: a.prompt });
        break;
      case "bittensor_forecast":
        result = await callGateway({ netuid: 8, prompt: a.prompt });
        break;
      case "bittensor_code":
        result = await callGateway({ netuid: 11, prompt: a.prompt });
        break;
      case "bittensor_data":
        result = await callGateway({ netuid: 13, prompt: a.prompt });
        break;
      case "bittensor_tts":
        result = await callGateway({ netuid: 16, prompt: a.prompt });
        break;
      case "bittensor_scrape":
        result = await callGateway({ netuid: 21, prompt: a.prompt });
        break;
      case "bittensor_multimodal":
        result = await callGateway({
          netuid: 24,
          prompt: a.prompt,
          ...(a.image_url ? { image_url: a.image_url } : {}),
        });
        break;

      // ── async subnets (submit → poll) ─────────────────────────────────────
      case "bittensor_video": {
        const job = (await callGateway({ netuid: 18, prompt: a.prompt })) as Record<string, unknown>;
        if (job.status === "pending" && typeof job.job_id === "string") {
          result = await pollJob(job.job_id);
        } else {
          result = job;
        }
        break;
      }
      case "bittensor_3d": {
        const job = (await callGateway({
          netuid: 29,
          prompt: a.prompt,
          image_url: a.image_url,
        })) as Record<string, unknown>;
        if (job.status === "pending" && typeof job.job_id === "string") {
          result = await pollJob(job.job_id);
        } else {
          result = job;
        }
        break;
      }

      // ── SharpSignal ───────────────────────────────────────────────────────
      case "sharpsignal_predict":
        result = await callGateway({ route: "prediction-edge", prompt: a.prompt });
        break;

      default:
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text", text: `Error: ${message}` }],
      isError: true,
    };
  }
});

// ─── Start ───────────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Swarmrails MCP server running");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
