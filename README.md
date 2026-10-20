# Developer Safe Kit

## 개인정보·AI·오픈소스 개발을 한 곳에서 안전하게

Developer Safe Kit은 AI 코딩 시대에 필요한 세 가지 도구를 하나의 오픈소스 프로젝트로 묶습니다.

### 개인정보지우개 (`packages/privacy-eraser`)

글, 로그, 코드, JSON, OCR 텍스트에서 이메일·전화번호·주민번호 형식·카드번호·JWT·API 키·private key를 찾아 마스킹합니다. `--style sticker`를 사용하면 `⟦개인정보⟧`로 바꿀 수 있습니다.

### Model Orchestrator (`packages/model-orchestrator`)

Claude, OpenAI, Gemini 프로필을 안전하게 저장하고 전환합니다. API 키는 출력 시 마스킹되며 `health`, `env`, `--dry-run`을 지원합니다.

### OSS Scout (`packages/oss-scout`)

자연어 요구사항으로 GitHub 오픈소스를 찾고 인기·활동성·문서·라이선스 신호를 기준으로 추천합니다.

## 원칙

- 기본값은 로컬 처리
- 비밀값을 로그에 출력하지 않음
- 실제 적용 전 확인 가능
- 각 도구는 독립적으로 사용할 수 있음

## 테스트

```bash
npm test
```

## License

MIT

This project is independent and is not affiliated with Anthropic, OpenAI, Google, GitHub, or any other provider.

