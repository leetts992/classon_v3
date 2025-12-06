# AWS S3 설정 가이드

## 1. AWS 계정 생성
- https://aws.amazon.com/ko/
- 무료 티어: 첫 12개월간 매월 5GB 스토리지, 20,000 GET 요청, 2,000 PUT 요청 무료

## 2. IAM 사용자 생성 및 액세스 키 발급

### 2-1. IAM 콘솔 접속
1. AWS 콘솔(https://console.aws.amazon.com/)에 로그인
2. 검색창에 "IAM" 입력 후 선택
3. 좌측 메뉴에서 "사용자" 클릭
4. "사용자 추가" 버튼 클릭

### 2-2. 사용자 생성
1. **사용자 이름**: `classon-app` (원하는 이름 입력)
2. **AWS 액세스 유형**: "프로그래밍 방식 액세스" 체크
3. "다음: 권한" 클릭

### 2-3. 권한 설정
1. "기존 정책 직접 연결" 선택
2. 검색창에 "S3" 입력
3. **AmazonS3FullAccess** 체크 (또는 제한된 권한 사용 시 아래 참조)
4. "다음: 태그" → "다음: 검토" → "사용자 만들기" 클릭

### 2-4. 액세스 키 저장 ⚠️ 중요!
생성 완료 후 표시되는 정보를 안전하게 저장:
- **액세스 키 ID**: `AKIA...` 형태
- **비밀 액세스 키**: 한 번만 표시되므로 반드시 저장!
- CSV 다운로드 권장

## 3. S3 버킷 생성

### 3-1. S3 콘솔 접속
1. AWS 콘솔에서 "S3" 검색 후 선택
2. "버킷 만들기" 클릭

### 3-2. 버킷 설정
1. **버킷 이름**: `classon-storage` (전세계적으로 고유해야 함)
   - 예: `classon-storage-20231205`, `your-name-classon`
2. **AWS 리전**: `아시아 태평양(서울) ap-northeast-2` 선택
3. **퍼블릭 액세스 차단 설정**:
   - "모든 퍼블릭 액세스 차단" 체크 해제
   - ⚠️ 경고 확인: "이 버킷에 대한 퍼블릭 액세스 권한을 부여할 수 있음을 인정합니다." 체크
4. 나머지 설정은 기본값 유지
5. "버킷 만들기" 클릭

### 3-3. CORS 설정 (중요!)
파일 업로드를 위해 CORS 설정 필요:

1. 생성한 버킷 클릭
2. "권한" 탭 선택
3. "CORS(Cross-Origin Resource Sharing)" 섹션에서 "편집" 클릭
4. 아래 JSON 입력:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "PUT",
            "POST",
            "DELETE",
            "HEAD"
        ],
        "AllowedOrigins": [
            "http://localhost:3000",
            "http://localhost:8000",
            "https://yourdomain.com"
        ],
        "ExposeHeaders": [
            "ETag"
        ],
        "MaxAgeSeconds": 3000
    }
]
```

5. "변경 사항 저장" 클릭

### 3-4. 버킷 정책 설정 (퍼블릭 읽기 허용)
업로드된 파일을 웹에서 볼 수 있도록 설정:

1. "권한" 탭에서 "버킷 정책" 섹션 선택
2. "편집" 클릭
3. 아래 정책 입력 (버킷 이름을 실제 버킷 이름으로 변경):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::classon-storage/*"
        }
    ]
}
```

⚠️ **주의**: `classon-storage`를 실제 버킷 이름으로 변경하세요!

4. "변경 사항 저장" 클릭

## 4. 환경 변수 설정

백엔드 폴더의 `.env` 파일에 추가:

```bash
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=AKIA******************  # IAM 사용자의 액세스 키 ID
AWS_SECRET_ACCESS_KEY=****************************************  # IAM 사용자의 비밀 액세스 키
AWS_REGION=ap-northeast-2  # 서울 리전
S3_BUCKET_NAME=classon-storage  # 생성한 버킷 이름
```

