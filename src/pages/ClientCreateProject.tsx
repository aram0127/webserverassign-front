import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { apiClient } from "../api/client";

export default function ClientCreateProject() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [employmentType, setEmploymentType] = useState("contract");
  const [budget, setBudget] = useState<number | "">("");
  const [deadline, setDeadline] = useState("");
  const [projectCategory, setProjectCategory] = useState("");
  const [planningStatus, setPlanningStatus] = useState("");
  const [meetingRegion, setMeetingRegion] = useState("");
  const [workMethod, setWorkMethod] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState("");
  const [skills, setSkills] = useState(""); // 콤마로 구분하여 입력
  const [fields, setFields] = useState(""); // 콤마로 구분하여 입력
  const [workDescription, setWorkDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsedSkills = skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parsedSkills.length === 0) {
      alert("필요 기술 스택(Skills)을 1개 이상 입력해 주세요.");
      return;
    }

    const payload = {
      title,
      employmentType,
      budget: Number(budget),
      deadline,
      projectCategory,
      planningStatus,
      meetingRegion,
      workMethod,
      estimatedDuration,
      skills: parsedSkills,
      fields: fields
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean),
      workDescription,
    };

    setLoading(true);
    try {
      await apiClient.post("/api/client/projects", payload);
      alert("프로젝트가 성공적으로 등록되었습니다!");
      navigate("/client/projects");
    } catch (error: any) {
      alert(
        error.response?.data?.error?.message ||
          "프로젝트 등록 중 오류가 발생했습니다.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <MainTabBar>
        <MainTab $active={false} onClick={() => navigate("/client/projects")}>
          프로젝트 관리
        </MainTab>
        <MainTab $active={true} onClick={() => navigate("/client/create")}>
          프로젝트 의뢰하기
        </MainTab>
      </MainTabBar>

      <FormWrapper onSubmit={handleSubmit}>
        <SectionTitle>프로젝트 의뢰 정보 입력</SectionTitle>
        <NoticeText>
          * 프리랜서가 프로젝트를 정확히 이해할 수 있도록 상세히 작성해 주세요.
        </NoticeText>

        <FormGrid>
          <FormGroup style={{ gridColumn: "1 / -1" }}>
            <Label>
              프로젝트 제목 <Required>*</Required>
            </Label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="예: 반응형 웹 쇼핑몰 프론트엔드 구축"
            />
          </FormGroup>

          <FormGroup>
            <Label>
              고용 형태 <Required>*</Required>
            </Label>
            <Select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
            >
              <option value="contract">도급(원격)</option>
              <option value="resident">기간제 상주</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>
              {employmentType === "resident" ? "월 급여 (만원)" : "예산 (만원)"}{" "}
              <Required>*</Required>
            </Label>
            <Input
              type="number"
              min="1"
              value={budget}
              onChange={(e) =>
                setBudget(e.target.value ? Number(e.target.value) : "")
              }
              required
              placeholder="예: 500"
            />
          </FormGroup>

          <FormGroup>
            <Label>
              모집 마감일 <Required>*</Required>
            </Label>
            <Input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>
              예상 기간 <Required>*</Required>
            </Label>
            <Input
              type="text"
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(e.target.value)}
              required
              placeholder="예: 3개월, 60일 등"
            />
          </FormGroup>

          <FormGroup>
            <Label>
              카테고리 <Required>*</Required>
            </Label>
            <Select
              value={projectCategory}
              onChange={(e) => setProjectCategory(e.target.value)}
              required
            >
              <option value="">선택하세요</option>
              <option value="웹 개발">웹 개발</option>
              <option value="앱 개발">앱 개발</option>
              <option value="디자인">디자인</option>
              <option value="기획">기획</option>
              <option value="소프트웨어">소프트웨어</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>
              기획 상태 <Required>*</Required>
            </Label>
            <Input
              type="text"
              value={planningStatus}
              onChange={(e) => setPlanningStatus(e.target.value)}
              required
              placeholder="예: 아이디어만 있음, 화면 설계서 보유 등"
            />
          </FormGroup>

          <FormGroup>
            <Label>
              근무/미팅 방식 <Required>*</Required>
            </Label>
            <Input
              type="text"
              value={workMethod}
              onChange={(e) => setWorkMethod(e.target.value)}
              required
              placeholder="예: 주 1회 오프라인 미팅, 전면 원격 등"
            />
          </FormGroup>

          <FormGroup>
            <Label>
              미팅 지역 <Required>*</Required>
            </Label>
            <Input
              type="text"
              value={meetingRegion}
              onChange={(e) => setMeetingRegion(e.target.value)}
              required
              placeholder="예: 서울특별시 강남구, 온라인 등"
            />
          </FormGroup>

          <FormGroup>
            <Label>
              필요 기술 스택 <Required>*</Required>
            </Label>
            <Input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              required
              placeholder="쉼표(,)로 구분 예: React, Node.js"
            />
          </FormGroup>

          <FormGroup>
            <Label>모집 분야</Label>
            <Input
              type="text"
              value={fields}
              onChange={(e) => setFields(e.target.value)}
              placeholder="쉼표(,)로 구분 예: 프론트엔드, 퍼블리셔"
            />
          </FormGroup>
        </FormGrid>

        <FormGroup style={{ marginTop: "20px" }}>
          <Label>
            업무 내용 상세 기술 <Required>*</Required>
          </Label>
          <TextArea
            rows={10}
            value={workDescription}
            onChange={(e) => setWorkDescription(e.target.value)}
            required
            placeholder="프로젝트의 목적, 주요 기능, 우대 사항 등을 상세히 적어주세요."
          />
        </FormGroup>

        <SubmitButtonRow>
          <SubmitButton type="submit" disabled={loading}>
            {loading ? "등록 중..." : "프로젝트 등록하기"}
          </SubmitButton>
        </SubmitButtonRow>
      </FormWrapper>
    </Container>
  );
}

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
  box-sizing: border-box;
`;

const MainTabBar = styled.div`
  display: flex;
  border-bottom: 2px solid #e1e1e1;
  margin-bottom: 30px;
`;

const MainTab = styled.div<{ $active: boolean }>`
  padding: 12px 24px;
  font-size: 16px;
  font-weight: ${(props) => (props.$active ? "bold" : "normal")};
  color: ${(props) => (props.$active ? "#ff6b00" : "#555")};
  border-bottom: ${(props) => (props.$active ? "3px solid #ff6b00" : "none")};
  margin-bottom: -2px;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    color: #ff6b00;
  }
`;

const FormWrapper = styled.form`
  background-color: #fff;
  border: 1px solid #e1e1e1;
  border-radius: 6px;
  padding: 40px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  color: #333;
  margin-top: 0;
  margin-bottom: 10px;
  border-left: 4px solid #ff6b00;
  padding-left: 10px;
`;

const NoticeText = styled.div`
  font-size: 13px;
  color: #666;
  margin-bottom: 30px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: bold;
  color: #333;
`;

const Required = styled.span`
  color: #ff6b00;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  &:focus {
    border-color: #ff6b00;
  }
`;

const Select = styled.select`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  background-color: white;
  &:focus {
    border-color: #ff6b00;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.6;
  outline: none;
  resize: vertical;
  box-sizing: border-box;
  &:focus {
    border-color: #ff6b00;
  }
`;

const SubmitButtonRow = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 30px;
`;

const SubmitButton = styled.button`
  padding: 15px 60px;
  background-color: #ff6b00;
  color: white;
  border: none;
  font-size: 16px;
  font-weight: bold;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #e66000;
  }
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;
