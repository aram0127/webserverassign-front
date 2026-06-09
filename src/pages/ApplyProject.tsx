import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { apiClient } from "../api/client";
import type { Project } from "../types";

export default function ApplyProject() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const [workDays, setWorkDays] = useState<number | "">("");
  const [proposedAmount, setProposedAmount] = useState<number | "">("");
  const [techCategory, setTechCategory] = useState("");
  const [careerLevel, setCareerLevel] = useState("");
  const [headcount, setHeadcount] = useState<number | "">(1);
  const [monthlyRate, setMonthlyRate] = useState<number | "">("");
  const [content, setContent] = useState("");

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await apiClient.get<{ project: Project }>(
          `/api/projects/${projectId}`,
        );
        setProject(response.data.project);
      } catch (error) {
        alert("프로젝트 정보를 불러올 수 없습니다.");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const phoneRegex =
      /(01[016789])[-.\s]?(\d{3,4})[-.\s]?(\d{4})|(0[2-9][0-9]?)[-.\s]?(\d{3,4})[-.\s]?(\d{4})/;

    if (emailRegex.test(content) || phoneRegex.test(content)) {
      alert(
        "⚠️ 지원 내용에 이메일이나 전화번호 등 연락처 정보를 포함할 수 없습니다.\n수정 후 다시 시도해 주세요.",
      );
      return;
    }

    try {
      const payload: any = { content };

      if (project?.employmentType === "contract") {
        payload.type = "contract";
        payload.workDays = Number(workDays);
        payload.proposedAmount = Number(proposedAmount);
      } else {
        payload.type = "resident";
        payload.techCategory = techCategory;
        payload.careerLevel = careerLevel;
        payload.headcount = Number(headcount);
        payload.monthlyRate = Number(monthlyRate);
      }

      await apiClient.post(`/api/projects/${projectId}/applications`, payload);
      alert("프로젝트 지원이 성공적으로 완료되었습니다!");

      navigate("/developer/applied");
    } catch (error: any) {
      alert(
        error.response?.data?.error?.message ||
          "지원서 제출 중 오류가 발생했습니다.",
      );
    }
  };

  if (loading) return <CentredMessage>로딩 중...</CentredMessage>;
  if (!project) return null;

  return (
    <Container>
      <PageTitle>프로젝트 지원하기</PageTitle>

      <SummaryBox>
        <ProjectLabel>지원 대상 프로젝트</ProjectLabel>
        <ProjectTitle>{project.title}</ProjectTitle>
        <ProjectMeta>
          고용 형태: <strong>{project.employmentTypeLabel}</strong> | 예산:{" "}
          <strong>{project.budget.toLocaleString()} 만원</strong> | 기간:{" "}
          <strong>{project.estimatedDuration}</strong>
        </ProjectMeta>
      </SummaryBox>

      <FormWrapper onSubmit={handleSubmit}>
        <SectionTitle>제안 정보 입력</SectionTitle>
        <NoticeText>
          * 지원하는 프로젝트의 고용 형태({project.employmentTypeLabel})에 맞는
          필수 정보를 입력해 주세요.
        </NoticeText>

        {project.employmentType === "contract" && (
          <FormGrid>
            <FormGroup>
              <Label>
                제안 금액 (만원) <Required>*</Required>
              </Label>
              <Input
                type="number"
                min="0"
                value={proposedAmount}
                onChange={(e) =>
                  setProposedAmount(
                    e.target.value ? Number(e.target.value) : "",
                  )
                }
                required
                placeholder="예: 500"
              />
            </FormGroup>
            <FormGroup>
              <Label>
                과업 일수 (일) <Required>*</Required>
              </Label>
              <Input
                type="number"
                min="1"
                value={workDays}
                onChange={(e) =>
                  setWorkDays(e.target.value ? Number(e.target.value) : "")
                }
                required
                placeholder="예: 30"
              />
            </FormGroup>
          </FormGrid>
        )}

        {project.employmentType === "resident" && (
          <FormGrid>
            <FormGroup>
              <Label>
                기술 분야 <Required>*</Required>
              </Label>
              <Select
                value={techCategory}
                onChange={(e) => setTechCategory(e.target.value)}
                required
              >
                <option value="">분야를 선택하세요</option>
                <option value="개발자">개발자</option>
                <option value="디자이너">디자이너</option>
                <option value="기획자">기획자</option>
                <option value="기타 포지션">기타 포지션</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label>
                경력 수준 <Required>*</Required>
              </Label>
              <Select
                value={careerLevel}
                onChange={(e) => setCareerLevel(e.target.value)}
                required
              >
                <option value="">선택하세요</option>
                <option value="초급">초급(1년이상 ~ 5년미만)</option>
                <option value="중급">중급(5년이상 ~ 10년미만)</option>
                <option value="고급">고급(10년 이상)</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label>
                투입 인원 (명) <Required>*</Required>
              </Label>
              <Input
                type="number"
                min="1"
                value={headcount}
                onChange={(e) =>
                  setHeadcount(e.target.value ? Number(e.target.value) : "")
                }
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>
                월 급여 제안 (만원) <Required>*</Required>
              </Label>
              <Input
                type="number"
                min="0"
                value={monthlyRate}
                onChange={(e) =>
                  setMonthlyRate(e.target.value ? Number(e.target.value) : "")
                }
                required
                placeholder="예: 600"
              />
            </FormGroup>
          </FormGrid>
        )}

        <SectionTitle style={{ marginTop: "30px" }}>
          지원 내용 작성
        </SectionTitle>
        <FormGroup>
          <Label>
            제안서 및 자기소개 <Required>*</Required>
          </Label>
          <NoticeText style={{ marginBottom: "10px", color: "#ff3333" }}>
            ※ 이메일, 전화번호 등 연락처 정보를 기재할 경우 정책에 의해 지원이
            제한됩니다.
          </NoticeText>
          <TextArea
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            placeholder="프로젝트 수행에 대한 구체적인 계획, 관련 경험, 포부 등을 자유롭게 작성해 주세요."
          />
        </FormGroup>

        <ButtonGroup>
          <CancelButton type="button" onClick={() => navigate(-1)}>
            취소
          </CancelButton>
          <SubmitButton type="submit">지원서 제출하기</SubmitButton>
        </ButtonGroup>
      </FormWrapper>
    </Container>
  );
}

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  box-sizing: border-box;
`;

const PageTitle = styled.h2`
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
  border-left: 5px solid #ff6b00;
  padding-left: 10px;
