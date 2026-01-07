import { useNavigate } from "react-router-dom";
import Input from "../components/common/Input";

function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    console.log("로그인 버튼 클릭됨");
    navigate("/home");
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 bg-brand-bg">
      
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-yellow-400 mb-2">LINKING</h1>
      </div>

      <div className="flex flex-col gap-4">
        <Input label="아이디" type="text" placeholder="아이디를 입력해주세요" />
        <Input label="비밀번호" type="password" placeholder="비밀번호를 입력해주세요" />
        
        {/* 버튼 */}
        <button 
          type="button"
          onClick={handleLogin}
          className="mt-4 w-full bg-brand-key text-brand-bg font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity"
        >
          로그인하기
        </button>
      </div>

      <div className="mt-6 text-center text-sm text-brand-text-sub">
        계정이 없으신가요? <span className="text-brand-key font-bold cursor-pointer">회원가입</span>
      </div>

    </div>
  );
}

export default LoginPage;
