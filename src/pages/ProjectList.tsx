import { useEffect, useState } from "react";
import styled from "styled-components";
import { apiClient } from "../api/client";
import type { Project } from "../types";
import { useNavigate } from "react-router-dom";

interface ApiResponse {
  items: Project[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export default function ProjectList() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [employmentType, setEmploymentType] = useState<string>("");
  const [sort, setSort] = useState<string>("latest");
  const [loading, setLoading] = useState<boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [modalTab, setModalTab] = useState<"summary" | "detail">("summary");

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        pageSize: 4,
        sort: sort,
      };
      if (employmentType) {
        params.employmentType = employmentType;
      }
      const response = await apiClient.get<ApiResponse>("/api/projects", {
        params,
      });
      setProjects(response.data.items);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("프로젝트 목록을 불러오는 중 오류 발생:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [currentPage, employmentType, sort]);

  const handleOpenDetailModal = async (projectId: number) => {
    setIsModalOpen(true);
    setModalLoading(true);
    setModalTab("summary");
    try {
      const response = await apiClient.get<{ project: Project }>(
        `/api/projects/${projectId}`,
      );
      setSelectedProject(response.data.project);
    } catch (error) {
      alert("프로젝트 상세 정보를 가져오는 데 실패했습니다.");
      setIsModalOpen(false);
    } finally {
      setModalLoading(false);
    }
  };

  const handleFilterChange = (type: string) => {
    setEmploymentType(type);
    setCurrentPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value);
    setCurrentPage(1);
  };

  const handleApplyClick = (projectId: number) => {
    setIsModalOpen(false);
    navigate(`/projects/${projectId}/apply`);
  };