`;

const SummaryBox = styled.div`
  background-color: #f8f9fa;
  border: 1px solid #e1e1e1;
  border-radius: 6px;
  padding: 20px;
  margin-bottom: 30px;
`;

const ProjectLabel = styled.div`
  font-size: 13px;
  color: #ff6b00;
  font-weight: bold;
  margin-bottom: 5px;
`;

const ProjectTitle = styled.h3`
  font-size: 18px;
  color: #222;
  margin: 0 0 10px 0;
`;

const ProjectMeta = styled.div`
  font-size: 14px;
  color: #555;
`;

const FormWrapper = styled.form`
  background-color: #fff;
  border: 1px solid #e1e1e1;
  border-radius: 6px;
  padding: 30px;
`;

const SectionTitle = styled.h4`
  font-size: 18px;
  color: #333;
  margin: 0 0 10px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
`;

const NoticeText = styled.div`
  font-size: 13px;
  color: #666;
  margin-bottom: 20px;
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
  color: #444;
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

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
`;

const CancelButton = styled.button`
  padding: 12px 24px;
  background-color: white;
  border: 1px solid #ddd;
  color: #555;
  font-size: 15px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  &:hover {
    background-color: #f5f5f5;
  }
`;

const SubmitButton = styled.button`
  padding: 12px 30px;
  background-color: #ff6b00;
  color: white;
  border: none;
  font-size: 15px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  &:hover {
    background-color: #e66000;
  }
`;

const CentredMessage = styled.div`
  text-align: center;
  padding: 100px 0;
  font-size: 16px;
  color: #666;
`;
