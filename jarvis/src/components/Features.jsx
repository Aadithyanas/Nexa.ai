import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';

const FeaturesContainer = styled.div`
  position: fixed;
  right: 40px;
  bottom: 120px;
  display: flex;
  flex-direction: column;
  gap: 25px;
  z-index: 1000;
`;

const IconButton = styled.div`
  width: 55px;
  height: 55px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    z-index: -1;
    transition: all 0.3s ease;
  }

  &:hover {
    transform: scale(1.1);
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 0.8;
    }
    70% {
      transform: scale(1.3);
      opacity: 0;
    }
    100% {
      transform: scale(1.3);
      opacity: 0;
    }
  }
`;

const FileUploadButton = styled(IconButton)`
  background: #0066ff;
  box-shadow: 0 0 20px rgba(0, 102, 255, 0.5);

  &::before {
    background: rgba(0, 102, 255, 0.2);
    animation: pulse 2s infinite;
  }
`;

const YoutubeButton = styled(IconButton)`
  background: #ff0000;
  box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);

  &::before {
    background: rgba(255, 0, 0, 0.2);
    animation: pulse 2s infinite;
  }
`;

const IconImage = styled.svg`
  width: 28px;
  height: 28px;
  fill: white;
`;

const Features = () => {
  return (
    <FeaturesContainer>
      <FileUploadButton>
        <IconImage viewBox="0 0 24 24">
          <path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"/>
        </IconImage>
      </FileUploadButton>
      <YoutubeButton>
        <IconImage viewBox="0 0 24 24">
          <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
        </IconImage>
      </YoutubeButton>
    </FeaturesContainer>
  );
};

export default Features;
