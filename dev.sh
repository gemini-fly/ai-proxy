#!/bin/bash
# 本地前后端一键启动脚本（开发模式）

set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
WEB_DIR="$ROOT_DIR/web"
LOG_DIR="$ROOT_DIR/.dev-logs"
BACKEND_LOG="$LOG_DIR/backend.log"
FRONTEND_LOG="$LOG_DIR/frontend.log"

mkdir -p "$LOG_DIR"

# ────────────────────────────────────────────
# 颜色输出
# ────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*"; }

# ────────────────────────────────────────────
# 清理函数（Ctrl+C 退出时杀掉子进程）
# ────────────────────────────────────────────
BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
  echo ""
  info "正在停止所有服务..."
  [ -n "$BACKEND_PID" ]  && kill "$BACKEND_PID"  2>/dev/null && info "后端已停止 (PID $BACKEND_PID)"
  [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null && info "前端已停止 (PID $FRONTEND_PID)"
  exit 0
}
trap cleanup INT TERM

# ────────────────────────────────────────────
# 1. 检查依赖
# ────────────────────────────────────────────
info "检查依赖..."
command -v go   >/dev/null 2>&1 || { error "未找到 go，请先安装 Go"; exit 1; }
command -v bun  >/dev/null 2>&1 || { error "未找到 bun，请先安装 Bun (https://bun.sh)"; exit 1; }
success "依赖检查通过"

# ────────────────────────────────────────────
# 2. 确保 web/dist 占位目录存在（后端 embed 需要）
# ────────────────────────────────────────────
if [ ! -d "$ROOT_DIR/web/dist" ]; then
  warn "web/dist 不存在，创建占位目录..."
  mkdir -p "$ROOT_DIR/web/dist"
  echo "<html><body>dev placeholder</body></html>" > "$ROOT_DIR/web/dist/index.html"
  success "占位目录已创建"
fi

# ────────────────────────────────────────────
# 3. 安装前端依赖（如 node_modules 不存在）
# ────────────────────────────────────────────
if [ ! -d "$WEB_DIR/node_modules" ]; then
  info "安装前端依赖 (bun install)..."
  cd "$WEB_DIR" && bun install
  success "前端依赖安装完成"
fi

# ────────────────────────────────────────────
# 工具函数：检测并释放端口
# ────────────────────────────────────────────
kill_port() {
  local port="$1"
  local pids
  pids=$(lsof -iTCP:"$port" -sTCP:LISTEN -t 2>/dev/null)
  if [ -n "$pids" ]; then
    warn "端口 $port 已被占用 (PID: $pids)，正在 kill -9..."
    echo "$pids" | xargs kill -9 2>/dev/null || true
    sleep 1
    success "端口 $port 已释放"
  fi
}

# ────────────────────────────────────────────
# 4. 启动后端
# ────────────────────────────────────────────
BACKEND_PORT=${PORT:-3000}
kill_port "$BACKEND_PORT"

info "启动后端 (go run main.go)..."
cd "$ROOT_DIR"
go run main.go > "$BACKEND_LOG" 2>&1 &
BACKEND_PID=$!
info "后端日志：$BACKEND_LOG  (PID $BACKEND_PID)"

# 等待后端就绪（最多 20 秒）
for i in $(seq 1 20); do
  if lsof -iTCP:"$BACKEND_PORT" -sTCP:LISTEN -t >/dev/null 2>&1; then
    success "后端已就绪，监听端口 $BACKEND_PORT"
    break
  fi
  if [ "$i" -eq 20 ]; then
    error "后端 20 秒内未能启动，请查看日志：$BACKEND_LOG"
    tail -20 "$BACKEND_LOG"
    cleanup
  fi
  sleep 1
done

# ────────────────────────────────────────────
# 5. 启动前端
# ────────────────────────────────────────────
FRONTEND_PORT=5566
kill_port "$FRONTEND_PORT"

info "启动前端 (bun dev)..."
cd "$WEB_DIR"
bun dev > "$FRONTEND_LOG" 2>&1 &
FRONTEND_PID=$!
info "前端日志：$FRONTEND_LOG  (PID $FRONTEND_PID)"

# 等待前端 Vite 就绪（最多 20 秒）
for i in $(seq 1 20); do
  if lsof -iTCP:"$FRONTEND_PORT" -sTCP:LISTEN -t >/dev/null 2>&1; then
    success "前端已就绪，访问 http://localhost:$FRONTEND_PORT"
    break
  fi
  if [ "$i" -eq 20 ]; then
    warn "前端 20 秒内未探测到端口，请查看日志：$FRONTEND_LOG"
  fi
  sleep 1
done

# ────────────────────────────────────────────
# 6. 打印汇总信息
# ────────────────────────────────────────────
echo ""
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}  前端：http://localhost:$FRONTEND_PORT${NC}"
echo -e "${GREEN}  后端：http://localhost:$BACKEND_PORT${NC}"
echo -e "${GREEN}  日志目录：$LOG_DIR${NC}"
echo -e "${GREEN}  按 Ctrl+C 停止所有服务${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""

# 保持脚本运行，实时显示后端日志
tail -f "$BACKEND_LOG"
