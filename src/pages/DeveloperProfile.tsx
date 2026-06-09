import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { apiClient } from "../api/client";

interface ProfileData {
  id: number;
  email: string;
  name: string;
  phone: string;
  careerYears: number;
  introduction: string;
  imagePath: string | null;
  tags: string[];
}

export default function DeveloperProfile() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [careerYears, setCareerYears] = useState<number>(0);
  const [introduction, setIntroduction] = useState("");
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);

  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get<{ profile: ProfileData }>(
        "/api/developer/profile",
      );
      const p = response.data.profile;
      setName(p.name || "");
      setPhone(p.phone || "");
      setCareerYears(p.careerYears || 0);
      setIntroduction(p.introduction || "");
      setImagePath(p.imagePath || null);
      setTags(p.tags || []);
    } catch (error) {
      alert("프로필 정보를 가져오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    formData.append("profileImage", files[0]);

    try {
      const response = await apiClient.post<{
        profile: ProfileData;
        imagePath: string;
      }>("/api/developer/profile/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImagePath(response.data.imagePath);
      alert("프로필 이미지가 업데이트되었습니다.");
    } catch (error: any) {
      alert(
        error.response?.data?.error?.message || "이미지 업로드에 실패했습니다.",
      );
    }
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = tagInput.trim();
    if (!trimmed) return;

    if (tags.includes(trimmed)) {
      alert("이미 추가된 태그입니다.");
      setTagInput("");
      return;
    }

    if (tags.length >= 5) {
      alert("검색 태그는 최대 5개까지 등록할 수 있습니다.");
      return;
    }

    setTags([...tags, trimmed]);
    setTagInput("");
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.put("/api/developer/profile", {
        name,
        phone,
        careerYears,
        introduction,
        tags,
      });
      alert("프로필 정보가 성공적으로 저장되었습니다!");
    } catch (error: any) {
      alert(
        error.response?.data?.error?.message ||
          "프로필 저장 중 오류가 발생했습니다.",
      );
    }
  };

  if (loading) return <CentredMessage>로딩 중...</CentredMessage>;

  return (
    <Container>
      <MainTabBar>
        <MainTab $active={false} onClick={() => navigate("/developer/applied")}>
          프로젝트관리
        </MainTab>
        <MainTab $active={true} onClick={() => navigate("/developer/profile")}>
          프로필관리
        </MainTab>
      </MainTabBar>

      <FormWrapper onSubmit={handleSaveProfile}>
        <SectionTitle>기본정보</SectionTitle>

        <FormRow>
          <RowLabel>프로필 이미지</RowLabel>
          <RowContent>
            <AvatarContainer>
              <Avatar
                src={
                  imagePath
                    ? `http://localhost:3000${imagePath}`
                    : "https://via.placeholder.com/120"
                }
                alt="프로필 이미지"
              />
              <ImageControls>
                <UploadButton
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  업데이트
                </UploadButton>
                <DeleteButton type="button" onClick={() => setImagePath(null)}>
                  🗑️
                </DeleteButton>
                <HiddenInput
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                />
              </ImageControls>
            </AvatarContainer>
            <NoticeText>
              * 개인/팀 프로필 등의 이미지를 등록해주세요. 미팅 선정률이 30%
              이상 높아집니다.
            </NoticeText>
          </RowContent>
        </FormRow>

        <FormRow>
          <RowLabel>이름 *</RowLabel>
          <RowContent>
            <TextInput
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </RowContent>
        </FormRow>

        <FormRow>
          <RowLabel>연락처 *</RowLabel>
          <RowContent>
            <TextInput
              type="text"
              placeholder="010-0000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </RowContent>
        </FormRow>

        <FormRow>
          <RowLabel>경력 연차 *</RowLabel>
          <RowContent>
            <SelectInput
              value={careerYears}
              onChange={(e) => setCareerYears(Number(e.target.value))}
            >
              {Array.from({ length: 21 }, (_, i) => (
                <option key={i} value={i}>
                  {i === 0 ? "신입" : `${i}년`}
                </option>
              ))}
            </SelectInput>
          </RowContent>
        </FormRow>

        <FormRow>
          <RowLabel>검색태그</RowLabel>
          <RowContent>
            <TagInputSection onSubmit={handleAddTag}>
              <TagTextInput
                type="text"
                placeholder="태그를 입력하고 추가 버튼을 누르세요 (최대 5개)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
              />
              <TagAddButton type="button" onClick={handleAddTag}>
                추가
              </TagAddButton>
            </TagInputSection>

            <TagContainer>
              {tags.map((tag, index) => (
                <TagItem key={index}>
                  {tag}
                  <TagRemoveBtn
                    type="button"
                    onClick={() => handleRemoveTag(index)}
                  >
                    ×
                  </TagRemoveBtn>
                </TagItem>
              ))}
            </TagContainer>
            <NoticeText>
              태그는 단어 단위로 입력하며, 최대 5개까지 입력하실 수 있습니다.
            </NoticeText>
          </RowContent>
        </FormRow>

        <FormRow>
          <RowLabel>소개글 *</RowLabel>
          <RowContent>
            <TextAreaInput
              rows={6}
              placeholder="자신의 기술 역량이나 경험을 요약해 주세요."
              value={introduction}
              onChange={(e) => setIntroduction(e.target.value)}
              required
            />
            <NoticeText>
              * 고객이 키워드 검색을 통해 개별 견적 요청을 드릴 수 있습니다.
            </NoticeText>
          </RowContent>
        </FormRow>

        <SubmitButtonRow>
          <SaveButton type="submit">저장하기</SaveButton>
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
  margin-bottom: 20px;
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
  background: white;
  border: 1px solid #e1e1e1;
  border-radius: 4px;
  padding: 40px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  color: #333;
  margin-top: 0;
  margin-bottom: 30px;
  border-left: 4px solid #ff6b00;
  padding-left: 10px;
`;

const FormRow = styled.div`
  display: flex;
  margin-bottom: 25px;
  border-bottom: 1px solid #f5f5f5;
  padding-bottom: 20px;

  &:last-of-type {
    border-bottom: none;
  }
`;

const RowLabel = styled.div`
  width: 180px;
  font-size: 15px;
  font-weight: bold;
  color: #444;
  padding-top: 10px;
`;

const RowContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const AvatarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const Avatar = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #ddd;
`;

const ImageControls = styled.div`
  display: flex;
  gap: 8px;
`;

const UploadButton = styled.button`
  padding: 8px 16px;
  border: 1px solid #ff6b00;
  background-color: white;
  color: #ff6b00;
  font-weight: bold;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;

  &:hover {
    background-color: #fff5ee;
  }
`;

const DeleteButton = styled.button`
  padding: 8px 12px;
  border: 1px solid #ddd;
  background-color: white;
  cursor: pointer;
  border-radius: 4px;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const NoticeText = styled.span`
  font-size: 12px;
  color: #0066cc;
`;

const TextInput = styled.input`
  width: 100%;
  max-width: 400px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: #ff6b00;
  }
`;

const SelectInput = styled.select`
  width: 100%;
  max-width: 200px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
  outline: none;

  &:focus {
    border-color: #ff6b00;
  }
`;

const TagInputSection = styled.div`
  display: flex;
  max-width: 500px;
  gap: 8px;
`;

const TagTextInput = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: #ff6b00;
  }
`;

const TagAddButton = styled.button`
  padding: 0 16px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;

  &:hover {
    background-color: #111;
  }
`;

const TagContainer = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 5px;
`;

const TagItem = styled.span`
  background-color: #f1f3f5;
  color: #495057;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #dee2e6;
`;

const TagRemoveBtn = styled.button`
  background: none;
  border: none;
  color: #adb5bd;
  font-size: 16px;
  cursor: pointer;
  padding: 0;
  line-height: 1;

  &:hover {
    color: #495057;
  }
`;

const TextAreaInput = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  resize: vertical;

  &:focus {
    border-color: #ff6b00;
  }
`;

const SubmitButtonRow = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

const SaveButton = styled.button`
  padding: 15px 60px;
  background-color: #ff6b00;
  color: white;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 4px;
  cursor: pointer;

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
