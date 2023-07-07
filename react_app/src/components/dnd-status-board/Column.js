import React from 'react';
import styled from '@xstyled/styled-components';
import { colors } from '@atlaskit/theme';
import { grid, borderRadius } from '../styles/constants';
import { Draggable } from 'react-beautiful-dnd';
import AppList from '../styles/list';
import Title from '../styles/title';

const Container = styled.div`
  margin: ${grid}px;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border-top-left-radius: ${borderRadius}px;
  border-top-right-radius: ${borderRadius}px;
  background-color: ${({ isDragging }) =>
    isDragging ? colors.G50 : colors.N30};
  transition: background-color 0.2s ease;
  &:hover {
    background-color: ${colors.G50};
  }
`;

const Column = (props) => {
  const title = props.title;
  var apps = []
  Object.keys(props.apps).forEach((key) => {
    apps.push(props.apps[key]);

    });
    console.log(apps)
  const index = props.index;
  return (
    <Draggable draggableId={title} index={index}>
      {(provided, snapshot) => (
        <Container ref={provided.innerRef} {...provided.draggableProps}>
          {/* <Header isDragging={snapshot.isDragging}> */}
            <Header>
                <h1
                style={{color:'black'}}>{title}</h1>
            
            {/* <Title
              isDragging={snapshot.isDragging}
              {...provided.dragHandleProps}
              aria-label={`${title}`}
            >
              {title}
            </Title> */}
          </Header>
          <AppList
            listId={title}
            listType="QUOTE"
            style={{
              backgroundColor: snapshot.isDragging ? colors.G50 : null,
            }}
            apps={apps}
            internalScroll={props.isScrollable}
            isCombineEnabled={Boolean(props.isCombineEnabled)}
            useClone={Boolean(props.useClone)}
          />
        </Container>
      )}
    </Draggable>
  );
};

export default Column;
