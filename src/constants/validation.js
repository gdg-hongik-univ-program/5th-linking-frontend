export const VALIDATION = {
  loginId: {
    regex: /^[a-z0-9]{5,12}$/,
    error: "5~12자의 영문 소문자와 숫자만 사용할 수 있습니다.",
  },
  password: {
    regex: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[\W_])\S{8,}$/,
    error: "8자 이상이며 영문/숫자/특수문자를 각 1개 이상 포함해야합니다.",
  },
  email: {
    regex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    error: "올바른 이메일 형식이 아닙니다.",
  },
  nickName: {
    regex: /^[a-zA-Z0-9가-힣]{2,10}$/,
    test: (val) => /^[a-zA-Z0-9가-힣]{2,10}$/.test(val.trim()),
    error: "특수문자와 공백을 제외한 2~10자여야합니다.",
  },
};
