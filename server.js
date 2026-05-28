const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 3000;
const BRAIN_DIR = path.join(os.homedir(), '.gemini', 'antigravity-cli', 'brain');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

// Dynamically discover the latest modified conversation directory to read its logs
let cachedLatestLogPath = null;
let lastCacheTime = 0;
const CACHE_TTL = 5000; // 5 seconds cache

function getLatestLogPath() {
  const now = Date.now();
  if (cachedLatestLogPath && (now - lastCacheTime < CACHE_TTL)) {
    return cachedLatestLogPath;
  }

  try {
    if (!fs.existsSync(BRAIN_DIR)) {
      console.error(`Brain directory not found at ${BRAIN_DIR}`);
      return null;
    }
    
    const dirs = fs.readdirSync(BRAIN_DIR)
      .map(name => {
        const fullPath = path.join(BRAIN_DIR, name);
        return { name, stat: fs.statSync(fullPath) };
      })
      .filter(item => item.stat.isDirectory() && item.name !== 'scratch')
      .sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs);
    
    if (dirs.length > 0) {
      const latestPath = path.join(BRAIN_DIR, dirs[0].name, '.system_generated', 'logs', 'transcript.jsonl');
      console.log(`Discovered active log path: ${latestPath}`);
      cachedLatestLogPath = latestPath;
      lastCacheTime = now;
      return latestPath;
    }
  } catch (e) {
    console.error('Error finding latest log path:', e);
  }
  return null;
}

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  
  // Real-time Event Stream Endpoint (SSE)
  if (parsedUrl.pathname === '/stream') {
    const latestLogPath = getLatestLogPath();
    const strategy = parsedUrl.searchParams.get('strategy') || 'none';
    
    if (!latestLogPath || !fs.existsSync(latestLogPath)) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Active log file not found.');
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    console.log(`Client connected to event stream. Tailing: ${latestLogPath}. Strategy: ${strategy}`);

    let bytesRead = 0;
    let isReading = false;
    
    const sendUpdates = () => {
      if (isReading) return;
      isReading = true;
      
      fs.stat(latestLogPath, (err, stats) => {
        if (err) {
          isReading = false;
          return;
        }
        if (stats.size > bytesRead) {
          const targetBytes = stats.size;
          const stream = fs.createReadStream(latestLogPath, { start: bytesRead, end: targetBytes });
          let chunkData = '';
          stream.on('data', chunk => { chunkData += chunk; });
          stream.on('error', streamErr => {
            console.error('Read stream error:', streamErr);
            isReading = false;
            stream.destroy();
          });
          stream.on('end', () => {
            const isInitialLoad = (bytesRead === 0);
            bytesRead = targetBytes;
            isReading = false;
            let lines = chunkData.split('\n').filter(line => line.trim());
            
            // 1. Sliding Window optimization: if initial load and strategy is window, only send the last 5 lines
            if (isInitialLoad && strategy === 'window') {
              lines = lines.slice(-5);
            }
            
            lines.forEach((line, idx) => {
              let dataToSend = line.trim();
              
              try {
                const step = JSON.parse(line);
                const verboseTypes = ['RUN_COMMAND', 'VIEW_FILE', 'GREP_SEARCH', 'LIST_DIRECTORY', 'CODE_ACTION'];
                
                // 2. Prune strategy: slice verbose content
                if (strategy === 'prune') {
                  if (verboseTypes.includes(step.type) && step.content && step.content.length > 500) {
                    const originalLength = step.content.length;
                    step.originalLength = originalLength;
                    step.content = step.content.slice(0, 150) + `\n\n... [🧹 後端已裁剪工具輸出以優化 Token。已裁減 ${originalLength - 150} 字元] ...`;
                    step.pruned = true;
                    dataToSend = JSON.stringify(step);
                  }
                } 
                // 3. Memory summarization strategy: compress older steps aggressively
                else if (strategy === 'summarize') {
                  const isOldStep = (idx < lines.length - 3);
                  if (isOldStep) {
                    if (verboseTypes.includes(step.type) && step.content && step.content.length > 300) {
                      const originalLength = step.content.length;
                      step.originalLength = originalLength;
                      step.content = step.content.slice(0, 80) + `\n\n... [📝 記憶摘要：已壓縮歷史工具輸出以優化 Token。已裁減 ${originalLength - 80} 字元] ...`;
                      step.pruned = true;
                      dataToSend = JSON.stringify(step);
                    } else if ((step.type === 'USER_INPUT' || step.type === 'PLANNER_RESPONSE') && step.content && step.content.length > 300) {
                      const originalLength = step.content.length;
                      step.originalLength = originalLength;
                      step.content = step.content.slice(0, 120) + `\n\n... [📝 記憶摘要：對話內容已壓縮以優化 Token。已裁減 ${originalLength - 120} 字元] ...`;
                      step.pruned = true;
                      dataToSend = JSON.stringify(step);
                    }
                  } else {
                    // Latest 3 steps get standard tool output pruning if too long
                    if (verboseTypes.includes(step.type) && step.content && step.content.length > 500) {
                      const originalLength = step.content.length;
                      step.originalLength = originalLength;
                      step.content = step.content.slice(0, 200) + `\n\n... [🧹 後端已裁剪此歷史紀錄以優化 Token。已裁減 ${originalLength - 200} 字元] ...`;
                      step.pruned = true;
                      dataToSend = JSON.stringify(step);
                    }
                  }
                }
              } catch (e) {
                // Fallback to raw if JSON parse fails
              }
              
              res.write(`data: ${dataToSend}\n\n`);
            });
          });
        } else {
          isReading = false;
        }
      });
    };

    // Load initial history
    sendUpdates();

    // Watch the log directory for file updates
    const logDir = path.dirname(latestLogPath);
    let watcher;
    try {
      watcher = fs.watch(logDir, (eventType, filename) => {
        if (filename === 'transcript.jsonl') {
          sendUpdates();
        }
      });
    } catch (e) {
      console.error('Failed to start fs.watch, falling back to interval polling', e);
    }

    // Interval fallback to guarantee updates on all systems
    const interval = setInterval(sendUpdates, 1000);

    req.on('close', () => {
      console.log('Client disconnected from stream.');
      clearInterval(interval);
      if (watcher) watcher.close();
    });
    return;
  }

  // Static File Server
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath);
  
  if (!filePath.startsWith(__dirname)) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end('404 Not Found');
      } else {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end(`500 Server Error: ${err.code}`);
      }
    } else {
      res.statusCode = 200;
      res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
      res.end(content);
    }
  });
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is already in use. Exiting gracefully.`);
    process.exit(0);
  } else {
    console.error(e);
    process.exit(1);
  }
});

server.listen(PORT, () => {
  console.log(`Agent Office Server listening at http://localhost:${PORT}/`);
});
