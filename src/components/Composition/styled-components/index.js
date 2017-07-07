import styled, { css } from 'styled-components'

export const StageWrapper = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #000600;
`

const hover = css`
  background-color: #f42b2e;
  transform: scale3d(1.1, 1.1, 1)
`

const active = css`
  transform: scale3d(4.5, 4.5, 1);
`

export const ActivateButton = styled.div`
  backface-visibility: hidden;
  cursor: ${props => (props.isActive ? '' : 'pointer')};
  width: ${props => props.size}px;
  height: ${props => props.size + 1}px;
  position: absolute;
  z-index: 999;

  ${props => (props.isActive ? active : '')};

  &:hover {
    ${props => (props.isActive ? '' : hover)};
  }

  transition: all ${props => (props.isActive ? 1200 : 250)}ms
    cubic-bezier(0.000, 1.020, 0.510, 0.950);
`

export const Stage = styled.div`
  width: 100%;
  height: 100%;
`