### `.env` 파일 생성 방법:
```bash
cd /Users/lee/Desktop/Program/1.\ Web/3.classon/backend
touch .env
```

그리고 위 내용을 복사해서 `.env` 파일에 붙여넣기

## 5. 테스트

### 5-1. 백엔드 재시작
환경 변수 변경 후 백엔드 서버 재시작 필요

### 5-2. 업로드 테스트
1. 프론트엔드에서 상품 등록 페이지 접속
2. 썸네일 업로드 버튼 클릭
3. 이미지 파일 선택
4. 업로드 성공 시 URL이 자동으로 입력됨
5. URL 형태: `https://classon-storage.s3.ap-northeast-2.amazonaws.com/instructors/.../images/...`

## 6. 비용 관리 팁

### 무료 티어 한도 (첫 12개월)
- 스토리지: 5GB
- PUT/COPY/POST/LIST 요청: 2,000건/월
- GET/SELECT 요청: 20,000건/월
- 데이터 전송(아웃): 15GB/월

### 비용 절감 방법
1. **수명 주기 정책 설정**: 오래된 파일 자동 삭제
2. **불필요한 파일 정리**: 주기적으로 사용하지 않는 파일 삭제
3. **CloudWatch 알림 설정**: 비용이 일정 금액 초과 시 알림
4. **S3 Intelligent-Tiering**: 자동으로 저렴한 스토리지 클래스로 이동

### 예상 비용 (무료 티어 초과 시)
- 스토리지: $0.025/GB/월 (서울 리전)
- PUT 요청: $0.005/1,000건
- GET 요청: $0.0004/1,000건

예) 10GB 스토리지 + 월 5,000건 업로드 + 월 50,000건 다운로드
= $0.25 + $0.025 + $0.02 ≈ **$0.30/월 (약 400원)**

## 7. 보안 모범 사례

### 7-1. 제한된 IAM 정책 사용 (권장)
전체 S3 액세스 대신 특정 버킷만 액세스:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::classon-storage",
                "arn:aws:s3:::classon-storage/*"
            ]
        }
    ]
}
```

### 7-2. 액세스 키 보안
- ❌ 절대 GitHub에 커밋하지 말 것
- ✅ `.env` 파일을 `.gitignore`에 추가
- ✅ 정기적으로 액세스 키 교체
- ✅ 의심스러운 활동 발견 시 즉시 키 비활성화

### 7-3. `.gitignore` 확인
```bash
# .gitignore에 추가되어 있는지 확인
cat .gitignore | grep .env
```

없다면 추가:
```bash
echo ".env" >> .gitignore
```

## 8. 대안: 개발 단계에서는 URL 직접 입력

AWS 설정이 부담스럽다면:
1. 무료 이미지 호스팅 서비스 사용:
   - **Imgur**: https://imgur.com/
   - **Cloudinary**: https://cloudinary.com/ (무료 25GB)
   - **imgbb**: https://imgbb.com/

2. 파일 업로드 후 URL 복사해서 직접 입력
3. 나중에 프로덕션 배포 시 S3로 마이그레이션

## 9. 문제 해결

### 업로드 실패 시 확인사항:
1. ✅ AWS 액세스 키가 `.env`에 올바르게 입력되었는지
2. ✅ 버킷 이름이 정확한지
3. ✅ 버킷 정책과 CORS가 올바르게 설정되었는지
4. ✅ IAM 사용자에게 S3 권한이 있는지
5. ✅ 백엔드 서버를 재시작했는지

### 파일이 보이지 않을 때:
1. 버킷 정책에서 퍼블릭 읽기 권한 확인
2. 파일 URL이 올바른지 확인
3. 브라우저 콘솔에서 CORS 에러 확인

## 10. 참고 자료
- AWS S3 공식 문서: https://docs.aws.amazon.com/s3/
- AWS 프리 티어: https://aws.amazon.com/ko/free/
- AWS 요금 계산기: https://calculator.aws/
