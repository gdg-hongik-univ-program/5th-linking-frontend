export const VALIDATION = {
  loginId: {
    regex: /^[a-z0-9]{5,12}$/,
    error: "5~12자의 영문 소문자와 숫자만 사용할 수 있습니다."
  },
  password: {
    regex: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
    error: "8자 이상, 영문/숫자/특수문자를 포함해야 합니다."
  },
  email: {
    regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    error: "올바른 이메일 형식이 아닙니다."
  },
  nickName: {
    test: (val) => val.length >= 2 && val.length <= 10,
    error: "닉네임은 2~10자 사이여야 합니다."
  }
};