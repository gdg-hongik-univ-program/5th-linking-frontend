import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Input from "../components/common/Input";
import { VALIDATION } from "../constants/validation"


const SignupPage = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        loginId: "",
        password: "",
        email: "",
        nickName: ""
    });

    const [confirmPassword, setConfirmPassword] = useState("");

    const [statusMessages, setStatusMessages] = useState({
        loginId: "", 
        password: "",
        email: "",
        nickName: ""
    });

    //유효성 검사 함수 
    const validate = (name, value) => {
    let message = "";
    const rule = VALIDATION[name];

      if (rule) {
        const isValid = rule.regex ? rule.regex.test(value) : rule.test(value);
        if (!value) message = ""; // 비어있을 땐 메시지 없음
        else if (!isValid) {
            message = rule.error;
        } else {
            const labels = {
                loginId: "아이디",
                password: "비밀번호",
                email: "이메일",
                nickName: "닉네임"
            };
            message = `사용 가능한 ${labels[name]}입니다!`;
        }
      }
    setStatusMessages(prev => ({ ...prev, [name]: message }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        validate(name, value);
        // 비밀번호를 바꿀 때 확인 칸도 다시 검사
        if (name === "password") validate("confirmPassword", confirmPassword);
  };

    const handleSignup = async() => {
        try {
            const response = await axiosInstance.post("/user/sign-up", formData);
            if (response.status === 201 || response.status === 200) {
                alert("회원가입이 완료되었습니다!");
                navigate("/");
            }
        } catch (error) {
            alert(error.response?.data?.message || "회원가입에 실패했습니다.");
        }
    }; 

    return (
    <div className="min-h-screen flex flex-col justify-center px-6 bg-brand-bg">
        <div className="mb-5 text-center flex flex-col items-center">
        {/* 로고 이미지 */}
        <img 
          src="linking.svg"
          alt="main logo"
          width="60"
          height="60"
          className="block"
        />

        {/* 로고 텍스트 */}
        <h1 className="text-3xl font-bold text-brand-key mb-2 font-logo tracking-tight">
          Linking
        </h1>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-1.5">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Input 
                  label="아이디" 
                  type="text" 
                  name="loginId"
                  value={formData.loginId}
                  onChange={handleChange}
                  message={statusMessages.loginId}
                  placeholder="아이디를 입력해주세요"
                  rightElement={
                  <button
                  type="button"
                  //onClick={handleCheckDuplicate}
                  className="px-4 bg-brand-key text-brand-bg font-bold rounded-xl whitespace-nowrap hover:opacity-90 transition-all text-sm">
                    중복확인</button>
                    }
                />
              </div>
            </div>
          </div>
        <Input 
            label="비밀번호" 
            type="text" 
            value={formData.password}
            onChange={handleChange}
            name="password"
            message={statusMessages.password}
            placeholder="비밀번호를 입력해주세요" 
        />
        <Input 
            label="비밀번호 확인" 
            type="password" 
            value={confirmPassword}
            onChange={ (e)=>setConfirmPassword(e.target.value)}
            placeholder="비밀번호를 다시 입력해주세요" 
            message={formData.password !== confirmPassword && confirmPassword !== "" ? "비밀번호가 일치하지 않습니다." : ""}
        />
        <Input 
            label="이메일" 
            type="text" 
            value={formData.email}
            onChange={handleChange}
            name="email"
            message={statusMessages.email}
            placeholder="이메일을 입력해주세요" />

        <Input 
            label="닉네임" 
            type="text" 
            value={formData.nickName}
            onChange={handleChange}
            name="nickName"
            message={statusMessages.nickName}
            placeholder="닉네임을 입력해주세요" />

        <button
          type="button"
          onClick={handleSignup}
          className="mt-6 w-full bg-brand-key text-brand-bg font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity"
        >
          회원가입
        </button>
      </div>

      <div className="mt-6 text-center text-sm text-brand-text-sub">
        계정이 이미 존재하나요? {" "}
        <Link to ="/" 
        className="text-brand-key font-bold cursor-pointer hover:underline">
          로그인
        </Link>
      </div>

    </div>
    );
    };

export default SignupPage;