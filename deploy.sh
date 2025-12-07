#!/bin/bash
#cd /Users/lee/Program/1.\ Web/3.classon./deploy.sh
# EC2 배포 스크립트
# 사용법: ./deploy.sh [EC2_IP_ADDRESS]

# 설정
PEM_FILE="./classon-v3.pem"
EC2_USER="ubuntu"
EC2_IP="${1:-52.79.54.208}"  # 첫 번째 인자로 IP를 받거나 기본값 사용
PROJECT_PATH="~/classon_v3"

echo "======================================"
echo "Class-On EC2 배포 스크립트"
echo "======================================"
echo "EC2 IP: $EC2_IP"
echo "PEM 파일: $PEM_FILE"
echo ""

# PEM 파일 권한 확인
if [ ! -f "$PEM_FILE" ]; then
    echo "❌ PEM 파일을 찾을 수 없습니다: $PEM_FILE"
    exit 1
fi

chmod 400 "$PEM_FILE"

# 로컬에서 Git 커밋 및 푸시
echo "📝 Git에 변경사항 커밋 및 푸시..."
echo ""

# Git status 확인
if git diff-index --quiet HEAD --; then
    echo "✓ 변경사항이 없습니다."
else
    echo "변경된 파일들:"
    git status --short
    echo ""

    # 모든 변경사항 추가
    git add .

    # 커밋 메시지 생성
    COMMIT_MSG="Deploy: $(date '+%Y-%m-%d %H:%M:%S')

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

    # 커밋
    git commit -m "$COMMIT_MSG"

    # 푸시
    echo "📤 GitHub에 푸시 중..."
    git push origin main
    echo "✓ GitHub 푸시 완료!"
fi

echo ""

# EC2 서버에 명령 실행
echo "🚀 EC2 서버에 배포 시작..."
echo ""

ssh -i "$PEM_FILE" ${EC2_USER}@${EC2_IP} << 'ENDSSH'
    set -e  # 에러 발생 시 즉시 중단

    echo "📦 Git에서 최신 코드 가져오기..."
    cd ~/classon_v3
    git pull origin main

    echo ""
    echo "🎨 프론트엔드 빌드 중..."
    cd frontend
    rm -rf .next
    npm run build

    echo ""
    echo "🔄 PM2 프로세스 재시작..."
    pm2 restart all

    echo ""
    echo "📊 PM2 프로세스 상태:"
    pm2 list

    echo ""
    echo "✅ 배포 완료!"
ENDSSH

echo ""
echo "======================================"
echo "배포가 완료되었습니다!"
echo "======================================"
