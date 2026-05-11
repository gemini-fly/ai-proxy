#!/bin/bash
# New-API 数据库备份脚本
# 在数据库服务器上运行，建议配置为定时任务（crontab）
#
# 使用说明：
#   1. chmod +x scripts/backup-db.sh
#   2. 配置环境变量或直接修改下方变量
#   3. 测试运行：./scripts/backup-db.sh
#   4. 加入 crontab：0 3 * * * /path/to/backup-db.sh >/dev/null 2>&1

set -euo pipefail

# ==================== 配置区域 ====================

# PostgreSQL 连接信息
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-root}
DB_NAME=${DB_NAME:-new-api}
DB_PASSWORD=${DB_PASSWORD:-""}

# 备份目录
BACKUP_DIR=${BACKUP_DIR:-"./backups"}

# 保留天数
RETENTION_DAYS=${RETENTION_DAYS:-30}

# 是否启用压缩
ENABLE_COMPRESSION=${ENABLE_COMPRESSION:-true}

# 是否启用远程备份（如需要，配置 scp/s3 等）
REMOTE_BACKUP=${REMOTE_BACKUP:-false}
# REMOTE_DEST="user@backup-server:/backups/new-api"

# ==================== 脚本主体 ====================

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/new-api_${TIMESTAMP}.sql"

# 创建备份目录
mkdir -p "${BACKUP_DIR}"

# 设置 PGPASSWORD 环境变量
export PGPASSWORD="${DB_PASSWORD}"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 开始备份数据库 ${DB_NAME}..."

# 执行 pg_dump
if ! pg_dump \
    -h "${DB_HOST}" \
    -p "${DB_PORT}" \
    -U "${DB_USER}" \
    -d "${DB_NAME}" \
    -F p \
    -f "${BACKUP_FILE}"; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 错误：备份失败！"
    exit 1
fi

# 压缩备份文件
if [ "${ENABLE_COMPRESSION}" = "true" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 压缩备份文件..."
    gzip -f "${BACKUP_FILE}"
    BACKUP_FILE="${BACKUP_FILE}.gz"
fi

BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 备份完成: ${BACKUP_FILE} (${BACKUP_SIZE})"

# 远程备份
if [ "${REMOTE_BACKUP}" = "true" ] && [ -n "${REMOTE_DEST:-}" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 上传备份到远程..."
    scp "${BACKUP_FILE}" "${REMOTE_DEST}/" || echo "远程备份失败"
fi

# 清理过期备份
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 清理 ${RETENTION_DAYS} 天前的备份..."
find "${BACKUP_DIR}" -name "new-api_*.sql*" -type f -mtime +${RETENTION_DAYS} -delete

# 统计
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 当前备份文件数: $(find ${BACKUP_DIR} -name 'new-api_*.sql*' | wc -l)"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 备份目录大小: $(du -sh ${BACKUP_DIR} | cut -f1)"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 备份任务完成"
