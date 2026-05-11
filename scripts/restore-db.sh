#!/bin/bash
# New-API 数据库恢复脚本
#
# 使用说明：
#   1. chmod +x scripts/restore-db.sh
#   2. ./scripts/restore-db.sh backups/new-api_20240115_030000.sql.gz

set -euo pipefail

# ==================== 配置区域 ====================

DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-root}
DB_NAME=${DB_NAME:-new-api}
DB_PASSWORD=${DB_PASSWORD:-""}

# ==================== 参数检查 ====================

if [ $# -lt 1 ]; then
    echo "用法: $0 <备份文件路径>"
    echo "示例: $0 backups/new-api_20240115_030000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "${BACKUP_FILE}" ]; then
    echo "错误：备份文件不存在: ${BACKUP_FILE}"
    exit 1
fi

# ==================== 恢复流程 ====================

export PGPASSWORD="${DB_PASSWORD}"

echo "========================================"
echo "数据库恢复脚本"
echo "========================================"
echo "数据库: ${DB_NAME}"
echo "备份文件: ${BACKUP_FILE}"
echo ""

read -p "警告：此操作将覆盖现有数据库，是否继续？(yes/no): " CONFIRM

if [ "${CONFIRM}" != "yes" ]; then
    echo "已取消恢复操作"
    exit 0
fi

# 如果备份文件是压缩的，先解压
RESTORE_FILE="${BACKUP_FILE}"
if [[ "${BACKUP_FILE}" == *.gz ]]; then
    echo "解压备份文件..."
    RESTORE_FILE="${BACKUP_FILE%.gz}"
    gunzip -c "${BACKUP_FILE}" > "${RESTORE_FILE}"
fi

echo "开始恢复数据库..."

# 先终止现有连接
echo "终止现有数据库连接..."
psql \
    -h "${DB_HOST}" \
    -p "${DB_PORT}" \
    -U "${DB_USER}" \
    -d postgres \
    -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '${DB_NAME}' AND pid <> pg_backend_pid();" \
    >/dev/null 2>&1 || true

# 恢复数据
psql \
    -h "${DB_HOST}" \
    -p "${DB_PORT}" \
    -U "${DB_USER}" \
    -d "${DB_NAME}" \
    -f "${RESTORE_FILE}"

echo ""
echo "恢复完成！"

# 清理临时文件
if [[ "${BACKUP_FILE}" == *.gz ]]; then
    rm -f "${RESTORE_FILE}"
fi
