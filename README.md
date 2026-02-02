# code-fallback

**Smart fallback wrapper for AI coding assistants**

Try Claude for coding tasks, automatically fallback to Codex when Claude gets stuck.

## Why?

Sometimes Claude fails at certain coding tasks. Instead of manually switching to Codex, this CLI wrapper does it automatically:

1. Tries Claude first (fast, great for most tasks)
2. Falls back to Codex if Claude fails (exit code ≠ 0 or timeout)
3. Returns the successful result

## Installation

```bash
npm install -g code-fallback
```

## Usage

### Basic

```bash
# Pass task as argument
code-fallback "Write a Python script to parse CSV and output JSON"

# Or pipe from stdin
echo "Create a React component for a todo list" | code-fallback
```

### Options

```bash
code-fallback [task] [options]

Options:
  -c, --claude <cmd>    Claude CLI command (default: "claude-code")
  -x, --codex <cmd>     Codex CLI command (default: "codex")
  -t, --timeout <ms>    Timeout in milliseconds (default: 300000)
  -v, --verbose         Verbose output
  -V, --version         Output version number
  -h, --help            Display help
```

### Examples

```bash
# Custom timeout (1 minute)
code-fallback "Build a TypeScript HTTP server" -t 60000

# Verbose mode (see which tool is running)
code-fallback "Parse XML to JSON in Python" -v

# Custom CLI commands
code-fallback "Create a bash script" -c "claude" -x "openai-codex"
```

## Requirements

- Node.js 18+
- At least one of: `claude-code` or `codex` CLIs installed
- API keys configured for your chosen tools

## How It Works

1. Spawns the Claude CLI with your task
2. Waits for completion (or timeout)
3. If Claude succeeds (exit code 0) → Done!
4. If Claude fails → Automatically retries with Codex
5. Returns Codex result

## Configuration

The tool looks for these CLI commands in your PATH:
- `claude-code` (default for Claude)
- `codex` (default for Codex)

You can override these with `--claude` and `--codex` flags.

## License

MIT

## Contributing

Issues and PRs welcome! This tool is intentionally simple — keep it that way.

## Inspired By

[@isaacdidathing](https://x.com/isaacdidathing/status/2012614218906734693) who needed a better way to handle Claude failures on coding tasks.