  return (
    <Container>
      <ContentWrapper>
        <Sidebar>
          <FilterTitle>프로젝트 필터</FilterTitle>
          <FilterSection>
            <FilterSubtitle>프로젝트 형태</FilterSubtitle>
            <RadioGroup>
              <Label>
                <input
                  type="radio"
                  name="employmentType"
                  checked={employmentType === ""}
                  onChange={() => handleFilterChange("")}
                />
                전체
              </Label>
              <Label>
                <input
                  type="radio"
                  name="employmentType"
                  checked={employmentType === "contract"}
                  onChange={() => handleFilterChange("contract")}
                />
                도급(원격)
              </Label>
              <Label>
                <input
                  type="radio"
                  name="employmentType"
                  checked={employmentType === "resident"}
                  onChange={() => handleFilterChange("resident")}
                />
                상주
              </Label>
            </RadioGroup>
          </FilterSection>
        </Sidebar>

        <MainContent>
          <HeaderRow>
            <ProjectCount>전체 프로젝트</ProjectCount>
            <SortSelect value={sort} onChange={handleSortChange}>
              <option value="latest">최신 등록 순</option>
              <option value="budget">금액 높은 순</option>
              <option value="deadline">마감 임박 순</option>
              <option value="applicants">지원자 많은 순</option>
            </SortSelect>
          </HeaderRow>

          {loading ? (
            <Message>로딩 중...</Message>
          ) : projects.length === 0 ? (
            <Message>등록된 프로젝트가 없습니다.</Message>
          ) : (
            <ProjectListWrapper>
              {projects.map((project) => (
                <ProjectCard key={project.id}>
                  <CardHeader>
                    <TitleSection>
                      <ProjectTitle
                        onClick={() => handleOpenDetailModal(project.id)}
                      >
                        {project.title}
                      </ProjectTitle>
                      <CategoryTag>{project.projectCategory}</CategoryTag>
                    </TitleSection>
                    <Badges>
                      <Badge $type="type">{project.employmentTypeLabel}</Badge>
                      <Badge $type="status">{project.statusLabel}</Badge>
                    </Badges>
                  </CardHeader>

                  <TechStackRow>
                    {project.skills.map((skill, index) => (
                      <TechTag key={index}>{skill}</TechTag>
                    ))}
                  </TechStackRow>

                  <InfoGrid>
                    <InfoItem>
                      <InfoLabel>
                        {project.budgetKind === "monthlySalary"
                          ? "월 임금"
                          : "예상 비용"}
                      </InfoLabel>
                      <InfoValue>
                        {project.budget.toLocaleString()} 만원
                      </InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel>예상 기간</InfoLabel>
                      <InfoValue>{project.estimatedDuration}</InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel>지원자 수</InfoLabel>
                      <InfoValue>{project.applicantCount} 명</InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel>마감 일정</InfoLabel>
                      <InfoValue $highlight={project.dDay.value <= 3}>
                        {project.dDay.label} ({project.deadline})
                      </InfoValue>
                    </InfoItem>
                  </InfoGrid>

                  <CardActionRow>
                    <CardDetailBtn
                      onClick={() => handleOpenDetailModal(project.id)}
                    >
                      상세보기
                    </CardDetailBtn>
                  </CardActionRow>
                </ProjectCard>
              ))}
            </ProjectListWrapper>
          )}

          <PaginationRow>
            <PageButton
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              &lt; 이전
            </PageButton>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PageNumber
                key={page}
                $active={page === currentPage}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </PageNumber>
            ))}
            <PageButton
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              다음 &gt;
            </PageButton>
          </PaginationRow>
        </MainContent>
      </ContentWrapper>

      {isModalOpen && (
        <ModalOverlay onClick={() => setIsModalOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>프로젝트 상세 정보</ModalTitle>
              <CloseButton onClick={() => setIsModalOpen(false)}>×</CloseButton>
            </ModalHeader>

            {modalLoading || !selectedProject ? (
              <ModalBody>
                <Message>데이터를 로딩하고 있습니다...</Message>
              </ModalBody>
            ) : (
              <>
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

                <ModalBody>
                  {modalTab === "summary" && (
                    <TabContentPanel>
                      <ModalProjectTitle>
                        {selectedProject.title}
                      </ModalProjectTitle>
                      <ModalInlineGrid>
                        <InfoField>
                          <FieldLabel>예상 금액</FieldLabel>
                          <FieldValue $highlight>
                            {selectedProject.budget.toLocaleString()} 만원
                          </FieldValue>
                        </InfoField>
                        <InfoField>
                          <FieldLabel>예상 기간</FieldLabel>
                          <FieldValue>
                            {selectedProject.estimatedDuration}
                          </FieldValue>
                        </InfoField>
                        <InfoField>
                          <FieldLabel>카테고리</FieldLabel>
                          <FieldValue>
                            {selectedProject.projectCategory}
                          </FieldValue>
                        </InfoField>
                        <InfoField>
                          <FieldLabel>고용 형태</FieldLabel>
                          <FieldValue>
                            {selectedProject.employmentTypeLabel}
                          </FieldValue>
                        </InfoField>
                        <InfoField>
                          <FieldLabel>기획 상태</FieldLabel>
                          <FieldValue>
                            {selectedProject.planningStatus}
                          </FieldValue>
                        </InfoField>
                        <InfoField>
                          <FieldLabel>미팅 지역</FieldLabel>
                          <FieldValue>
                            {selectedProject.meetingRegion}
                          </FieldValue>
                        </InfoField>
                        <InfoField>
                          <FieldLabel>필요 기술</FieldLabel>
                          <FieldValue>
                            {selectedProject.skills.join(", ") || "-"}
                          </FieldValue>
                        </InfoField>
                        <InfoField>
                          <FieldLabel>모집 분야</FieldLabel>
                          <FieldValue>
                            {selectedProject.fields.join(", ") || "-"}
                          </FieldValue>
                        </InfoField>
                      </ModalInlineGrid>
                    </TabContentPanel>
                  )}

                  {modalTab === "detail" && (
                    <TabContentPanel>
                      <InfoField>
                        <FieldLabel>업무 내용 기술</FieldLabel>
                        <DescriptionBox>
                          {selectedProject.workDescription}
                        </DescriptionBox>
                      </InfoField>
                      <InfoField style={{ marginTop: "15px" }}>
                        <FieldLabel>근무/미팅 방식</FieldLabel>
                        <DescriptionBox>
                          {selectedProject.workMethod}
                        </DescriptionBox>
                      </InfoField>
                    </TabContentPanel>
                  )}
                </ModalBody>
              </>
            )}

            <ModalFooter>
              <ModalCloseBtn onClick={() => setIsModalOpen(false)}>
                닫기
              </ModalCloseBtn>
              {selectedProject && (
                <ModalActionBtn
                  onClick={() => handleApplyClick(selectedProject.id)}
                >
                  지원하기
                </ModalActionBtn>
              )}
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  background-color: #f9f9f9;
  min-height: calc(100vh - 70px);
  padding: 40px 0;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 30px;
  padding: 0 20px;
  box-sizing: border-box;
`;

const Sidebar = styled.aside`
  width: 260px;
  background: white;
  border: 1px solid #e1e1e1;
  border-radius: 4px;
  height: fit-content;
`;

const FilterTitle = styled.div`
  background-color: #ff6b00;
  color: white;
  padding: 15px 20px;
  font-weight: bold;
  font-size: 16px;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
`;

const FilterSection = styled.div`
  padding: 20px;
`;

const FilterSubtitle = styled.div`
  font-weight: bold;
  font-size: 14px;
  color: #333;
  margin-bottom: 12px;
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #555;
  cursor: pointer;
`;

const MainContent = styled.section`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e1e1e1;
  padding-bottom: 10px;
`;

const ProjectCount = styled.h2`
  font-size: 18px;
  color: #333;
  margin: 0;
`;

const SortSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
  outline: none;
  cursor: pointer;
  &:focus {
    border-color: #ff6b00;
  }
`;

const ProjectListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ProjectCard = styled.div`
  background: white;
  border: 1px solid #e1e1e1;
  border-radius: 4px;
  padding: 25px;
  transition: box-shadow 0.2s ease;
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const ProjectTitle = styled.h3`
  font-size: 18px;
  color: #222;
  margin: 0;
  font-weight: bold;
  cursor: pointer;
  &:hover {
    color: #ff6b00;
    text-decoration: underline;
  }
`;

const CategoryTag = styled.span`
  font-size: 12px;
  color: #ff6b00;
  background-color: #fff0e6;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
`;

const Badges = styled.div`
  display: flex;
  gap: 6px;
`;

const Badge = styled.span<{ $type: "type" | "status" }>`
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
  background-color: ${(props) =>
    props.$type === "type" ? "#f1f3f5" : "#e3faf2"};
  color: ${(props) => (props.$type === "type" ? "#495057" : "#0ca678")};
`;

const TechStackRow = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 20px;
`;

const TechTag = styled.span`
  font-size: 13px;
  color: #666;
  background-color: #f5f5f5;
  padding: 4px 10px;
  border-radius: 4px;
  border: 1px solid #e9e9e9;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  background-color: #fafafa;
  padding: 15px 20px;
  border-radius: 4px;
  text-align: center;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-right: 1px solid #eee;
  &:last-child {
    border-right: none;
  }
`;

const InfoLabel = styled.span`
  font-size: 12px;
  color: #888;
`;

const InfoValue = styled.span<{ $highlight?: boolean }>`
  font-size: 15px;
  font-weight: bold;
  color: ${(props) => (props.$highlight ? "#ff3333" : "#333")};
`;

const CardActionRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
`;

const CardDetailBtn = styled.button`
  padding: 6px 14px;
  background-color: white;
  border: 1px solid #ddd;
  color: #555;
  font-size: 13px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  &:hover {
    background-color: #f5f5f5;
    border-color: #ccc;
  }
`;

const Message = styled.div`
  text-align: center;
  padding: 50px 0;
  color: #888;
  font-size: 15px;
`;

const PaginationRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
`;

const PageButton = styled.button`
  padding: 6px 12px;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: #555;
  &:disabled {
    color: #ccc;
    cursor: not-allowed;
    background-color: #f5f5f5;
  }
`;

const PageNumber = styled.button<{ $active: boolean }>`
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid ${(props) => (props.$active ? "#ff6b00" : "#ddd")};
  background-color: ${(props) => (props.$active ? "#ff6b00" : "white")};
  color: ${(props) => (props.$active ? "white" : "#333")};
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    border-color: #ff6b00;
    color: ${(props) => (props.$active ? "white" : "#ff6b00")};
  }
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

const ModalProjectTitle = styled.h4`
  font-size: 18px;
  color: #222;
  margin: 0 0 15px 0;
  font-weight: bold;
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
  background-color: #fff;
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
  background-color: #fff;
  color: #333;
  border: 1px solid #ddd;
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
