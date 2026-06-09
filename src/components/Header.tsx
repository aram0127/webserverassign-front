import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { apiClient } from "../api/client";
import type { User } from "../types";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const checkAuth = async () => {
    try {
      const response = await apiClient.get<{ user: User }>("/api/auth/me");
      setUser(response.data.user);
    } catch (error) {
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await apiClient.post("/api/auth/logout");
      setUser(null);
      alert("로그아웃 되었습니다.");
      navigate("/login");
    } catch (error) {
      alert("로그아웃 중 오류가 발생했습니다.");
    }
  };

  const handleMyPageClick = () => {
    if (!user) {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/login");
      return;
    }

    if (user.role === "developer") {
      navigate("/developer");
    } else if (user.role === "client") {
      navigate("/client");
    }
  };

  return (
    <NavContainer>
      <NavContent>
        <LeftSection>
          <Logo onClick={() => navigate("/projects")}>FREEMOA</Logo>
          <NavButton onClick={handleMyPageClick}>마이페이지</NavButton>
        </LeftSection>

        <RightSection>
          {user ? (
            <AuthButton $isLogout onClick={handleLogout}>
              로그아웃
            </AuthButton>
          ) : location.pathname !== "/login" ? (
            <AuthButton onClick={() => navigate("/login")}>로그인</AuthButton>
          ) : null}
        </RightSection>
      </NavContent>
    </NavContainer>
  );
}

const NavContainer = styled.header`
  width: 100%;
  height: 70px;
  background-color: #ffffff;
  border-bottom: 1px solid #e1e1e1;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const NavContent = styled.div`
  max-width: 1200px;
  height: 100%;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 30px;
`;

const RightSection = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: 800;
  color: #000000;
  cursor: pointer;
  letter-spacing: 0.5px;
  text-align: center;
`;

const NavButton = styled.button`
  background: none;
  border: none;
  font-size: 15px;
  font-weight: 500;
  color: #333333;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f5f5f5;
    color: #ff6b00;
  }
`;

const AuthButton = styled.button<{ $isLogout?: boolean }>`
  background-color: ${(props) => (props.$isLogout ? "#f5f5f5" : "#ff6b00")};
  color: ${(props) => (props.$isLogout ? "#666666" : "#ffffff")};
  border: ${(props) => (props.$isLogout ? "1px solid #ddd" : "none")};
  padding: 8px 20px;
  font-size: 14px;
  font-weight: bold;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${(props) => (props.$isLogout ? "#e1e1e1" : "#e66000")};
  }
`;
