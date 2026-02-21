#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');
const http = require('http');

// Config & offline queue paths
const CONFIG_FILE = path.join(os.homedir(), '.bracker', 'config.json');
const PENDING_FILE = path.join(os.homedir(), '.bracker', 'pending.jsonl');

// --- Config ---
function loadConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    throw new Error(
      'Bracker config not found. Run the setup first:\n' +
      '  mkdir -p ~/.bracker\n' +
      '  echo \'{"apiUrl":"https://bracker.dev","apiKey":"YOUR_KEY","username":"YOUR_USERNAME"}\' > ~/.bracker/config.json'
    );
  }
  const cfg = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  if (!cfg.apiUrl || !cfg.apiKey) {
    throw new Error('Bracker config missing apiUrl or apiKey. Check ~/.bracker/config.json');
  }
  return cfg;
}

// --- HTTP helpers ---
function apiRequest(method, urlStr, body, apiKey) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const transport = url.protocol === 'https:' ? https : http;
    const options = {
      method,
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    };

    const req = transport.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try { resolve(JSON.parse(data)); }
          catch { resolve(data); }
        } else {
          reject(new Error(`API ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('Request timeout')); });

    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// --- Offline queue ---
function appendPending(entry) {
  const dir = path.dirname(PENDING_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.appendFileSync(PENDING_FILE, JSON.stringify(entry) + '\n');
}

async function flushPending(config) {
  if (!fs.existsSync(PENDING_FILE)) return;

  const lines = fs.readFileSync(PENDING_FILE, 'utf8').trim().split('\n').filter(Boolean);
  if (lines.length === 0) return;

  const remaining = [];
  for (const line of lines) {
    try {
      const entry = JSON.parse(line);
      const url = `${config.apiUrl}${entry.path}`;
      await apiRequest(entry.method, url, entry.body, config.apiKey);
    } catch {
      remaining.push(line);
    }
  }

  if (remaining.length > 0) {
    fs.writeFileSync(PENDING_FILE, remaining.join('\n') + '\n');
  } else {
    fs.unlinkSync(PENDING_FILE);
  }
}

// --- API wrappers with offline fallback ---
async function apiPost(config, apiPath, body) {
  try {
    const result = await apiRequest('POST', `${config.apiUrl}${apiPath}`, body, config.apiKey);
    // On success, try flushing pending queue in background
    flushPending(config).catch(() => {});
    return result;
  } catch (err) {
    appendPending({ method: 'POST', path: apiPath, body, timestamp: new Date().toISOString() });
    return { queued: true, error: err.message };
  }
}

async function apiGet(config, apiPath) {
  try {
    const result = await apiRequest('GET', `${config.apiUrl}${apiPath}`, null, config.apiKey);
    flushPending(config).catch(() => {});
    return result;
  } catch (err) {
    return { error: err.message };
  }
}

// --- MCP Server ---
const server = new Server({
  name: 'bracker',
  version: '2.0.0'
}, {
  capabilities: { tools: {} }
});

// List tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'log_build',
        description: 'Log a build event to Bracker',
        inputSchema: {
          type: 'object',
          properties: {
            repo: { type: 'string', description: 'Repository name' },
            diff_summary: { type: 'string', description: 'Git diff summary' },
            conversation_summary: { type: 'string', description: 'Summary of what was built/learned' },
            tokens_used: { type: 'number', description: 'Tokens consumed in the session' },
            commit_message: { type: 'string', description: 'Git commit message' }
          },
          required: ['repo', 'diff_summary', 'commit_message']
        }
      },
      {
        name: 'log_post',
        description: 'Log a social media post to Bracker',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'URL of the tweet/post' },
            platform: { type: 'string', description: 'Platform (twitter, linkedin, etc.)', default: 'twitter' },
            content: { type: 'string', description: 'Optional: what was posted' }
          },
          required: ['url']
        }
      },
      {
        name: 'get_stats',
        description: 'Get your current build statistics, level, and progress',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'suggest_tweet',
        description: 'Generate a tweet draft from recent builds',
        inputSchema: {
          type: 'object',
          properties: {
            style: {
              type: 'string',
              enum: ['raw', 'polished', 'educational'],
              description: 'Tweet style',
              default: 'raw'
            }
          }
        }
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const config = loadConfig();

  if (name === 'log_build') {
    const { repo, diff_summary, conversation_summary, tokens_used = 0, commit_message } = args;

    const result = await apiPost(config, '/api/builds', {
      repo,
      diff_summary,
      conversation_summary,
      tokens_used,
      commit_message
    });

    if (result.queued) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            status: 'queued',
            message: 'Build logged offline. It will sync when the API is reachable.',
            error: result.error
          }, null, 2)
        }]
      };
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };
  }

  if (name === 'log_post') {
    const { url, platform = 'twitter', content } = args;

    const result = await apiPost(config, '/api/posts', {
      url,
      platform,
      content
    });

    if (result.queued) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            status: 'queued',
            message: 'Post logged offline. It will sync when the API is reachable.',
            error: result.error
          }, null, 2)
        }]
      };
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };
  }

  if (name === 'get_stats') {
    const username = config.username || 'me';
    const result = await apiGet(config, `/api/stats/${encodeURIComponent(username)}`);

    if (result.error) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            status: 'error',
            message: 'Could not fetch stats. The API may be unreachable.',
            error: result.error
          }, null, 2)
        }]
      };
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };
  }

  if (name === 'suggest_tweet') {
    const { style = 'raw' } = args;
    const result = await apiGet(config, `/api/suggest-tweet?style=${encodeURIComponent(style)}`);

    if (result.error) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            status: 'error',
            message: 'Could not generate tweet suggestion. The API may be unreachable.',
            error: result.error
          }, null, 2)
        }]
      };
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Start server
async function main() {
  const config = loadConfig();
  // Flush any pending requests from previous offline sessions
  flushPending(config).catch(() => {});

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
