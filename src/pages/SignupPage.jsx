import Input from "../components/common/Input";

const SignupPage = () => {
    return (
    <div className="min-h-screen flex flex-col justify-center px-6 bg-brand-bg">
      
      <div className="mb-2 text-center">
        <h1 className="text-3xl font-bold text-yellow-400 mb-10">LINKING</h1>
      </div>

      <div className="flex flex-col gap-4">
        <Input label="아이디" type="text" placeholder="아이디를 입력해주세요" />
        <Input label="비밀번호" type="password" placeholder="비밀번호를 입력해주세요" />
        <Input label="닉네임" type="text" placeholder="닉네임을 입력해주세요" />
        <Input label="이메일" type="text" placeholder="이메일을 입력해주세요" />

        <button 
          type="button"
          className="mt-4 w-full bg-brand-key text-brand-bg font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity"
        >
          회원가입하기
        </button>
      </div>

      <div className="mt-6 text-center text-sm text-brand-text-sub">
        계정이 이미 존재하나요? 
        <span className="text-brand-key font-bold cursor-pointer"> 로그인 </span>
      </div>

    </div>
    );
    };

export default SignupPage;