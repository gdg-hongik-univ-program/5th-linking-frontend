<div align="center">
  <br />
  <h1>🔗 LINKING - Frontend</h1>
  <p>
    <strong>수많은 정보와의 싸움에서 이겨라, LINKING</strong>
  </p>
  <br />
  <img src="./public/Banner.png" width="100%" alt="LINKING Banner" /> 
  <br />
</div>

>  **저장된 링크를 효율적으로 관리하고 체계화하는 아카이빙 서비스, LINKING의 프론트엔드 레포지토리입니다.** <br/><br/>
> 여기저기 흩어진 링크들을 폴더와 태그로 정리하고, 링크 간의 관계를 매핑하여 나만의 지식 저장소를 시각적으로 구축합니다.

---

## ✨ 핵심 기능 (Core Features)
1. **👤 회원 관리 (User Management)**
    - 사용자 가입, 로그인 및 인증/인가에 따른 라우트 보호 처리
2. **🔗 링크 아이템 관리 (Item CRUD)**
    - 아티클, 영상 등 다양한 URL 링크의 수집, 조회, 수정, 삭제 인터페이스
3. **📁 폴더 구조화 (Folder Structure)**
    - 저장된 링크들을 계층적 폴더 트리로 화면에 표현하여 직관적인 분류 지원
4. **🏷️ 태그 기능 (Tagging)**
    - 링크에 커스텀 태그를 부여하여 다차원적인 탐색 제공
5. **🕸️ 지식 그래프 관계성 (Knowledge Graph & Relationships)**
    - 노드 간의 관계(Relationship)를 시각화하는 대규모 렌더링을 구현하여, 저장된 정보들이 서로 연결된 모습을 우주처럼 유기적인 그래프망으로 탐색할 수 있습니다.
6. **📅 시간 기반 관리 (Timeline & Calendar Integration)**
    - 날짜 함수(date-fns)를 활용하여, 작성한 문서나 아이디어를 시간의 흐름(마감일, 생성일)에 따라 캘린더 위에서 한눈에 관리할 수 있습니다.
7. **📈 지속적인 성장 동기 부여 (Tier / Dashboard)**
    - 활동 내역에 따른 경험치(XP)와 계급(Tier), 레이더 차트를 활용한 관심사 통계를 모아볼 수 있는 대시보드 화면 제공
8. **🔍 강력한 탐색 액션 (Advanced Actions)**
    - 스와이프 액션, 중요도 및 최신순 필터링, 검색을 병합하여 방대한 아카이브 속에서도 원하는 맥락을 즉시 찾아냅니다.

## 👥 프로젝트 팀원 (Contributors)
<table border="1" cellspacing="0" cellpadding="0" width="600" align="center" style="border-collapse: collapse;">
  <tr>
    <td align="center" width="300" style="padding: 18px;">
      <img src="https://github.com/sy-jerry.png?size=260" width="220" height="220" alt="김상엽"/>
    </td>
    <td align="center" width="300" style="padding: 18px;">
      <img src="https://github.com/seogyeonghan.png?size=260" width="220" height="220" alt="한서경"/>
    </td>
  </tr>
  <tr>
    <td align="center" style="padding: 14px;">
      <b>김상엽</b><br/>
      <a href="[https://github.com/yeop1108](https://github.com/yeop1108)">@yeop1108</a>
    </td>
    <td align="center" style="padding: 14px;">
      <b>한서경</b><br/>
      <a href="[https://github.com/seogyeonghan](https://github.com/seokyun9seokyun9)">@seokyun9</a>
    </td>
  </tr>
  <tr>
    <td align="center" style="padding: 12px;">
      <b>Frontend</b>
    </td>
    <td align="center" style="padding: 12px;">
      <b>Frontend</b>
    </td>
  </tr>
</table>

## ⚙ 기술 스택 (Tech Stack)

