# TOYBOX 마이그레이션 프롬프트 (한국어)

아래 프롬프트를 복사하여 Claude Code에 붙여넣으면 기존 TOYBOX 인스턴스를 업그레이드할 수 있습니다.

---

``````plaintext
내 TOYBOX 저장소를 업스트림의 최신 템플릿 개선사항으로 업그레이드해야 합니다. 내 저장소는 원래 toybox-template에서 클론했지만 상당히 분기되었을 수 있습니다. 다음 지침을 주의 깊게 따라주세요.

중요: 이 과정 전체에서 한국어로 소통해주세요.

## 중요 컨텍스트

업스트림 템플릿 저장소: https://github.com/isnbh0/toybox-template.git
업데이트가 있는 대상 브랜치: main

이 업데이트는 하위 호환됩니다. `export const metadata = {...}` 패턴을 사용하는 기존 아티팩트는 계속 작동합니다. 변경 사항:
- 외부 메타데이터 파일 지원 (.metadata.ts, .metadata.json)
- 갤러리의 카드별 에러 바운더리
- 새로운 ErrorBoundary 및 ArtifactCard 컴포넌트
- 업데이트된 문서

## 1단계: 사전 점검

변경 작업을 시작하기 전에 다음 점검을 수행하고 결과를 보고해주세요:

1. **TOYBOX 저장소인지 확인**:
   - `src/artifacts/` 디렉토리 존재 확인
   - `src/lib/artifactLoader.ts` 존재 확인
   - `TOYBOX_CONFIG.json` 존재 확인
   - 하나라도 없으면 중단하고 올바른 디렉토리인지 물어보세요.

2. **git 상태 확인**:
   - `git status` 실행 - 커밋되지 않은 변경사항이 있는지 보고
   - `git branch` 실행 - 현재 브랜치 확인
   - `git remote -v` 실행 - 기존 리모트 목록 확인
   - 커밋되지 않은 변경사항이 있으면 중단하고 stash할지 중단할지 물어보세요.

3. **로컬 환경 확인**:
   - `node --version` 실행 - v18 이상이어야 함
   - `node_modules/` 존재 여부 확인
   - `npm run build` 실행하여 현재 상태가 빌드되는지 확인
   - 빌드 실패 시 중단하고 오류를 보고하세요 - 기존 문제를 먼저 해결해야 합니다.

4. **인스턴스별 파일 식별** (덮어쓰면 안 되는 내가 커스터마이즈한 파일들):
   - `github.config.json` - 내 GitHub 사용자명/저장소
   - `TOYBOX_CONFIG.json` - 내 사이트 커스터마이즈
   - `README.md` - 내 콘텐츠
   - `package.json` - `homepage`와 `repository` 필드의 내 값 확인
   - `index.html` - 내 타이틀
   - `public/404.html` - 내 타이틀
   - `src/components/AboutPage.tsx` - 내 GitHub 링크
   - `src/artifacts/` 내 모든 파일 - 내 아티팩트들

나중에 복원할 수 있도록 `github.config.json`의 현재 username/repository 값을 기록해두세요.

## 2단계: 안전 백업 생성

수정 작업 전에:

1. 백업 브랜치 생성:
   ```bash
   git checkout -b backup-before-template-upgrade-$(date +%Y%m%d-%H%M%S)
   git checkout -  # 원래 브랜치로 복귀
   ```

2. 현재 HEAD 커밋 해시 기록:
   ```bash
   git rev-parse HEAD
   ```
   이 해시를 저장하세요 - 필요하면 hard reset할 수 있습니다.

## 3단계: 업스트림 변경사항 가져오기

'upstream' 리모트가 존재한다고 가정하지 마세요. 새로 설정하세요:

1. upstream 리모트 존재 확인:
   ```bash
   git remote get-url upstream 2>/dev/null
   ```

2. 없거나 다른 곳을 가리키면 추가/업데이트:
   ```bash
   git remote remove upstream 2>/dev/null  # 있으면 제거
   git remote add upstream https://github.com/isnbh0/toybox-template.git
   ```

3. 최신 정보 가져오기:
   ```bash
   git fetch upstream main
   ```

## 4단계: 변경사항 분석

적용 전에 무엇이 변경되는지 분석:

1. 파일 수준 diff 요약 표시:
   ```bash
   git diff HEAD upstream/main --stat
   ```

2. 인스턴스별 파일의 충돌 확인:
   ```bash
   git diff HEAD upstream/main -- github.config.json TOYBOX_CONFIG.json README.md package.json index.html public/404.html src/components/AboutPage.tsx
   ```

3. 업데이트할 핵심 파일 확인:
   ```bash
   git diff HEAD upstream/main -- src/lib/artifactLoader.ts src/components/ArtifactGallery.tsx src/components/ArtifactRunner.tsx
   ```

4. 새 파일 확인:
   ```bash
   git diff HEAD upstream/main --diff-filter=A --name-only
   ```
   예상되는 새 파일: `src/components/ErrorBoundary.tsx`, `src/components/ArtifactCard.tsx`, `docs/MIGRATION.md`

분석 결과를 보고해주세요. 예상치 못한 변경사항이 있거나 diff가 매우 크면 진행 전에 물어보세요.

## 5단계: 업데이트 적용 (선택적 머지)

인스턴스별 파일을 덮어쓰지 않도록 선택적으로 변경사항을 적용합니다.

