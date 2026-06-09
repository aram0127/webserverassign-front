import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { apiClient } from "../api/client";
import type { Project } from "../types";

interface Application {
  id: number;
  projectId: number;
  projectTitle: string;
  applicationType: "contract" | "resident";
  proposedAmount: number | null;
  workDays: number | null;
  monthlyRate: number | null;
  headcount: number;
  techCategory: string | null;
  careerLevel: string | null;
  applicantCount: number;
  createdAt: string;
  content: string;
}

interface DetailedApplicationResponse {
  application: Application;
  project: Project;
}

export default function AppliedProjects() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [detailedData, setDetailedData] =
    useState<DetailedApplicationResponse | null>(null);

  const [modalTab, setModalTab] = useState<"summary" | "detail">("summary");

  const [isViewingApplication, setIsViewingApplication] =
    useState<boolean>(false);

  const fetchAppliedProjects = async () => {
    try {
      const response = await apiClient.get<{ items: Application[] }>(
        "/api/developer/applications",
      );
      setApplications(response.data.items);
    } catch (error) {
      alert("지원 내역을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppliedProjects();
  }, []);

  const handleOpenDetails = async (applicationId: number) => {
    setIsModalOpen(true);
    setModalLoading(true);
    setModalTab("summary");
    setIsViewingApplication(false);
    try {
      const response = await apiClient.get<DetailedApplicationResponse>(
        `/api/developer/applications/${applicationId}`,
      );
      setDetailedData(response.data);
    } catch (error) {
      alert("상세 정보를 가져오는 데 실패했습니다.");
      setIsModalOpen(false);
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) return <CentredMessage>로딩 중...</CentredMessage>;

  return (
    <Container>
      <MainTabBar>
        <MainTab $active={true} onClick={() => navigate("/developer/applied")}>
          프로젝트관리
        </MainTab>
        <MainTab $active={false} onClick={() => navigate("/developer/profile")}>
          프로필관리
        </MainTab>
      </MainTabBar>

      <ContentBox>
        <SectionTitle>지원한 프로젝트 관리</SectionTitle>
        <TableDescription>
          내가 지원한 프로젝트의 진행 상황과 제출한 지원서를 확인할 수 있습니다.
        </TableDescription>

        {applications.length === 0 ? (
          <NoData>지원한 프로젝트가 존재하지 않습니다.</NoData>
        ) : (
          <ProjectGrid>
            {applications.map((app) => (
              <ProjectCard key={app.id}>
                <CardHeader>
                  <StatusBadge>지원완료</StatusBadge>
                  <AppliedDate>
                    지원일: {new Date(app.createdAt).toLocaleDateString()}
                  </AppliedDate>
                </CardHeader>

                <ProjectTitle>{app.projectTitle}</ProjectTitle>

                <InfoSummaryGrid>
                  <SummaryItem>
                    <Label>
                      {app.applicationType === "resident"
                        ? "월 급여"
                        : "제안 견적"}
                    </Label>
                    <Value>
                      {app.applicationType === "resident"
                        ? `${(app.monthlyRate || 0).toLocaleString()} 만원`
                        : `${(app.proposedAmount || 0).toLocaleString()} 만원`}
                    </Value>
                  </SummaryItem>
                  <SummaryItem>
                    <Label>
                      {app.applicationType === "resident"
                        ? "투입 인원"
                        : "과업 일수"}
                    </Label>
                    <Value>
                      {app.applicationType === "resident"
                        ? `${app.headcount} 명`
                        : `${app.workDays || 0} 일`}
                    </Value>
                  </SummaryItem>
                  <SummaryItem>
                    <Label>총 지원자 수</Label>
                    <Value>{app.applicantCount} 명</Value>
                  </SummaryItem>
                </InfoSummaryGrid>

                <ActionRow>
                  <DetailButton onClick={() => handleOpenDetails(app.id)}>
                    상세보기
                  </DetailButton>
                </ActionRow>
              </ProjectCard>
            ))}
          </ProjectGrid>
        )}
      </ContentBox>

      {isModalOpen && (
        <ModalOverlay onClick={() => setIsModalOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {isViewingApplication
                  ? "내가 제출한 지원서 상세 정보"
                  : "프로젝트 정보"}
              </ModalTitle>
              <CloseButton onClick={() => setIsModalOpen(false)}>×</CloseButton>
            </ModalHeader>

            {modalLoading || !detailedData ? (
              <ModalBody>
                <CentredMessage>데이터를 로딩하고 있습니다...</CentredMessage>
              </ModalBody>
            ) : (
              <>
                {!isViewingApplication && (
                  <ModalTabRow>
                    <InnerTab
                      $active={modalTab === "summary"}
                      onClick={() => setModalTab("summary")}
                    >
                      프로젝트 요약
                    </InnerTab>
                    <InnerTab
                      $active={modalTab === "detail"}
                      onClick={() => setModalTab("detail")}
                    >
                      상세보기
                    </InnerTab>
                  </ModalTabRow>
                )}

                <ModalBody>
                  {isViewingApplication ? (
                    <TabContentPanel>
                      <ProjectTitleLarge
                        style={{
                          color: "#ff6b00",
                          fontSize: "15px",
                          marginBottom: "5px",
                        }}
                      >
                        [지원서 제출 내역]
                      </ProjectTitleLarge>
                      <ProjectTitleLarge>
                        {detailedData.project.title}
                      </ProjectTitleLarge>

                      <ModalInlineGrid>
                        <InfoField>
                          <FieldLabel>지원 의뢰 형태</FieldLabel>
                          <FieldValue>
                            {detailedData.application.applicationType ===
                            "resident"
                              ? "기간제 상주 지원"
                              : "도급(원격) 지원"}
                          </FieldValue>
                        </InfoField>
                        <InfoField>
                          <FieldLabel>지원 등록일</FieldLabel>
                          <FieldValue>
                            {new Date(
                              detailedData.application.createdAt,
                            ).toLocaleString()}
                          </FieldValue>
                        </InfoField>

                        {detailedData.application.applicationType ===
                          "contract" && (
                          <>
                            <InfoField>
                              <FieldLabel>제안 금액</FieldLabel>
                              <FieldValue $highlight>
                                {(
                                  detailedData.application.proposedAmount || 0
                                ).toLocaleString()}{" "}
                                만원
                              </FieldValue>
                            </InfoField>
                            <InfoField>
                              <FieldLabel>제안 과업 일수</FieldLabel>
                              <FieldValue>
                                {detailedData.application.workDays} 일
                              </FieldValue>
                            </InfoField>
                          </>
                        )}

                        {detailedData.application.applicationType ===
                          "resident" && (
                          <>
                            <InfoField>
                              <FieldLabel>기술 분야 / 경력 등급</FieldLabel>
                              <FieldValue>
                                {detailedData.application.techCategory} /{" "}
                                {detailedData.application.careerLevel}
                              </FieldValue>
                            </InfoField>
                            <InfoField>
                              <FieldLabel>투입 인원</FieldLabel>
                              <FieldValue>
                                {detailedData.application.headcount} 명
                              </FieldValue>
                            </InfoField>
                            <InfoField>
                              <FieldLabel>제안 월 급여</FieldLabel>
                              <FieldValue $highlight>
                                {(
                                  detailedData.application.monthlyRate || 0
                                ).toLocaleString()}{" "}
                                만원
                              </FieldValue>
                            </InfoField>
                          </>
                        )}
                      </ModalInlineGrid>

                      <InfoField style={{ marginTop: "15px" }}>
                        <FieldLabel>제출한 지원 제안서 내용</FieldLabel>
                        <DescriptionBox
                          style={{
                            minHeight: "150px",
                            backgroundColor: "#fff",
                            border: "1px solid #ddd",
                          }}
                        >
                          {detailedData.application.content}
                        </DescriptionBox>
                      </InfoField>
                    </TabContentPanel>
                  ) : (
                    <>
                      {modalTab === "summary" && (
                        <TabContentPanel>
                          <ProjectTitleLarge>
                            {detailedData.project.title}
                          </ProjectTitleLarge>
                          <ModalInlineGrid>
                            <InfoField>
                              <FieldLabel>예상 금액</FieldLabel>
                              <FieldValue $highlight>
                                {detailedData.project.budget.toLocaleString()}{" "}
                                만원
                              </FieldValue>
                            </InfoField>
                            <InfoField>
                              <FieldLabel>예상 기간</FieldLabel>
                              <FieldValue>
                                {detailedData.project.estimatedDuration}
                              </FieldValue>
                            </InfoField>
                            <InfoField>
                              <FieldLabel>카테고리</FieldLabel>
                              <FieldValue>
                                {detailedData.project.projectCategory}
                              </FieldValue>
                            </InfoField>
                            <InfoField>
                              <FieldLabel>고용 형태</FieldLabel>
                              <FieldValue>
                                {detailedData.project.employmentTypeLabel}
                              </FieldValue>
                            </InfoField>
                            <InfoField>
                              <FieldLabel>기획 상태</FieldLabel>
                              <FieldValue>
                                {detailedData.project.planningStatus}
                              </FieldValue>
                            </InfoField>
                            <InfoField>
                              <FieldLabel>미팅 지역</FieldLabel>
                              <FieldValue>
                                {detailedData.project.meetingRegion}
                              </FieldValue>
                            </InfoField>
                            <InfoField>
                              <FieldLabel>관련 기술 (Tech Stack)</FieldLabel>
                              <FieldValue>
                                {detailedData.project.skills.join(", ") || "-"}
                              </FieldValue>
                            </InfoField>
                            <InfoField>
                              <FieldLabel>모집 분야</FieldLabel>
                              <FieldValue>
                                {detailedData.project.fields.join(", ") || "-"}
                              </FieldValue>
                            </InfoField>
                          </ModalInlineGrid>
                        </TabContentPanel>
                      )}

                      {modalTab === "detail" && (
                        <TabContentPanel>
                          <InfoField>
                            <FieldLabel>업무 내용</FieldLabel>
                            <DescriptionBox>
                              {detailedData.project.workDescription}
                            </DescriptionBox>
                          </InfoField>
                          <InfoField style={{ marginTop: "15px" }}>
                            <FieldLabel>근무 방식</FieldLabel>
                            <DescriptionBox>
                              {detailedData.project.workMethod}
                            </DescriptionBox>
                          </InfoField>
                        </TabContentPanel>
                      )}
                    </>
                  )}
                </ModalBody>
              </>
            )}

            <ModalFooter>
              {isViewingApplication ? (
                <>
                  <ModalActionBtn
                    onClick={() => setIsViewingApplication(false)}
                    style={{ backgroundColor: "#333" }}
                  >
                    ← 프로젝트 정보 보기
                  </ModalActionBtn>
                  <ModalCloseBtn
                    onClick={() => setIsModalOpen(false)}
                    style={{
                      backgroundColor: "#fff",
                      color: "#333",
                      border: "1px solid #ddd",
                    }}
                  >
                    닫기
                  </ModalCloseBtn>
                </>
              ) : (
                <>
                  <ModalCloseBtn
                    onClick={() => setIsModalOpen(false)}
                    style={{
                      backgroundColor: "#fff",
                      color: "#333",
                      border: "1px solid #ddd",
                    }}
                  >
                    닫기
                  </ModalCloseBtn>
                  <ModalActionBtn onClick={() => setIsViewingApplication(true)}>
                    나의 지원서 보기
                  </ModalActionBtn>
                </>
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
  margin-bottom: 30px;
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
  transition: box-shadow 0.2s ease;
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const StatusBadge = styled.span`
  font-size: 12px;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 4px;
  background-color: #e3faf2;
  color: #0ca678;
`;

const AppliedDate = styled.span`
  font-size: 13px;
  color: #888;
`;

const ProjectTitle = styled.h3`
  font-size: 17px;
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

const Value = styled.span`
  font-size: 14px;
  font-weight: bold;
  color: #333;
`;

const ActionRow = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const DetailButton = styled.button`
  padding: 8px 16px;
  background-color: white;
  border: 1px solid #ddd;
  color: #333;
  font-size: 13px;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #f5f5f5;
    border-color: #ccc;
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
  max-width: 600px;
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
  font-size: 16px;
  font-weight: bold;
  color: #222;
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

const ModalTabRow = styled.div`
  display: flex;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
`;

const InnerTab = styled.div<{ $active: boolean }>`
  flex: 1;
  text-align: center;
  padding: 12px 0;
  font-size: 14px;
  font-weight: ${(props) => (props.$active ? "bold" : "normal")};
  color: ${(props) => (props.$active ? "#ff6b00" : "#666")};
  background-color: ${(props) => (props.$active ? "#ffffff" : "transparent")};
  border-bottom: ${(props) => (props.$active ? "2px solid #ff6b00" : "none")};
  cursor: pointer;
`;

const ModalBody = styled.div`
  padding: 20px;
  overflow-y: auto;
  flex: 1;
`;

const TabContentPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ProjectTitleLarge = styled.h4`
  font-size: 17px;
  color: #222;
  margin: 0 0 15px 0;
  font-weight: bold;
  line-height: 1.4;
`;

const ModalInlineGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  background: #fafafa;
  padding: 15px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
`;

const InfoField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FieldLabel = styled.span`
  font-size: 12px;
  color: #888;
  font-weight: 500;
`;

const FieldValue = styled.span<{ $bold?: boolean; $highlight?: boolean }>`
  font-size: 14px;
  font-weight: ${(props) =>
    props.$bold || props.$highlight ? "bold" : "normal"};
  color: ${(props) => (props.$highlight ? "#ff6b00" : "#333")};
`;

const DescriptionBox = styled.div`
  width: 100%;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 4px;
  background-color: #fafafa;
  font-size: 13px;
  color: #444;
  line-height: 1.6;
  min-height: 80px;
  white-space: pre-wrap;
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
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  &:hover {
    background-color: #f5f5f5;
  }
`;

const ModalActionBtn = styled.button`
  padding: 8px 20px;
  background-color: #ff6b00;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  &:hover {
    background-color: #e66000;
  }
`;