| 역할 | 종류 |
| :--- | :--- |
| **Language & Framework** | <img src="https://img.shields.io/badge/JAVASCRIPT-323330?style=flat-square&logo=javascript&logoColor=F7DF1E"/> <img src="https://img.shields.io/badge/REACT-20232a?style=flat-square&logo=react&logoColor=61DAFB"/> <img src="https://img.shields.io/badge/VITE-646CFF?style=flat-square&logo=vite&logoColor=white"/> |
| **Styling** | <img src="https://img.shields.io/badge/TAILWINDCSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white"/> <img src="https://img.shields.io/badge/lucide--react-FF4154?style=flat-square"/> |
| **State Management** | <img src="https://img.shields.io/badge/Zustand-4A332D?style=flat-square&logo=React&logoColor=white"/> |
| **Data Fetching** | <img src="https://img.shields.io/badge/axios-5A29E4?style=flat-square&logo=axios&logoColor=white"/> |
| **Routing** | <img src="https://img.shields.io/badge/REACT%20ROUTER-CA4245?style=flat-square&logo=react-router&logoColor=white"/> |
| **Data Visualization & Animation** | <img src="https://img.shields.io/badge/React%20Force%20Graph%202D-000000?style=flat-square"/> <img src="https://img.shields.io/badge/d3%20force-F9A03C?style=flat-square&logo=d3.js&logoColor=white"/> <img src="https://img.shields.io/badge/recharts-22B5BF?style=flat-square"/> <img src="https://img.shields.io/badge/framer--motion-0055FF?style=flat-square&logo=framer&logoColor=white"/> |
| **Utilities** | <img src="https://img.shields.io/badge/date%20fns-770C56?style=flat-square&logo=datefns&logoColor=white"/> <img src="https://img.shields.io/badge/react%20virtuoso-FF4154?style=flat-square"/> <img src="https://img.shields.io/badge/vite--plugin--svgr-646CFF?style=flat-square&logo=vite&logoColor=white"/> |
| **Code Quality** | <img src="https://img.shields.io/badge/eslint-4B32C3?style=flat-square&logo=eslint&logoColor=white"/> <img src="https://img.shields.io/badge/prettier-F7B93E?style=flat-square&logo=prettier&logoColor=white"/> |

## 📂 프로젝트 구조 (Project Structure)
모듈의 응집도를 높이고 유지보수성을 극대화하기 위해 기능과 목적을 분리한 폴더 아키텍처를 채택했습니다.

```bash
5th-linking-frontend/
├── public/                # 정적 자원 (Logo 등)
├── src/
│   ├── api/               # Axios 인스턴스 및 인터셉터 설정 (auth, axios 등)
│   ├── assets/            # 이미지, 아이콘(SVG) 등 정적 컴포넌트 리소스
│   ├── components/        # 재사용 가능한 기능 및 UI 단위 컴포넌트
│   │   ├── auth/          # 인증 라우트 보호 및 가드
│   │   ├── common/        # 범용성 높은 공통 UI
│   │   └── layout/        # 페이지 전반의 뼈대를 잡는 공통 구조
│   ├── constants/         # 불변 상수 데이터
│   ├── hooks/             # 비즈니스 로직 및 상태 제어를 추상화한 커스텀 훅
│   ├── pages/             # 라우터에서 마운트되는 페이지
│   ├── store/             # Zustand 기반 통합 전역 상태 관리 모듈
│   └── utils/             # 날짜 포맷팅, URL 파싱, 유튜브 ID 추출 등 저수준 유틸리티
├── .eslintrc.js           # 정적 코드 분석 규칙
├── package.json           # 프로젝트 모듈 의존성
└── vite.config.js         # Vite 빌드, 포트 구성 및 SVGR 플러그인 환경
```

## 📌 GitHub Convention

### 📝 Commit
- 작은 단위로 커밋, 유형은 **영어 소문자** 작성

| Type       | Description                 |
| ---------- | --------------------------- |
| `feat`     | 새로운 기능 추가            |
| `fix`      | 버그 수정                   |
| `docs`     | 문서 수정                   |
| `style`    | 코드 스타일 변경 (포맷팅 등)|
| `refactor` | 코드 리팩토링               |
| `test`     | 테스트 코드 추가/수정       |
| `chore`    | 패키지 설정 등 기타 작업    |
| `design`   | UI 디자인 변경              |
| `perf`     | 성능 개선                   |
| `rename`   | 파일/폴더명 변경            |
| `remove`   | 파일 삭제                   |

### 🔀 Branch Convention
- 작성 형식: `유형/#이슈번호-기능명`
- `main`: 안정화된 최종 배포 브랜치
- `develop`: 통합 기능을 검증하는 개발 베이스 브랜치
- `feature/*`: 독립된 새로운 기능 개발
- `hotfix/*`: 배포 환경에서의 긴급 버그 수정

### 📐 Code Convention
- **PascalCase** : 컴포넌트 함수, 파일명
- **camelCase** : 변수, 일반 함수, 커스텀 훅
- **UPPER_CASE** : 전역 상수 옵션
