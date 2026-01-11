import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Input from "../components/common/Input";

function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    loginId: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleLogin = async () => {
    // 빈칸 검사
    if (!formData.loginId || !formData.password) {
      alert("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    try {
      // 서버로 로그인 요청 보내기 (POST /user/sign-in)
      const response = await axiosInstance.post("/user/sign-in", formData);

      console.log("로그인 성공", response.data);

      alert("로그인에 성공했습니다!");
      navigate("/home");
    } catch (error) {
      console.error("로그인 실패:", error);

      const errorMessage = error.response?.data?.message || "아이디 또는 비밀번호를 확인해주세요.";
      alert(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 bg-brand-bg">
      <div className="mb-10 text-center flex flex-col items-center">
        {/* 로고 이미지 */}
        <img 
          src="/linking.svg"
          alt="main logo"
          width="80"
          height="80"
          className="block"
        />

        {/* 로고 텍스트 */}
        <h1 className="text-4xl font-bold text-brand-key mb-2 font-logo tracking-tight">
          Linking
        </h1>
      </div>

      <div className="space-y-4">
        {/* 아이디 입력창 */}
        <Input
          label="아이디"
          type="text"
          name="loginId"
          value={formData.loginId}
          onChange={handleChange}
          placeholder="아이디를 입력해주세요"
        />

        {/* 비밀번호 입력창 */}
        <Input
          label="비밀번호"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="비밀번호를 입력해주세요"
        />

        <button
          type="button"
          onClick={handleLogin}
          className="mt-6 w-full bg-brand-key text-brand-bg font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity"
        >
          로그인
        </button>
      </div>

      <div className="mt-6 text-center text-sm text-brand-text-sub">
        계정이 없으신가요?{" "}
        <Link to ="/signup" 
        className="text-brand-key font-bold cursor-pointer hover:underline">
          회원가입
        </Link>
      </div>
    </div>
  );
}

export default LoginPage;