### 5a단계: 새 파일 직접 가져오기 (안전 - 로컬에 없는 파일):
```bash
git checkout upstream/main -- src/components/ErrorBoundary.tsx
git checkout upstream/main -- src/components/ArtifactCard.tsx
git checkout upstream/main -- docs/MIGRATION.md
```

### 5b단계: 핵심 템플릿 파일 업데이트:
```bash
git checkout upstream/main -- src/lib/artifactLoader.ts
git checkout upstream/main -- src/components/ArtifactGallery.tsx
git checkout upstream/main -- src/components/ArtifactRunner.tsx
```

### 5c단계: CLAUDE.md 업데이트 (개발 가이드) - 주의:
CLAUDE.md를 커스터마이즈했다면 수동으로 머지해야 합니다. 먼저 확인:
```bash
git diff HEAD upstream/main -- CLAUDE.md | head -100
```
diff가 추가사항만 있으면 (새 문서 섹션) 업스트림 버전으로 안전하게 교체 가능:
```bash
git checkout upstream/main -- CLAUDE.md
```
로컬 커스터마이즈가 있으면 어떻게 진행할지 물어보세요.

### 5d단계: 이 파일들은 업데이트하지 마세요 (내 버전 유지):
- github.config.json
- TOYBOX_CONFIG.json
- README.md
- package.json (단, 의존성 업데이트가 필요한지 확인)
- index.html
- public/404.html
- src/components/AboutPage.tsx
- src/artifacts/ 내 모든 것

## 6단계: 변경사항 확인

1. git 상태 확인:
   ```bash
   git status
   ```
   업데이트로 인한 수정/새 파일이 표시되어야 합니다.

2. TypeScript 검사 실행:
   ```bash
   npx tsc --noEmit
   ```
   타입 오류가 있으면 중단하고 조사하세요.

3. 린터 실행:
   ```bash
   npm run lint
   ```
   경고는 괜찮고, 오류는 조사가 필요합니다.

4. 빌드 실행:
   ```bash
   npm run build
   ```
   github.config.json에 플레이스홀더가 있으면 설정 검증 실패로 빌드가 실패할 수 있습니다 - 템플릿 저장소에서는 예상되는 현상이지만 설정된 인스턴스에서는 통과해야 합니다.

5. 설정 검증 오류로 빌드 실패했지만 설정된 인스턴스인 경우, 구체적인 오류를 조사하세요.

## 7단계: 로컬 테스트 (빌드 성공 시)

1. 개발 서버 시작:
   ```bash
   npm run dev
   ```

2. 로컬 URL을 보고하고 확인을 요청하세요:
   - 갤러리가 올바르게 로드되는지
   - 기존 아티팩트가 여전히 표시되고 렌더링되는지
   - 필터링/검색이 작동하는지
   - 아티팩트 클릭 시 올바르게 표시되는지

문제가 보고되면 조사하거나 롤백해야 할 수 있습니다.

## 8단계: 업그레이드 커밋

성공적인 확인 후에만:

```bash
git add -A
git commit -m "chore: 최신 toybox-template으로 업그레이드

업데이트 내용:
- 외부 메타데이터 파일 지원 (.metadata.ts, .metadata.json)
- 갤러리의 카드별 에러 바운더리
- 새로운 ErrorBoundary 및 ArtifactCard 컴포넌트
- 업데이트된 문서

출처: https://github.com/isnbh0/toybox-template"
```

## 롤백 절차

어느 단계에서든 문제가 생기면:

### 롤백 옵션 1: 커밋되지 않은 변경사항 되돌리기
```bash
git checkout -- .
git clean -fd  # 추적되지 않는 파일 제거 - 주의
```

### 롤백 옵션 2: 백업 브랜치로 복귀
```bash
git checkout backup-before-template-upgrade-TIMESTAMP
# 필요하면 main 브랜치를 강제로 되돌리기:
git branch -f main backup-before-template-upgrade-TIMESTAMP
git checkout main
```

### 롤백 옵션 3: 저장된 커밋으로 Hard reset
```bash
git reset --hard SAVED_COMMIT_HASH
```

## 주의해야 할 실패 모드

1. **머지 충돌**: 선택적 checkout 방식으로는 발생하지 않아야 하지만, 발생하면 충돌 파일을 보고하세요.

2. **업데이트 후 타입 오류**: 브레이킹 체인지나 누락된 의존성을 의미할 수 있습니다. `npm install`이 필요한지 확인하세요.

3. **빌드 실패**:
   - 설정 검증 오류: github.config.json에 유효한 값이 있는지 확인
   - 모듈 누락 오류: `npm install` 실행
   - Vite 오류: `rm -rf node_modules/.vite && npm run build` 시도

4. **브라우저의 런타임 오류**: 콘솔에서 오류 확인. 커스텀 코드와의 비호환성을 의미할 수 있습니다.

5. **아티팩트 누락**: src/artifacts/가 수정되지 않았는지 확인. artifactLoader.ts가 아티팩트를 올바르게 발견하는지 확인하세요.

## 최종 참고사항

- 이 업그레이드의 모든 변경사항은 하위 호환됩니다
- 아티팩트의 기존 `export const metadata`는 계속 작동합니다
- 새로운 외부 메타데이터 파일 지원은 선택적이며 추가적인 기능입니다
- ArtifactGallery.tsx나 ArtifactRunner.tsx를 로컬에서 커스터마이즈했다면 덮어씌워집니다 - 보존이 필요하면 알려주세요
- 성공적인 업그레이드 후 백업 브랜치 삭제 가능: `git branch -d backup-before-template-upgrade-TIMESTAMP`
``````
