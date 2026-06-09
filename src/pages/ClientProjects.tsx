import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { apiClient } from "../api/client";
import type { Project } from "../types";

interface Applicant {
  id: number;
  developerId: number;
  developerName?: string;
  applicationType: "contract" | "resident";
  proposedAmount: number | null;
  workDays: number | null;
  monthlyRate: number | null;
  headcount: number;
  techCategory: string | null;
  careerLevel: string | null;
  createdAt: string;
  content: string;
}

export default function ClientProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [allApplicants, setAllApplicants] = useState<Applicant[]>([]);

  const [currentProjectId, setCurrentProjectId] = useState<number | null>(null);
  const [modalPage, setModalPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [viewMode, setViewMode] = useState<"overview" | "detail">("overview");
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(
    null,
  );

  const fetchMyProjects = async () => {
    try {
      const response = await apiClient.get<{ items: Project[] }>(
        "/api/client/projects",
      );
      setProjects(response.data.items);
    } catch (error) {
      alert("프로젝트 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProjects();
  }, []);

  const handleOpenDetails = async (project: Project) => {
    setSelectedProject(project);
    setCurrentProjectId(project.id);
    setIsModalOpen(true);
    setModalLoading(true);
    setViewMode("overview");
    setModalPage(1);
    setAllApplicants([]);

    try {
      const response = await apiClient.get<{
        items: Applicant[];
        hasNext: boolean;
      }>(`/api/client/projects/${project.id}/applications?page=1&pageSize=2`);
      setAllApplicants(response.data.items);
      setHasNextPage(response.data.hasNext);
    } catch (error) {
      alert("지원자 정보를 가져오는 데 실패했습니다.");
      setIsModalOpen(false);
    } finally {
      setModalLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (!currentProjectId || !hasNextPage) return;
    const nextPage = modalPage + 1;

    try {
      const response = await apiClient.get<{
        items: Applicant[];
        hasNext: boolean;
      }>(
        `/api/client/projects/${currentProjectId}/applications?page=${nextPage}&pageSize=2`,
      );

      setAllApplicants((prev) => [...prev, ...response.data.items]);
      setModalPage(nextPage);
      setHasNextPage(response.data.hasNext);
    } catch (error) {
      alert("추가 지원자를 불러오는 데 실패했습니다.");
    }
  };

  const handleViewApplicantDetail = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setViewMode("detail");
  };

  if (loading) return <CentredMessage>로딩 중...</CentredMessage>;

  return (
    <Container>
      <MainTabBar>
        <MainTab $active={true} onClick={() => navigate("/client/projects")}>
          프로젝트 관리
        </MainTab>
        <MainTab $active={false} onClick={() => navigate("/client/create")}>
          프로젝트 의뢰하기
        </MainTab>
      </MainTabBar>

      <ContentBox>
        <SectionTitle>내가 의뢰한 프로젝트</SectionTitle>
        <TableDescription>
          등록하신 프로젝트의 현황과 지원자 제안서를 검토할 수 있습니다.
        </TableDescription>

        {projects.length === 0 ? (
          <NoData>등록한 프로젝트가 없습니다.</NoData>
        ) : (
          <ProjectGrid>
            {projects.map((project) => (
              <ProjectCard key={project.id}>
                <CardHeader>
                  <StatusBadge $status={project.status}>
                    {project.statusLabel}
                  </StatusBadge>
                  <ProjectMeta>
                    등록일: {new Date(project.createdAt).toLocaleDateString()}
                  </ProjectMeta>
                </CardHeader>

                <ProjectTitle>{project.title}</ProjectTitle>

                <InfoSummaryGrid>
                  <SummaryItem>
                    <Label>고용 형태</Label>
                    <Value>{project.employmentTypeLabel}</Value>
                  </SummaryItem>
                  <SummaryItem>
                    <Label>예산 / 기간</Label>
                    <Value>
                      {project.budget.toLocaleString()} 만원 /{" "}
                      {project.estimatedDuration}
                    </Value>
                  </SummaryItem>
                  <SummaryItem>
                    <Label>현재 지원자</Label>
                    <Value $highlight={project.applicantCount > 0}>
                      {project.applicantCount} 명
                    </Value>
                  </SummaryItem>
                </InfoSummaryGrid>

                <ActionRow>
                  <DetailButton onClick={() => handleOpenDetails(project)}>
                    상세보기
                  </DetailButton>
                </ActionRow>
              </ProjectCard>
            ))}
          </ProjectGrid>
        )}
      </ContentBox>

      {isModalOpen && selectedProject && (
        <ModalOverlay onClick={() => setIsModalOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {viewMode === "overview"
                  ? "프로젝트 상세 및 지원자 관리"
                  : "지원서 상세 보기"}
              </ModalTitle>
              <CloseButton onClick={() => setIsModalOpen(false)}>×</CloseButton>
            </ModalHeader>

            <ModalBody>
              {modalLoading ? (
                <CentredMessage>데이터를 불러오는 중...</CentredMessage>
              ) : viewMode === "overview" ? (
                <OverviewContainer>
                  <SubSectionTitle>프로젝트 요약</SubSectionTitle>
                  <ModalProjectTitle>{selectedProject.title}</ModalProjectTitle>
                  <SummaryGrid>
                    <SummaryRow>
                      <SLabel>예산 / 기간</SLabel>
                      <SValue>
                        {selectedProject.budget.toLocaleString()} 만원 /{" "}
                        {selectedProject.estimatedDuration}
                      </SValue>
                    </SummaryRow>
                    <SummaryRow>
                      <SLabel>분야 / 카테고리</SLabel>
                      <SValue>
                        {selectedProject.fields.join(", ")} /{" "}
                        {selectedProject.projectCategory}
                      </SValue>
                    </SummaryRow>
                    <SummaryRow style={{ gridColumn: "1 / -1" }}>
                      <SLabel>필요 기술</SLabel>
                      <SValue>{selectedProject.skills.join(", ")}</SValue>
                    </SummaryRow>
                  </SummaryGrid>

                  <Divider />

                  <SubSectionTitle>
                    지원자 리스트{" "}
                    <ApplicantCount>
                      ({selectedProject.applicantCount}명)
                    </ApplicantCount>
                  </SubSectionTitle>

                  {allApplicants.length === 0 ? (
                    <CentredMessage style={{ padding: "20px 0" }}>
                      아직 지원자가 없습니다.
                    </CentredMessage>
                  ) : (
                    <ApplicantList>
                      {allApplicants.map((app, index) => (
                        <ApplicantSimpleRow key={app.id}>
                          <AppRowInfo>
                            <AppRowName>
                              지원자 #{index + 1}{" "}
                              {app.developerName && `(${app.developerName})`}
                            </AppRowName>
                            <AppRowMeta>
                              지원일:{" "}
                              {new Date(app.createdAt).toLocaleDateString()}
                            </AppRowMeta>
                          </AppRowInfo>
                          <ViewDetailBtn
                            onClick={() => handleViewApplicantDetail(app)}
                          >
                            해당 지원서 보기
                          </ViewDetailBtn>
                        </ApplicantSimpleRow>
                      ))}

                      {hasNextPage && (
                        <LoadMoreContainer>
                          <LoadMoreButton onClick={handleLoadMore}>
                            더보기 ▼
                          </LoadMoreButton>
                        </LoadMoreContainer>
                      )}
                    </ApplicantList>
                  )}
                </OverviewContainer>
              ) : (
                selectedApplicant && (
                  <DetailContainer>
                    <AppRowName
                      style={{ fontSize: "18px", marginBottom: "15px" }}
                    >
                      지원자{" "}
                      {selectedApplicant.developerName
                        ? `[${selectedApplicant.developerName}]`
                        : ""}{" "}
                      상세 제안서
                    </AppRowName>

                    <SummaryGrid
                      style={{
                        backgroundColor: "#fff",
                        border: "1px solid #ddd",
                      }}
                    >
                      <SummaryRow>
                        <SLabel>의뢰 형태</SLabel>
                        <SValue>
                          {selectedApplicant.applicationType === "resident"
                            ? "상주 지원"
                            : "도급 지원"}
                        </SValue>
                      </SummaryRow>
                      <SummaryRow>
                        <SLabel>지원일</SLabel>
                        <SValue>
                          {new Date(
                            selectedApplicant.createdAt,
                          ).toLocaleDateString()}
                        </SValue>
                      </SummaryRow>

                      {selectedApplicant.applicationType === "contract" ? (
                        <>
                          <SummaryRow>
                            <SLabel>제안 금액</SLabel>
                            <SValue
                              style={{ color: "#ff6b00", fontWeight: "bold" }}
                            >
                              {(
                                selectedApplicant.proposedAmount || 0
                              ).toLocaleString()}{" "}
                              만원
                            </SValue>
                          </SummaryRow>
                          <SummaryRow>
                            <SLabel>과업 일수</SLabel>
                            <SValue>{selectedApplicant.workDays} 일</SValue>
                          </SummaryRow>
                        </>
                      ) : (
                        <>
                          <SummaryRow>
                            <SLabel>제안 월급여</SLabel>
                            <SValue
                              style={{ color: "#ff6b00", fontWeight: "bold" }}
                            >
                              {(
                                selectedApplicant.monthlyRate || 0
                              ).toLocaleString()}{" "}
                              만원
                            </SValue>
                          </SummaryRow>
                          <SummaryRow>
                            <SLabel>투입 인원</SLabel>
                            <SValue>{selectedApplicant.headcount} 명</SValue>
                          </SummaryRow>
                        </>
                      )}
                    </SummaryGrid>

                    <div style={{ marginTop: "20px" }}>
                      <SLabel style={{ marginBottom: "8px", display: "block" }}>
                        자기소개 및 제안 내용
                      </SLabel>
                      <AppContentBox>{selectedApplicant.content}</AppContentBox>
                    </div>
                  </DetailContainer>
                )
              )}
            </ModalBody>

            <ModalFooter>
              {viewMode === "detail" ? (
                <>
                  <ModalActionBtn
                    onClick={() => setViewMode("overview")}
                    style={{ backgroundColor: "#333" }}
                  >
                    ← 리스트로 돌아가기
                  </ModalActionBtn>
                  <ModalCloseBtn onClick={() => setIsModalOpen(false)}>
                    닫기
                  </ModalCloseBtn>
                </>
              ) : (
                <ModalCloseBtn onClick={() => setIsModalOpen(false)}>
                  닫기
                </ModalCloseBtn>
              )}
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
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

const ContentBox = styled.div`
  background: white;
  border: 1px solid #e1e1e1;
  border-radius: 4px;
  padding: 40px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  color: #333;
  margin-top: 0;
  margin-bottom: 8px;
  font-weight: bold;
`;

const TableDescription = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0 0 30px 0;
`;

const ProjectGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ProjectCard = styled.div`
  border: 1px solid #e1e1e1;
  border-radius: 6px;
  padding: 20px;
  background-color: #fff;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const StatusBadge = styled.span<{ $status?: string }>`
  font-size: 12px;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 4px;
  background-color: ${(props) =>
    props.$status === "closed" ? "#f1f3f5" : "#fff0e6"};
  color: ${(props) => (props.$status === "closed" ? "#495057" : "#ff6b00")};
`;

const ProjectMeta = styled.span`
  font-size: 13px;
  color: #888;
`;

const ProjectTitle = styled.h3`
  font-size: 18px;
  font-weight: bold;
  color: #222;
  margin: 0 0 16px 0;
`;

const InfoSummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  background-color: #fafafa;
  padding: 12px;
  border-radius: 4px;
  text-align: center;
  border: 1px solid #f0f0f0;
  margin-bottom: 16px;
`;

const SummaryItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-right: 1px solid #eee;
  &:last-child {
    border-right: none;
  }
`;

const Label = styled.span`
  font-size: 12px;
  color: #888;
`;

const Value = styled.span<{ $highlight?: boolean }>`
  font-size: 14px;
  font-weight: bold;
  color: ${(props) => (props.$highlight ? "#ff6b00" : "#333")};
`;

const ActionRow = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const DetailButton = styled.button`
  padding: 8px 20px;
  background-color: white;
  border: 1px solid #ddd;
  color: #333;
  font-size: 13px;
  font-weight: bold;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #f5f5f5;
    border-color: #bbb;
  }
`;

const NoData = styled.div`
  text-align: center;
  padding: 60px 0;
  color: #888;
`;

const CentredMessage = styled.div`
  text-align: center;
  padding: 50px 0;
  font-size: 15px;
  color: #666;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
`;

const ModalContent = styled.div`
  background: white;
  width: 100%;
  max-width: 650px;
  border-radius: 6px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  max-height: 85vh;
`;

const ModalHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: bold;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #aaa;
  cursor: pointer;
  &:hover {
    color: #333;
  }
`;

const ModalBody = styled.div`
  padding: 20px;
  overflow-y: auto;
  flex: 1;
  background-color: #f8f9fa;
`;

const OverviewContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const DetailContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const SubSectionTitle = styled.h4`
  font-size: 16px;
  color: #333;
  margin: 0 0 10px 0;
  font-weight: bold;
`;

const ModalProjectTitle = styled.div`
  font-size: 15px;
  color: #0056b3;
  margin-bottom: 15px;
  font-weight: 500;
`;

const ApplicantCount = styled.span`
  color: #ff6b00;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  background-color: #fafafa;
  padding: 15px;
  border-radius: 6px;
`;

const SummaryRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SLabel = styled.span`
  font-size: 12px;
  color: #888;
  font-weight: bold;
`;

const SValue = styled.span`
  font-size: 14px;
  color: #333;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px dashed #ddd;
  margin: 25px 0;
`;

const ApplicantList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ApplicantSimpleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 6px;
`;

const AppRowInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const AppRowName = styled.span`
  font-size: 15px;
  font-weight: bold;
  color: #222;
`;

const AppRowMeta = styled.span`
  font-size: 12px;
  color: #888;
`;

const ViewDetailBtn = styled.button`
  padding: 8px 16px;
  background-color: #ff6b00;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  &:hover {
    background-color: #e66000;
  }
`;

const AppContentBox = styled.div`
  font-size: 14px;
  color: #444;
  line-height: 1.6;
  background-color: #fff;
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 4px;
  white-space: pre-wrap;
  min-height: 150px;
`;

const LoadMoreContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 10px;
`;

const LoadMoreButton = styled.button`
  padding: 10px 30px;
  background-color: white;
  border: 1px solid #ccc;
  color: #333;
  border-radius: 20px;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background-color: #f5f5f5;
  }
`;

const ModalFooter = styled.div`
  padding: 15px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const ModalCloseBtn = styled.button`
  padding: 8px 20px;
  background-color: white;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  &:hover {
    background-color: #f5f5f5;
  }
`;

const ModalActionBtn = styled.button`
  padding: 8px 20px;
  border: none;
  border-radius: 4px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  &:hover {
    opacity: 0.9;
  }
`;
