import styled, { css } from 'styled-components';

export const StageWrapper = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #000600;
`;

export const Stage = styled.div`
  width: 100%;
  height: 100%;
`;

const active = css`
  transform: scale3d(4.5, 4.5, 1);
`;

const centered = css`
  margin: auto;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
`;

const buttonHover = css`
  background-color: #f42b2e;
  transform: scale3d(1.1, 1.1, 1);
`;

export const ActivateButton = styled.div`
  backface-visibility: hidden;
  ${centered};

  cursor: ${props => (props.isActive ? '' : 'pointer')};
  width: ${props => props.size}px;
  height: ${props => props.size + 1}px;
  z-index: 100;

  ${props => (props.isActive ? active : '')};

  ${props => (props.isHover && !props.isActive ? buttonHover : '')};

  transition: all ${props => (props.isActive ? 1200 : 250)}ms cubic-bezier(0, 1.02, 0.51, 0.95);
  touch-action: manipulation;
`;

const skipHover = css`
  color: #f42b2e;
  opacity: 1;
`;

export const SkipIntro = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  cursor: pointer;
  opacity: 0.5;
  ${props => (props.isHover ? skipHover : '')};
  transition: all 250ms;

  touch-action: manipulation;
`;
