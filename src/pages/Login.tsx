import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { apiClient } from "../api/client";
import type { User } from "../types";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiClient.post<{ user: User }>("/api/auth/login", {
        email,
        password,
      });

      const user = response.data.user;

      if (user.role === "developer") {
        alert("개발자 로그인 완료");
      } else {
        alert("의뢰인 로그인 완료");
      }

      navigate("/projects");
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "로그인에 실패했습니다.");
    }
  };

  return (
    <Container>
      <LoginBox>
        <Logo>로그인</Logo>

        <Form onSubmit={handleLogin}>
          <InputGroup>
            <Input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </InputGroup>
          <InputGroup>
            <Input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </InputGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <LoginButton type="submit">로그인</LoginButton>
        </Form>
      </LoginBox>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
`;

const LoginBox = styled.div`
  width: 100%;
  max-width: 480px;
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.h1`
  text-align: center;
  color: #ff6b00;
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 30px;
  letter-spacing: 1px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const InputGroup = styled.div`
  width: 100%;
`;

const Input = styled.input`
  width: 100%;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 15px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #ff6b00;
  }
`;

const ErrorMessage = styled.div`
  color: #ff3333;
  font-size: 14px;
`;

const LoginButton = styled.button`
  width: 100%;
  padding: 16px;
  background-color: #ff6b00;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 10px;

  &:hover {
    background-color: #e66000;
  }
`;
